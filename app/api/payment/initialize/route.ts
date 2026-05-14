/**
 * POST /api/payment/initialize
 *
 * Initializes a Paystack payment session for checkout.
 * Returns the authorization URL to redirect the customer to Paystack.
 *
 * Requirements: 4.3
 */

import { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { initializePayment, toKobo, generateReference } from "@/lib/paystack"

const InitializePaymentSchema = z.object({
  email: z.string().email("Valid email is required"),
  /** Total amount in NGN (naira) */
  amount: z.number().positive("Amount must be positive"),
  /** Optional: cart/order metadata to attach to the transaction */
  metadata: z.record(z.string(), z.unknown()).optional(),
  /** Optional: URL to redirect to after payment */
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

    // Attach authenticated user ID to metadata if available
    const session = await auth()
    const enrichedMetadata: Record<string, unknown> = {
      ...metadata,
      ...(session?.user?.id ? { userId: session.user.id } : {}),
    }

    const reference = generateReference()

    const result = await initializePayment({
      email,
      amount: toKobo(amount),
      reference,
      callback_url: callbackUrl,
      metadata: enrichedMetadata,
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
