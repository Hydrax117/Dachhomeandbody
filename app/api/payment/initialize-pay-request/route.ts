/**
 * POST /api/payment/initialize-pay-request
 *
 * Dedicated endpoint for "Pay For Me" payments.
 *
 * Instead of relying on Paystack to round-trip metadata (which it does
 * unreliably), we embed the PaymentRequest token directly in the Paystack
 * reference: PAY-[token]-[random]
 *
 * On verify, createOrderFromPayment extracts the token from the reference
 * string and fulfils the request — zero metadata dependency.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { initializePayment, toKobo } from "@/lib/paystack"
import {
  getPaymentRequestByToken,
  checkPaymentRequestPayable,
} from "@/lib/payment-requests"
import crypto from "crypto"

const Schema = z.object({
  token: z.string().min(1),
  payerEmail: z.string().email(),
})

/** Build a Paystack reference that encodes the payment request token. */
function buildPayRequestReference(token: string): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase()
  // Format: PAY-[first 24 chars of token]-[random]
  // Paystack reference max length is 100 chars — this is ~37 chars, well within limit
  return `PAY-${token.slice(0, 24)}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = Schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, payerEmail } = parsed.data

    // Verify the request is still payable
    const { payable, reason } = await checkPaymentRequestPayable(token)
    if (!payable) {
      const messages: Record<string, string> = {
        not_found: "This payment link does not exist.",
        already_paid: "This payment link has already been used.",
        cancelled: "This payment link has been cancelled.",
        expired: "This payment link has expired.",
      }
      return NextResponse.json(
        { error: messages[reason ?? "not_found"] ?? "This link is no longer valid." },
        { status: 410 }
      )
    }

    const paymentRequest = await getPaymentRequestByToken(token)
    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 })
    }

    // Build a reference that encodes the token — extracted server-side on verify
    const reference = buildPayRequestReference(token)

    const result = await initializePayment({
      email: payerEmail,
      amount: toKobo(paymentRequest.total),
      reference,
      callback_url: `${process.env.NEXTAUTH_URL ?? ""}/checkout/verify`,
      // Keep metadata minimal — we use the reference to identify the request, not metadata
      metadata: {
        payerEmail,
        // Still include order metadata as fallback for the order creation
        items: paymentRequest.items,
        shippingAddress: paymentRequest.shippingAddress,
        guestEmail: paymentRequest.requesterEmail,
        guestName: paymentRequest.requesterName ?? null,
        discount: paymentRequest.discount,
        shippingCost: paymentRequest.shippingCost,
        couponCode: paymentRequest.couponCode ?? null,
        couponId: paymentRequest.couponId ?? null,
        userId: paymentRequest.userId ?? null,
      },
    })

    return NextResponse.json({
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference,
    })
  } catch (error) {
    console.error("Pay-request initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment. Please try again." },
      { status: 500 }
    )
  }
}
