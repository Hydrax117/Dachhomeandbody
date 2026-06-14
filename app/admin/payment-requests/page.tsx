/**
 * /admin/payment-requests — Admin view of all Pay-For-Me requests
 */

import { getAdminPaymentRequests } from "@/lib/payment-requests"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Payment Requests" }

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
        statusStyles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.toLowerCase()}
    </span>
  )
}

const VALID_STATUSES = ["PENDING", "PAID", "EXPIRED", "CANCELLED"] as const
type RequestStatus = (typeof VALID_STATUSES)[number]

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  newPage: number
): string {
  const qs = new URLSearchParams()
  if (params.search && typeof params.search === "string") qs.set("search", params.search)
  if (params.status && typeof params.status === "string") qs.set("status", params.status)
  qs.set("page", String(newPage))
  return `/admin/payment-requests?${qs.toString()}`
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminPaymentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const search = typeof params.search === "string" ? params.search : ""
  const rawStatus = typeof params.status === "string" ? params.status : ""
  const status = VALID_STATUSES.includes(rawStatus as RequestStatus)
    ? (rawStatus as RequestStatus)
    : undefined
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  const pageSize = 20

  const { data: requests, total, totalPages } = await getAdminPaymentRequests(
    { status, search: search || undefined },
    { page, pageSize }
  )

  const hasFilters = search || rawStatus

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Payment Requests
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {total} request{total !== 1 ? "s" : ""}
          {hasFilters ? " matching filters" : " total"}
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email or token…"
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C]"
        />
        <select
          name="status"
          defaultValue={rawStatus}
          className="px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C]"
        >
          <option value="">All statuses</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-xs tracking-[0.12em] uppercase border border-[#111111] rounded hover:bg-[#111111] hover:text-white transition-colors"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/payment-requests"
            className="px-4 py-2 text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors self-center"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">
            {hasFilters ? "No requests match your filters." : "No payment requests yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">Requester</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">Payer</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Total</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {requests.map((req) => {
                  const items = req.items as Array<{ name: string; quantity: number }>
                  const itemSummary =
                    items.length === 1
                      ? items[0].name
                      : `${items.length} items`

                  const isExpired = new Date(req.expiresAt) < new Date()

                  return (
                    <tr key={req.id} className="hover:bg-[#F8F5F2] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[#111111] text-xs font-mono truncate max-w-[110px]" title={req.token}>
                          {req.token.slice(0, 12)}…
                        </p>
                        <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C] mt-0.5 truncate max-w-[140px]">{itemSummary}</p>
                      </td>

                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-[#111111] truncate max-w-[160px]">
                          {req.requesterName ?? "—"}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C] truncate max-w-[160px]">
                          {req.requesterEmail}
                        </p>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        {req.payerEmail ? (
                          <p className="text-[11px] text-[#8C8C8C] truncate max-w-[160px]">
                            {req.payerEmail}
                          </p>
                        ) : (
                          <span className="text-[11px] text-[#C4C4C4]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-[#111111]">
                          {formatCurrency(req.total)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {req.status === "PENDING" ? (
                          <span className={`text-[11px] ${isExpired ? "text-red-500" : "text-[#8C8C8C]"}`}>
                            {isExpired
                              ? "Expired"
                              : new Date(req.expiresAt).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                })}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#C4C4C4]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#F8F5F2]">
              <p className="text-xs text-[#8C8C8C]">
                Page {page} of {totalPages} — {total} requests
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(params, page - 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(params, page + 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
