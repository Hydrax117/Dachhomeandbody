/**
 * /account/payment-requests — Customer's "Pay For Me" request history
 *
 * Shows all payment requests created by the user with their status,
 * ability to copy the link, cancel pending ones, and for paid requests
 * a direct link to the created order.
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserPaymentRequests } from "@/lib/payment-requests"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"
import { PaymentRequestsClient } from "./components/PaymentRequestsClient"
import { withDbFallback } from "@/lib/db-resilience"
import ServiceUnavailable from "@/app/components/ui/ServiceUnavailable"

export const metadata: Metadata = { title: "Payment Requests" }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PaymentRequestsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login?callbackUrl=/account/payment-requests")

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const pageSize = 10

  const {
    data: requestsResult,
    unavailable,
  } = await withDbFallback(
    () => getUserPaymentRequests(session.user.id, { page, pageSize }),
    { data: [], total: 0, page: 1, pageSize, totalPages: 0 }
  )

  if (unavailable) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <ServiceUnavailable message="We're having trouble loading your payment requests right now. Please try again in a moment." />
      </div>
    )
  }

  const { data: requests, total, totalPages } = requestsResult

  const siteUrl = process.env.NEXTAUTH_URL ?? ""

  // For paid requests, look up the order number so we can link directly to the order page
  const paidOrderIds = requests
    .filter((r) => r.status === "PAID" && r.orderId)
    .map((r) => r.orderId as string)

  const { data: orderNumbers } = paidOrderIds.length > 0
    ? await withDbFallback(
        () => prisma.order.findMany({
          where: { id: { in: paidOrderIds } },
          select: { id: true, orderNumber: true },
        }),
        []
      )
    : { data: [] }

  const orderNumberMap = new Map(orderNumbers.map((o) => [o.id, o.orderNumber]))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Payment Requests
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {total === 0
            ? "You haven't created any payment requests yet."
            : `${total} request${total === 1 ? "" : "s"} total`}
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-[#f5f0e8] border border-[#e5ddd0] rounded text-xs text-[#6b5c45]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" className="mt-0.5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>
          Payment request links expire after <strong>48 hours</strong> and can only be used once.
          Once paid, the order moves to your <Link href="/account/orders" className="underline hover:text-[#B8965C]">orders</Link>.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#111111] mb-1">No payment requests yet</p>
          <p className="text-xs text-[#8C8C8C] mb-6">
            At checkout, choose &quot;Let someone else pay&quot; to generate a shareable link.
          </p>
          <Link href="/shop" className="btn-primary text-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <PaymentRequestsClient
          requests={requests.map((r) => ({
            id: r.id,
            token: r.token,
            status: r.status as "PENDING" | "PAID" | "EXPIRED" | "CANCELLED",
            total: r.total,
            requesterEmail: r.requesterEmail,
            items: r.items as Array<{ name: string; quantity: number }>,
            expiresAt: r.expiresAt.toISOString(),
            paidAt: r.paidAt?.toISOString() ?? null,
            payerEmail: r.payerEmail ?? null,
            createdAt: r.createdAt.toISOString(),
            orderId: r.orderId ?? null,
            orderNumber: r.orderId ? (orderNumberMap.get(r.orderId) ?? null) : null,
          }))}
          siteUrl={siteUrl}
          page={page}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
