"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { cancelPaymentRequestAction } from "@/app/actions/payment-requests"
import { useRouter } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentRequestRow {
  id: string
  token: string
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"
  total: number
  requesterEmail: string
  items: Array<{ name: string; quantity: number }>
  expiresAt: string
  paidAt: string | null
  payerEmail: string | null
  createdAt: string
  orderId: string | null
  orderNumber: string | null
}

interface PaymentRequestsClientProps {
  requests: PaymentRequestRow[]
  siteUrl: string
  page: number
  totalPages: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

function timeUntilExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `Expires in ${hours}h ${minutes}m`
  return `Expires in ${minutes}m`
}

// ── Status badge ──────────────────────────────────────────────────────────

const statusStyles = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

function StatusBadge({ status }: { status: PaymentRequestRow["status"] }) {
  return (
    <span
      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${statusStyles[status]}`}
    >
      {status.toLowerCase()}
    </span>
  )
}

// ── Single request card ────────────────────────────────────────────────────

function RequestCard({
  request,
  siteUrl,
  onCancelled,
}: {
  request: PaymentRequestRow
  siteUrl: string
  onCancelled: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const payUrl = `${siteUrl}/pay/${request.token}`

  function handleCopy() {
    navigator.clipboard.writeText(payUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleCancel() {
    setCancelError(null)
    startTransition(async () => {
      const result = await cancelPaymentRequestAction(request.id)
      if (result.success) {
        onCancelled(request.id)
      } else {
        setCancelError(result.error ?? "Failed to cancel.")
      }
    })
  }

  const itemSummary =
    request.items.length === 1
      ? request.items[0].name
      : `${request.items.length} items`

  return (
    <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
      {/* Header row */}
      <div className="flex items-start sm:items-center justify-between px-4 sm:px-5 py-4 border-b border-[#f0ece4] gap-3">
        <div>
          <p className="text-sm font-medium text-[#111111]">{itemSummary}</p>
          <p className="text-[11px] text-[#8C8C8C] mt-0.5">
            Created{" "}
            {new Date(request.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={request.status} />
          <span className="text-sm font-medium text-[#111111]">
            {formatCurrency(request.total)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 py-4 space-y-3">

        {/* Paid state: show who paid and link directly to the order */}
        {request.status === "PAID" && (
          <div className="space-y-3">
            {/* Order link — the paid request has become an order */}
            {request.orderNumber ? (
              <Link
                href={`/account/orders`}
                className="flex items-center justify-between gap-3 py-3 px-4 bg-green-50 border border-green-200 rounded hover:border-green-400 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800">Payment received — order placed</p>
                    <p className="text-[11px] text-green-700 mt-0.5">
                      Order #{request.orderNumber}
                    </p>
                  </div>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" strokeWidth="2"
                  className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : (
              <div className="flex items-center gap-3 py-2 px-3 bg-green-50 border border-green-100 rounded text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-green-800 font-medium">Payment received</span>
              </div>
            )}

            {/* Payer info */}
            <div className="text-xs text-[#8C8C8C] space-y-0.5 px-1">
              {request.payerEmail && (
                <p>Paid by <span className="text-[#111111]">{request.payerEmail}</span></p>
              )}
              {request.paidAt && (
                <p>
                  {new Date(request.paidAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pending state: show link + expiry + copy/cancel */}
        {request.status === "PENDING" && (
          <>
            <div>
              <p className="text-[10px] text-[#8C8C8C] mb-1.5 tracking-wide uppercase">
                Payment link
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#111111] font-mono truncate flex-1 bg-[#f8f5f2] border border-[#e5e5e5] rounded px-2.5 py-1.5">
                  {payUrl}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`shrink-0 px-3 py-1.5 text-xs border rounded transition-all ${
                    copied
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-[#B8965C] text-[#B8965C] hover:bg-[#B8965C]/5"
                  }`}
                  title={copied ? "Copied" : "Copy link"}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8C8C8C]">{timeUntilExpiry(request.expiresAt)}</p>

            {cancelError && (
              <p className="text-xs text-red-600">{cancelError}</p>
            )}

            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="text-xs text-[#8C8C8C] hover:text-red-600 transition-colors disabled:opacity-40"
            >
              {isPending ? "Cancelling…" : "Cancel this request"}
            </button>
          </>
        )}

        {/* Expired / Cancelled: neutral info */}
        {(request.status === "EXPIRED" || request.status === "CANCELLED") && (
          <p className="text-xs text-[#8C8C8C]">
            {request.status === "EXPIRED"
              ? "This link has expired. Go to checkout to create a new one."
              : "This request was cancelled."}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main client component ──────────────────────────────────────────────────

export function PaymentRequestsClient({
  requests: initialRequests,
  siteUrl,
  page,
  totalPages,
}: PaymentRequestsClientProps) {
  const [requests, setRequests] = useState(initialRequests)
  const router = useRouter()

  function handleCancelled(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" as const } : r))
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          siteUrl={siteUrl}
          onCancelled={handleCancelled}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
          {page > 1 && (
            <Link
              href={`/account/payment-requests?page=${page - 1}`}
              className="px-3 py-1.5 text-xs border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
            >
              ← Previous
            </Link>
          )}
          <span className="text-xs text-[#8C8C8C]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/account/payment-requests?page=${page + 1}`}
              className="px-3 py-1.5 text-xs border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
