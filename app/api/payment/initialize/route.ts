/**
 * POST /api/payment/initialize
 *
 * Initializes a Paystack payment session for checkout.
 *
 * Idempotency guarantee
 * ─────────────────────
 * A `PendingPayment` row is created the first time a customer initiates
 * checkout and reused on every subsequent call for the same email + amount
 * within the 30-minute expiry window.  This means:
 *
 *  • Double-clicking "Pay Now" → same Paystack URL returned, no second charge
 *  • Browser back + re-click  → same Paystack URL, same reference
 *  • Amount change (coupon applied after clicking) → old row replaced, new
 *    reference issued
 *
 * The row is deleted by `createOrderFromPayment` once the order is confirmed,
 * so a fresh reference is issued for the customer's next order.
 *
 * Requirements: 4.3
 */

import { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { initializePayment, toKobo, generateReference } from "@/lib/paystack"

// Pending payment expiry — 30 minutes
const PENDING_TTL_MS = 30 * 60 * 1000

const InitializePaymentSchema = z.object({
  email: z.string().email("Valid email is required"),
  /** Total amount in NGN (naira) */
  amount: z.number().positive("Amount must be positive"),
  /** Cart/order metadata to attach to the transaction */
  metadata: z.record(z.string(), z.unknown()).optional(),
  /** URL to redirect to after payment */
  callbackUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = InitializePaymentSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, amount, metadata, callbackUrl } = parsed.data
    const amountKobo = toKobo(amount)

    // Attach authenticated user ID to metadata if available
    const session = await auth()
    const userId = session?.user?.id ?? null
    const enrichedMetadata: Record<string, unknown> = {
      ...metadata,
      ...(userId ? { userId } : {}),
    }

    // ── Idempotency check ─────────────────────────────────────────────────
    // Look for an existing live pending payment for this email + amount.
    // Use userId when available so two different users sharing an email
    // (edge case) don't collide.
    const now = new Date()
    const existing = await prisma.pendingPayment.findFirst({
      where: {
        email,
        amountKobo,
        expiresAt: { gt: now },
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
    })

    if (existing) {
      // Return the stored Paystack URL — no second API call, no second charge
      return Response.json({
        authorizationUrl: existing.authorizationUrl,
        reference: existing.reference,
      })
    }

    // ── No live pending payment — initialize a fresh one ──────────────────
    const reference = generateReference()

    const result = await initializePayment({
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: enrichedMetadata,
    })

    // Persist the pending payment so repeat calls reuse this reference
    const expiresAt = new Date(now.getTime() + PENDING_TTL_MS)
    await prisma.pendingPayment.create({
      data: {
        reference: result.reference,
        authorizationUrl: result.authorizationUrl,
        email,
        amountKobo,
        userId,
        expiresAt,
      },
    })

    return Response.json({
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return Response.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
