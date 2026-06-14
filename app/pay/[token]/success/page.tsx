import Link from "next/link"
import { getPaymentRequestByToken } from "@/lib/payment-requests"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ order?: string }>
}

export const metadata: Metadata = { title: "Payment Successful — Dachhomeandbody" }

export default async function PaySuccessPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { order: orderNumber } = await searchParams
  const request = await getPaymentRequestByToken(token)
  if (!request) notFound()

  return (
    <main className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-sm tracking-[0.22em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors block mb-10">
          Dachhomeandbody
        </Link>
        <div className="w-20 h-20 rounded-full bg-[#f5f0e8] border-2 border-[#B8965C]/30 flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-light text-[#111111] mb-3">Thank you</h1>
        {orderNumber && (
          <p className="text-sm text-[#8C8C8C] mb-2">
            Order <strong className="text-[#111111]">#{orderNumber}</strong> has been placed.
          </p>
        )}
        {request.requesterName ? (
          <p className="text-sm text-[#8C8C8C] mb-6 leading-relaxed">
            You&apos;ve paid for <strong className="text-[#111111]">{request.requesterName}&apos;s</strong> order.
            They&apos;ve been notified and the items will be delivered to them.
          </p>
        ) : (
          <p className="text-sm text-[#8C8C8C] mb-6 leading-relaxed">
            Your payment was successful. The requester has been notified.
          </p>
        )}
        <p className="text-xs text-[#C4C4C4] mb-8">A payment receipt has been sent to your email.</p>
        <Link href="/shop" className="btn-primary">Explore the collection</Link>
      </div>
    </main>
  )
}
