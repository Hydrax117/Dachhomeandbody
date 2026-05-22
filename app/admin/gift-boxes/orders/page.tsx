import type { Metadata } from "next"
import Link from "next/link"
import { getAdminGiftOrders, type GiftOrderStatus } from "@/lib/gift-boxes"

export const metadata: Metadata = { title: "Gift Orders" }

// Explicit inline type — avoids build-time Prisma resolution issues
interface GiftOrderRow {
  id: string
  orderNumber: string
  guestEmail: string | null
  subtotal: number
  boxPrice: number
  total: number
  status: GiftOrderStatus
  paymentStatus: string
  createdAt: Date
  items: { id: string }[]
  giftBox: { id: string; title: string; image: string }
  user: { id: string; name: string | null; email: string } | null
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

const statusColors: Record<GiftOrderStatus, string> = {
  DRAFT: "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

const VALID_STATUSES: GiftOrderStatus[] = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export default async function AdminGiftOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page, 10) || 1)
      : 1
  const status =
    typeof params.status === "string" &&
    VALID_STATUSES.includes(params.status as GiftOrderStatus)
      ? (params.status as GiftOrderStatus)
      : undefined
  const search =
    typeof params.search === "string" ? params.search : undefined

  const { data: orders, total, totalPages } = await getAdminGiftOrders(
    { status, search },
    { page, pageSize: 20 }
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/gift-boxes"
              className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors"
            >
              ← Gift Boxes
            </Link>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Gift Orders
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {total} order{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/gift-boxes/orders"
          className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase border rounded transition-colors ${
            !status
              ? "bg-[#111111] text-white border-[#111111]"
              : "border-[#e5e5e5] text-[#8C8C8C] hover:border-[#C4C4C4]"
          }`}
        >
          All
        </Link>
        {VALID_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/gift-boxes/orders?status=${s}`}
            className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase border rounded transition-colors ${
              status === s
                ? "bg-[#111111] text-white border-[#111111]"
                : "border-[#e5e5e5] text-[#8C8C8C] hover:border-[#C4C4C4]"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">No gift orders found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Box
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {orders.map((order: GiftOrderRow) => {
                  const customer =
                    order.user?.name ??
                    order.user?.email ??
                    order.guestEmail ??
                    "Guest"

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F8F5F2] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111111] text-xs">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C]">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-NG"
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {customer}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {order.giftBox.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {order.items.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#111111] text-xs">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
                            statusColors[order.status]
                          }`}
                        >
                          {order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/gift-boxes/orders/${order.id}`}
                            className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#F8F5F2]">
              <p className="text-xs text-[#8C8C8C]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/gift-boxes/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/gift-boxes/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
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
