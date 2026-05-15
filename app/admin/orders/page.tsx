import { getAdminOrders, type AdminOrderFilters, type AdminOrderSort, type AdminOrderRow } from "@/lib/orders"
import Link from "next/link"
import OrdersToolbar from "./components/OrdersToolbar"

export const metadata = {
  title: "Orders",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
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

const paymentStatusStyles: Record<string, string> = {
  PENDING: "text-yellow-700",
  PAID: "text-green-700",
  FAILED: "text-red-700",
  REFUNDED: "text-gray-600",
}

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  newPage: number
): string {
  const qs = new URLSearchParams()
  if (params.search && typeof params.search === "string") qs.set("search", params.search)
  if (params.status && typeof params.status === "string") qs.set("status", params.status)
  if (params.startDate && typeof params.startDate === "string") qs.set("startDate", params.startDate)
  if (params.endDate && typeof params.endDate === "string") qs.set("endDate", params.endDate)
  if (params.sort && typeof params.sort === "string") qs.set("sort", params.sort)
  qs.set("page", String(newPage))
  return `/admin/orders?${qs.toString()}`
}

const VALID_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const

type OrderStatusValue = (typeof VALID_STATUSES)[number]

const VALID_SORTS: AdminOrderSort[] = ["newest", "oldest", "total_desc", "total_asc"]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const search = typeof params.search === "string" ? params.search : ""
  const rawStatus = typeof params.status === "string" ? params.status : ""
  const status = VALID_STATUSES.includes(rawStatus as OrderStatusValue)
    ? (rawStatus as OrderStatusValue)
    : undefined
  const startDate = typeof params.startDate === "string" ? params.startDate : ""
  const endDate = typeof params.endDate === "string" ? params.endDate : ""
  const rawSort = typeof params.sort === "string" ? params.sort : "newest"
  const sort: AdminOrderSort = VALID_SORTS.includes(rawSort as AdminOrderSort)
    ? (rawSort as AdminOrderSort)
    : "newest"
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  const pageSize = 20

  const filters: AdminOrderFilters = {
    search: search || undefined,
    status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }

  const result = await getAdminOrders(filters, sort, { page, pageSize })
  const { data: orders, total, totalPages } = result

  const hasFilters = search || rawStatus || startDate || endDate || sort !== "newest"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">Orders</h1>
        <p className="text-sm text-[#8b7355] mt-1">
          {total} order{total !== 1 ? "s" : ""}
          {hasFilters ? " matching filters" : " total"}
        </p>
      </div>

      {/* Toolbar */}
      <OrdersToolbar
        currentSearch={search}
        currentStatus={rawStatus}
        currentStartDate={startDate}
        currentEndDate={endDate}
        currentSort={sort}
      />

      {/* Table */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8b7355]">
            {hasFilters ? "No orders match your filters." : "No orders yet."}
          </p>
          {hasFilters && (
            <Link
              href="/admin/orders"
              className="inline-block mt-3 text-xs text-[#C8A96B] hover:underline"
            >
              Clear filters →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#FAF8F5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden md:table-cell">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Items
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {orders.map((order: AdminOrderRow) => {
                  const customerName =
                    order.user?.name ?? order.guestName ?? "Guest"
                  const customerEmail =
                    order.user?.email ?? order.guestEmail ?? ""
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                      {/* Order number + date */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-[#111111] hover:text-[#C8A96B] transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-[#8b7355] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-[#111111] truncate max-w-[160px]">{customerName}</p>
                        <p className="text-[11px] text-[#8b7355] truncate max-w-[160px]">
                          {customerEmail}
                        </p>
                      </td>

                      {/* Order status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Payment status */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={`text-xs font-medium ${
                            paymentStatusStyles[order.paymentStatus] ?? "text-[#8b7355]"
                          }`}
                        >
                          {order.paymentStatus.toLowerCase()}
                        </span>
                      </td>

                      {/* Item count */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[#8b7355]">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-[#111111]">
                          {formatCurrency(order.total)}
                        </span>
                        {order.discount > 0 && (
                          <p className="text-[11px] text-green-600 mt-0.5">
                            -{formatCurrency(order.discount)} off
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                          aria-label={`View order ${order.orderNumber}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#FAF8F5]">
              <p className="text-xs text-[#8b7355]">
                Page {page} of {totalPages} — {total} orders
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(params, page - 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(params, page + 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
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
