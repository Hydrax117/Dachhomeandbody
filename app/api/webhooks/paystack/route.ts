/**
 * POST /api/webhooks/paystack
 *
 * Handles Paystack webhook events.
 * Verifies the HMAC-SHA512 signature before processing.
 *
 * The verify page is the primary order creation path.
 * This webhook acts as a reliable fallback (e.g. if the user closes the
 * browser before the verify page loads).
 *
 * Requirements: 4.4, 4.5
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  verifyWebhookSignature,
  verifyPayment,
  type PaystackWebhookEvent,
} from "@/lib/paystack"
import { createOrderFromPayment, type OrderMetadata } from "@/lib/orders"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature") ?? ""

  const isValid = await verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    console.warn("Paystack webhook: invalid signature")
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event)
        break
      case "charge.failed":
        await handleChargeFailed(event)
        break
    }
  } catch (error) {
    console.error(`Paystack webhook error (${event.event}):`, error)
  }

  return Response.json({ received: true })
}

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { reference, amount, metadata, customer } = event.data

  // Double-verify to prevent replay attacks
  const verified = await verifyPayment(reference)
  if (verified.status !== "success") return

  // Delegate to shared order creation (idempotent — skips if already created by verify page)
  await createOrderFromPayment({
    reference,
    amountKobo: amount,
    metadata: (metadata ?? {}) as OrderMetadata,
    customerEmail: customer.email,
  })
}

async function handleChargeFailed(event: PaystackWebhookEvent) {
  const { reference } = event.data

  const existingOrder = await prisma.order.findFirst({
    where: { paymentReference: reference },
  })

  if (existingOrder) {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: { paymentStatus: "FAILED" },
    })
  }
}
