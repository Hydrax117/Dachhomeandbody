"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { z } from "zod"
import { buildCampaignEmail } from "@/lib/campaign-email"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

// ── Schemas ────────────────────────────────────────────────────────────────

const campaignSchema = z.object({
  subject:    z.string().min(3, "Subject is required"),
  headline:   z.string().min(3, "Headline is required"),
  bodyText:   z.string().optional(),
  ctaLabel:   z.string().default("Shop Now"),
  ctaUrl:     z.string().default("/shop"),
  productIds: z.array(z.string()).min(1, "Select at least one product"),
  sendTo:     z.enum(["all", "subscribers", "customers"]).default("all"),
  // optional ISO datetime string — if set, campaign is saved for later (not sent now)
  scheduledAt: z.string().optional(),
})

export type CampaignState = {
  errors?: Partial<Record<keyof z.infer<typeof campaignSchema> | "_form", string[]>>
  success?: boolean
  sentCount?: number
  scheduled?: boolean
}

// ── Shared helpers ─────────────────────────────────────────────────────────

async function collectRecipients(sendTo: "all" | "subscribers" | "customers"): Promise<string[]> {
  const emailSet = new Set<string>()

  if (sendTo === "all" || sendTo === "subscribers") {
    const subs = await prisma.$queryRaw<Array<{ email: string }>>`
      SELECT email FROM "NewsletterSubscriber"
    `
    subs.forEach((s) => emailSet.add(s.email))
  }

  if (sendTo === "all" || sendTo === "customers") {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { email: true },
    })
    customers.forEach((c) => { if (c.email) emailSet.add(c.email) })
  }

  return Array.from(emailSet)
}

async function sendToRecipients(
  recipients: string[],
  subject: string,
  html: string
): Promise<number> {
  const BATCH_SIZE = 50
  let sentCount = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const sends = batch.map((to) =>
      resend.emails.send({ from: FROM_EMAIL, to, subject, html })
    )
    const results = await Promise.allSettled(sends)
    sentCount += results.filter((r) => r.status === "fulfilled").length

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  return sentCount
}

// ── Send / Schedule campaign action ───────────────────────────────────────

export async function sendCampaignAction(
  _prev: CampaignState,
  formData: FormData
): Promise<CampaignState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const productIds = formData.getAll("productIds").map(String)

  const raw = {
    subject:     formData.get("subject"),
    headline:    formData.get("headline"),
    bodyText:    formData.get("bodyText") || undefined,
    ctaLabel:    formData.get("ctaLabel") || "Shop Now",
    ctaUrl:      formData.get("ctaUrl") || "/shop",
    productIds,
    sendTo:      formData.get("sendTo") || "all",
    scheduledAt: formData.get("scheduledAt") || undefined,
  }

  const parsed = campaignSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CampaignState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  const { subject, headline, bodyText, ctaLabel, ctaUrl, sendTo, scheduledAt } = parsed.data

  // Fetch selected products
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deleted: false },
    select: { id: true, name: true, slug: true, price: true, images: true },
    orderBy: { name: "asc" },
  })

  if (products.length === 0) {
    return { errors: { productIds: ["No valid products found"] } }
  }

  const productData = products.map((p) => ({
    name: p.name, price: p.price, slug: p.slug, image: p.images[0] ?? "",
  }))

  const html = buildCampaignEmail({ headline, bodyText, ctaLabel, ctaUrl, products: productData })

  // ── Scheduled: save to DB and return early ─────────────────────────────
  if (scheduledAt) {
    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return { errors: { scheduledAt: ["Scheduled time must be in the future"] } }
    }

    await prisma.$executeRaw`
      INSERT INTO "ScheduledCampaign"
        (id, subject, headline, "bodyText", "ctaLabel", "ctaUrl", "productIds",
         "sendTo", html, "scheduledAt", status, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${subject}, ${headline}, ${bodyText ?? null}, ${ctaLabel}, ${ctaUrl},
        ${JSON.stringify(productIds)}::jsonb, ${sendTo}, ${html},
        ${scheduledDate}, 'PENDING', NOW(), NOW()
      )
    `
    return { success: true, scheduled: true }
  }

  // ── Send now ───────────────────────────────────────────────────────────
  const recipients = await collectRecipients(sendTo)

  if (recipients.length === 0) {
    return { errors: { _form: ["No recipients found."] } }
  }

  const sentCount = await sendToRecipients(recipients, subject, html)
  return { success: true, sentCount }
}

// ── Delete scheduled campaign ──────────────────────────────────────────────

export async function deleteScheduledCampaignAction(id: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.$executeRaw`
    DELETE FROM "ScheduledCampaign" WHERE id = ${id} AND status = 'PENDING'
  `
  return {}
}
