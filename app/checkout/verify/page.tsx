/**
 * /checkout/verify
 *
 * Paystack redirects here after payment with ?reference=...
 * Verifies the payment, creates the order (idempotent), clears the cart,
 * and redirects to the order confirmation page.
 *
 * Requirements: 4.4, 4.5
 */

import { redirect } from "next/navigation"
import { verifyPayment } from "@/lib/paystack"
import { createOrderFromPayment, type OrderMetadata } from "@/lib/orders"
import { VerifyClient } from "./VerifyClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verifying Payment…",
}

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const params = await searchParams
  const reference = params.reference ?? params.trxref

  if (!reference) {
    redirect("/checkout")
  }

  try {
    const result = await verifyPayment(reference)

    if (result.status !== "success") {
      redirect(
        `/checkout?payment_error=${encodeURIComponent("Payment was not completed. Please try again.")}`
      )
    }

    // Create the order (idempotent — safe if webhook already created it)
    const metadata = (result.metadata ?? {}) as OrderMetadata

    const { orderNumber } = await createOrderFromPayment({
      reference,
      amountKobo: result.amount,
      metadata,
      customerEmail: result.customer.email,
    })

    // VerifyClient clears the client-side cart, then redirects to confirmation
    return <VerifyClient orderNumber={orderNumber} />
  } catch (error) {
    console.error("Payment verification error:", error)
    redirect(
      `/checkout?payment_error=${encodeURIComponent("Unable to verify payment. Please contact support.")}`
    )
  }
}
