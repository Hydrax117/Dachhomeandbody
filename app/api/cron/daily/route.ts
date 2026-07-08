/**
 * GET /api/cron/daily
 *
 * Runs once every day at 8am UTC via Vercel Cron (Hobby plan compatible).
 *
 * On every run:
 *   1. Process any scheduled campaigns whose time has passed today
 *
 * On Mondays only:
 *   2. Send the automated weekly product email (AI-generated copy)
 *
 * Protected by CRON_SECRET — Vercel adds the Authorization header automatically.
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
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get("authorization") === `Bearer ${secret}`
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function collectRecipients(sendTo: string): Promise<string[]> {
  const emailSet = new Set<string>()

  if (sendTo === "all" || sendTo === "subscribers") {
    const subs = await prisma.$queryRaw<Array<{ email: string }>>`
      SELECT email FROM "NewsletterSubscriber"
    `
    subs.forEach((s) => emailSet.add(s.email))
  }

  if (sendTo === "all" || sendTo === "customers") {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { email: true },
    })
    users.forEach((u) => { if (u.email) emailSet.add(u.email) })
  }

  return Array.from(emailSet)
}

async function sendBatched(recipients: string[], subject: string, html: string): Promise<number> {
  const BATCH = 50
  let sent = 0
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map((to) => resend.emails.send({ from: FROM_EMAIL, to, subject, html }))
    )
    sent += results.filter((r) => r.status === "fulfilled").length
    if (i + BATCH < recipients.length) await new Promise((r) => setTimeout(r, 1000))
  }
  return sent
}

// ── 1. Process scheduled campaigns ────────────────────────────────────────

async function processScheduled(): Promise<{ processed: number }> {
  const due = await prisma.$queryRaw<Array<{
    id: string; subject: string; html: string; sendTo: string
  }>>`
    SELECT id, subject, html, "sendTo"
    FROM "ScheduledCampaign"
    WHERE status = 'PENDING' AND "scheduledAt" <= NOW()
    ORDER BY "scheduledAt" ASC
    LIMIT 10
  `

  let processed = 0

  for (const campaign of due) {
    try {
      // Lock row to prevent double-send
      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign"
        SET status = 'SENDING', "updatedAt" = NOW()
        WHERE id = ${campaign.id} AND status = 'PENDING'
      `

      const recipients = await collectRecipients(campaign.sendTo)
      const sentCount = await sendBatched(recipients, campaign.subject, campaign.html)

      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign"
        SET status = 'SENT', "sentCount" = ${sentCount}, "updatedAt" = NOW()
        WHERE id = ${campaign.id}
      `
      processed++
      console.log(`[Cron] Scheduled campaign sent: ${campaign.id} → ${sentCount} recipients`)
    } catch (err) {
      console.error(`[Cron] Scheduled campaign failed ${campaign.id}:`, err)
      // Reset so it retries tomorrow
      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign"
        SET status = 'PENDING', "updatedAt" = NOW()
        WHERE id = ${campaign.id} AND status = 'SENDING'
      `
    }
  }

  return { processed }
}

// ── 2. Weekly AI campaign (Mondays only) ──────────────────────────────────

async function generateCopy(products: Array<{ name: string; price: number; category: string }>) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      subject: "This week's picks from DACH Home & Body",
      headline: "Curated for You This Week",
      bodyText: "Discover our handpicked selection of luxury fragrances and natural skincare — crafted to elevate your everyday rituals.",
    }
  }

  const ai = new GoogleGenAI({ apiKey })
  const productList = products
    .map((p) => `• ${p.name} (${p.category}) — ₦${p.price.toLocaleString("en-NG")}`)
    .join("\n")

  const prompt = `You are a luxury brand copywriter for DACH Home & Body, a premium home fragrance and natural skincare brand based in Abuja, Nigeria.

Write email campaign copy for a weekly product newsletter. The featured products this week are:
${productList}

Write:
1. A compelling email subject line (max 60 characters, no emojis, luxury tone)
2. A headline for the email body (max 8 words, elegant, serif-friendly)
3. A short body paragraph (2-3 sentences, warm and aspirational)

Respond ONLY in this exact JSON format, no markdown:
{"subject":"...","headline":"...","bodyText":"..."}`

  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: { maxOutputTokens: 256, temperature: 0.8 },
    })
    const response = await chat.sendMessage({ message: [{ text: prompt }] })
    const parsed = JSON.parse(response.text?.trim() ?? "")
    if (!parsed.subject || !parsed.headline || !parsed.bodyText) throw new Error("Incomplete")
    return parsed as { subject: string; headline: string; bodyText: string }
  } catch {
    return {
      subject: "This week's picks from DACH Home & Body",
      headline: "Curated for You This Week",
      bodyText: "Discover our handpicked selection of luxury fragrances and natural skincare — crafted to elevate your everyday rituals.",
    }
  }
}

async function sendWeeklyCampaign(): Promise<{ skipped?: boolean; reason?: string; sentCount?: number; subject?: string }> {
  const products = await prisma.product.findMany({
    where: { deleted: false, stock: { gt: 0 } },
    orderBy: [{ featured: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      name: true, price: true, slug: true, images: true,
      category: { select: { name: true } },
    },
  })

  if (products.length === 0) return { skipped: true, reason: "No products in stock" }

  const productData = products.map((p) => ({
    name: p.name, price: p.price, slug: p.slug,
    image: p.images[0] ?? "", category: p.category.name,
  }))

  const copy = await generateCopy(productData)
  const html = buildCampaignEmail({
    headline: copy.headline,
    bodyText: copy.bodyText,
    ctaLabel: "Shop All Products",
    ctaUrl: "/shop",
    products: productData,
  })

  const recipients = await collectRecipients("all")
  if (recipients.length === 0) return { skipped: true, reason: "No recipients" }

  const sentCount = await sendBatched(recipients, copy.subject, html)
  console.log(`[Cron] Weekly campaign sent: ${sentCount}/${recipients.length} — "${copy.subject}"`)
  return { sentCount, subject: copy.subject }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // Always: process any scheduled campaigns due today
  try {
    results.scheduled = await processScheduled()
  } catch (err) {
    console.error("[Cron] processScheduled error:", err)
    results.scheduledError = String(err)
  }

  // Mondays only (UTC day = 1): send the weekly AI campaign
  const todayUTC = new Date().getUTCDay() // 0=Sun, 1=Mon
  if (todayUTC === 1) {
    try {
      results.weekly = await sendWeeklyCampaign()
    } catch (err) {
      console.error("[Cron] weekly campaign error:", err)
      results.weeklyError = String(err)
    }
  } else {
    results.weekly = { skipped: true, reason: "Not Monday" }
  }

  return NextResponse.json({ ok: true, ...results })
}
