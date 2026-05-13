/**
 * GET /api/payment/verify?reference=...
 *
 * Verifies a Paystack transaction by reference.
 * Called after the customer returns from the Paystack payment page.
 *
 * Requirements: 4.4, 4.5
 */

import { NextRequest } from "next/server"
import { verifyPayment, fromKobo } from "@/lib/paystack"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return Response.json(
      { error: "reference query parameter is required" },
      { status: 400 }
    )
  }

  try {
    const result = await verifyPayment(reference)

    // Check if an order was already created for this reference (via webhook)
    const order = await prisma.order.findFirst({
      where: { paymentReference: reference },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
      },
    })

    return Response.json({
      status: result.status,
      reference: result.reference,
      amount: fromKobo(result.amount),
      currency: result.currency,
      paidAt: result.paidAt,
      order: order ?? null,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return Response.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
