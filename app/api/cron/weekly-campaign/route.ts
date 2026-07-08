/**
 * GET /api/cron/weekly-campaign
 *
 * Automated weekly product email campaign.
 * - Triggered by Vercel Cron (see vercel.json)
 * - Gemini writes the subject, headline, and body copy
 * - Automatically picks top best-selling / featured products
 * - Sends to all newsletter subscribers + registered customers
 *
 * Protected by CRON_SECRET env var — Vercel sets this header automatically.
 */

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { buildCampaignEmail } from "@/lib/campaign-email"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

// ── Auth ───────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  return authHeader === `Bearer ${cronSecret}`
}

// ── Gemini copy writer ─────────────────────────────────────────────────────

async function generateEmailCopy(products: Array<{ name: string; price: number; category: string }>): Promise<{
  subject: string
  headline: string
  bodyText: string
}> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // Fallback copy if Gemini is not configured
    return {
      subject: "This week's picks from DACH Home & Body",
      headline: "Curated for You This Week",
      bodyText: "Discover our handpicked selection of luxury fragrances and natural skincare — crafted to elevate your everyday rituals.",
    }
  }

  const ai = new GoogleGenAI({ apiKey })
  const productList = products.map((p) => `• ${p.name} (${p.category}) — ₦${p.price.toLocaleString("en-NG")}`).join("\n")

  const prompt = `You are a luxury brand copywriter for DACH Home & Body, a premium home fragrance and natural skincare brand based in Abuja, Nigeria.

Write email campaign copy for a weekly product newsletter. The featured products this week are:
${productList}

Write:
1. A compelling email subject line (max 60 characters, no emojis, luxury tone)
2. A headline for the email body (max 8 words, elegant, serif-friendly)
3. A short body paragraph (2-3 sentences, warm and aspirational, speak to the reader's lifestyle)

Respond ONLY in this exact JSON format, no markdown:
{"subject":"...","headline":"...","bodyText":"..."}`

  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: { maxOutputTokens: 256, temperature: 0.8 },
    })
    const response = await chat.sendMessage({ message: [{ text: prompt }] })
    const text = response.text?.trim() ?? ""
    const parsed = JSON.parse(text) as { subject: string; headline: string; bodyText: string }
    if (!parsed.subject || !parsed.headline || !parsed.bodyText) throw new Error("Incomplete response")
    return parsed
  } catch (err) {
    console.error("[Cron] Gemini copy generation failed:", err)
    return {
      subject: "This week's picks from DACH Home & Body",
      headline: "Curated for You This Week",
      bodyText: "Discover our handpicked selection of luxury fragrances and natural skincare — crafted to elevate your everyday rituals.",
    }
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Pick top 6 products (best sellers first, then featured, then newest)
    const products = await prisma.product.findMany({
      where: { deleted: false, stock: { gt: 0 } },
      orderBy: [{ featured: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        name: true,
        price: true,
        slug: true,
        images: true,
        category: { select: { name: true } },
      },
    })

    if (products.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No products in stock" })
    }

    const productData = products.map((p) => ({
      name: p.name,
      price: p.price,
      slug: p.slug,
      image: p.images[0] ?? "",
      category: p.category.name,
    }))

    // 2. Generate email copy with Gemini
    const copy = await generateEmailCopy(productData)

    // 3. Collect all recipient emails
    const emailSet = new Set<string>()

    const [subscribers, customers] = await Promise.all([
      prisma.$queryRaw<Array<{ email: string }>>`SELECT email FROM "NewsletterSubscriber"`,
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: { email: true },
      }),
    ])

    subscribers.forEach((s) => emailSet.add(s.email))
    customers.forEach((c) => { if (c.email) emailSet.add(c.email) })

    const recipients = Array.from(emailSet)

    if (recipients.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No recipients" })
    }

    // 4. Build HTML once
    const html = buildCampaignEmail({
      headline: copy.headline,
      bodyText: copy.bodyText,
      ctaLabel: "Shop All Products",
      ctaUrl: "/shop",
      products: productData,
    })

    // 5. Send in batches of 50
    const BATCH_SIZE = 50
    let sentCount = 0

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)
      const sends = batch.map((to) =>
        resend.emails.send({ from: FROM_EMAIL, to, subject: copy.subject, html })
      )
      const results = await Promise.allSettled(sends)
      sentCount += results.filter((r) => r.status === "fulfilled").length

      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    console.log(`[Cron] Weekly campaign sent: ${sentCount}/${recipients.length} — "${copy.subject}"`)

    return NextResponse.json({
      success: true,
      sentCount,
      totalRecipients: recipients.length,
      subject: copy.subject,
    })
  } catch (error) {
    console.error("[Cron] Weekly campaign error:", error)
    return NextResponse.json({ error: "Campaign failed" }, { status: 500 })
  }
}
