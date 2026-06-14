/**
 * /checkout/verify
 *
 * Paystack redirects here after payment with ?reference=...
 * Verifies the payment, creates the order (idempotent), and routes
 * the user to the right success page.
 *
 * Pay-For-Me detection: if reference starts with "PAY-", this was a
 * payment request. We look up the token from DB via the reference prefix
 * and redirect to /pay/[token]/success. No metadata dependency.
 *
 * Requirements: 4.4, 4.5
 */

import { redirect } from "next/navigation"
import { verifyPayment } from "@/lib/paystack"
import { createOrderFromPayment, type OrderMetadata } from "@/lib/orders"
import { prisma } from "@/lib/prisma"
import { VerifyClient } from "./VerifyClient"
import { isRedirectError } from "next/dist/client/components/redirect-error"
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

  let orderNumber: string
  let payRequestToken: string | null = null

  try {
    // Detect Pay-For-Me by reference prefix before calling Paystack
    // Reference format for pay requests: PAY-[first 24 chars of token]-[random]
    if (reference.startsWith("PAY-")) {
      const tokenPrefix = reference.split("-")[1] ?? ""
      if (tokenPrefix.length >= 16) {
        const match = await prisma.paymentRequest.findFirst({
          where: { token: { startsWith: tokenPrefix } },
          select: { token: true },
        })
        payRequestToken = match?.token ?? null
      }
    }

    const result = await verifyPayment(reference)

    if (result.status !== "success") {
      if (payRequestToken) {
        redirect(`/pay/${payRequestToken}?error=payment_failed`)
      }
      redirect(
        `/checkout?payment_error=${encodeURIComponent("Payment was not completed. Please try again.")}`
      )
    }

    const rawMeta = (result.metadata ?? {}) as OrderMetadata

    const result2 = await createOrderFromPayment({
      reference,
      amountKobo: result.amount,
      metadata: rawMeta,
      customerEmail: result.customer.email,
    })

    orderNumber = result2.orderNumber
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error("Payment verification error:", error)
    if (payRequestToken) {
      redirect(`/pay/${payRequestToken}?error=verify_failed`)
    }
    redirect(
      `/checkout?payment_error=${encodeURIComponent("Unable to verify payment. Please contact support.")}`
    )
  }

  // Pay-For-Me: send payer to the branded success page
  if (payRequestToken) {
    redirect(`/pay/${payRequestToken}/success?order=${orderNumber}`)
  }

  // Normal checkout: clear cart client-side then go to confirmation
  return <VerifyClient orderNumber={orderNumber} />
}
