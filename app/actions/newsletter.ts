"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendNewsletterWelcomeEmail } from "@/lib/email"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type NewsletterState = {
  success?: boolean
  error?: string
}

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get("email") })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email" }
  }

  const { email } = parsed.data

  try {
    // Use raw SQL so this works even before `prisma generate` has picked up
    // the new NewsletterSubscriber model. Once `prisma generate` runs after
    // the migration, you can replace this with:
    //   await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } })
    await prisma.$executeRaw`
      INSERT INTO "NewsletterSubscriber" (id, email, "subscribedAt")
      VALUES (gen_random_uuid(), ${email}, NOW())
      ON CONFLICT (email) DO NOTHING
    `
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  // Send welcome email non-blocking — don't fail subscription if email fails
  sendNewsletterWelcomeEmail(email).catch(() => {})

  return { success: true }
}
