/**
 * GET /api/cron/process-scheduled
 *
 * Runs every hour. Picks up any PENDING ScheduledCampaign whose scheduledAt
 * has passed and sends it.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const due = await prisma.$queryRaw<Array<{
    id: string; subject: string; html: string; sendTo: string
  }>>`
    SELECT id, subject, html, "sendTo"
    FROM "ScheduledCampaign"
    WHERE status = 'PENDING' AND "scheduledAt" <= NOW()
    ORDER BY "scheduledAt" ASC
    LIMIT 5
  `

  if (due.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const campaign of due) {
    try {
      // Mark as sending so parallel runs don't double-send
      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign" SET status = 'SENDING', "updatedAt" = NOW()
        WHERE id = ${campaign.id} AND status = 'PENDING'
      `

      // Collect recipients
      const emailSet = new Set<string>()
      if (campaign.sendTo === "all" || campaign.sendTo === "subscribers") {
        const subs = await prisma.$queryRaw<Array<{ email: string }>>`
          SELECT email FROM "NewsletterSubscriber"
        `
        subs.forEach((s) => emailSet.add(s.email))
      }
      if (campaign.sendTo === "all" || campaign.sendTo === "customers") {
        const users = await prisma.user.findMany({
          where: { role: "CUSTOMER" }, select: { email: true },
        })
        users.forEach((u) => { if (u.email) emailSet.add(u.email) })
      }

      const recipients = Array.from(emailSet)
      let sentCount = 0

      const BATCH = 50
      for (let i = 0; i < recipients.length; i += BATCH) {
        const batch = recipients.slice(i, i + BATCH)
        const results = await Promise.allSettled(
          batch.map((to) => resend.emails.send({ from: FROM_EMAIL, to, subject: campaign.subject, html: campaign.html }))
        )
        sentCount += results.filter((r) => r.status === "fulfilled").length
        if (i + BATCH < recipients.length) await new Promise((r) => setTimeout(r, 1000))
      }

      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign"
        SET status = 'SENT', "sentCount" = ${sentCount}, "updatedAt" = NOW()
        WHERE id = ${campaign.id}
      `
      processed++
      console.log(`[Cron] Scheduled campaign sent: ${campaign.id} → ${sentCount} recipients`)
    } catch (err) {
      console.error(`[Cron] Failed campaign ${campaign.id}:`, err)
      await prisma.$executeRaw`
        UPDATE "ScheduledCampaign" SET status = 'PENDING', "updatedAt" = NOW()
        WHERE id = ${campaign.id} AND status = 'SENDING'
      `
    }
  }

  return NextResponse.json({ processed })
}
