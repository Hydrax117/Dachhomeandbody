import { notFound } from "next/navigation"
import { getPaymentRequestByToken, expireStalePaymentRequests } from "@/lib/payment-requests"
import type { Metadata } from "next"
import { PayerCheckout } from "./components/PayerCheckout"

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const request = await getPaymentRequestByToken(token)
  if (!request) return { title: "Payment Link" }
  return {
    title: `Pay for ${request.requesterName ?? "someone"}'s order — Dachhomeandbody`,
  }
}

export default async function PayPage({ params }: PageProps) {
  const { token } = await params
  await expireStalePaymentRequests()
  const request = await getPaymentRequestByToken(token)
  if (!request) notFound()

  const items = request.items as Array<{
    productId: string; variantId: string | null; variantName: string | null
    quantity: number; price: number; name: string; image: string | null
  }>
  const shippingAddress = request.shippingAddress as {
    name: string; phone: string; address: string; city: string
    state: string | null; postalCode: string; country: string
  }

  return (
    <PayerCheckout
      token={token}
      status={request.status as "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"}
      requesterName={request.requesterName}
      requesterEmail={request.requesterEmail}
      items={items}
      shippingAddress={shippingAddress}
      subtotal={request.subtotal}
      discount={request.discount}
      shippingCost={request.shippingCost}
      total={request.total}
      expiresAt={request.expiresAt.toISOString()}
      couponCode={request.couponCode}
    />
  )
}
