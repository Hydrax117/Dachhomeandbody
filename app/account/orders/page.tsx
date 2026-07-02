/**
 * /account/orders — Customer order history page
 *
 * Displays all user orders sorted by date (newest first) with status badges.
 * Requirements: 5.1, 5.2
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrders, getOrder } from "@/lib/orders"
import Link from "next/link"
import type { Metadata } from "next"
import Pagination from "@/app/components/ui/Pagination"
import { withDbFallback } from "@/lib/db-resilience"
import ServiceUnavailable from "@/app/components/ui/ServiceUnavailable"

// Derive the order shape from the existing data access function
type OrderListItem = NonNullable<Awaited<ReturnType<typeof getOrder>>>

export const metadata: Metadata = {
  title: "My Orders",
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function OrderHistoryPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account/orders")
  }

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const pageSize = 10

  const { data: ordersResult, unavailable } = await withDbFallback(
    () => getUserOrders(session!.user.id, { page, pageSize }),
    { data: [], total: 0, page: 1, pageSize, totalPages: 0 }
  )

  if (unavailable) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <ServiceUnavailable message="We're having trouble loading your orders right now. Please try again in a moment." />
      </div>
    )
  }

  const { data: orders, total, totalPages } = ordersResult

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          My Orders
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {total === 0
            ? "You haven't placed any orders yet."
            : `${total} order${total === 1 ? "" : "s"} total`}
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8965C"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#111111] mb-1">No orders yet</p>
          <p className="text-xs text-[#8C8C8C] mb-6">
            When you place an order, it will appear here.
          </p>
          <Link href="/shop" className="btn-primary text-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Orders list */}
          <div className="space-y-3">
            {(orders as OrderListItem[]).map((order) => {
              const shippingAddress = order.shippingAddress as {
                name?: string
                city?: string
                state?: string | null
              } | null

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-white border border-[#e5e5e5] rounded hover:border-[#B8965C] transition-colors group"
                  aria-label={`Order ${order.orderNumber}`}
                >
                  {/* Order header row */}
                  <div className="flex items-start sm:items-center justify-between px-4 sm:px-5 py-4 border-b border-[#f0ece4] gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div>
                        <p className="text-sm font-medium text-[#111111] group-hover:text-[#B8965C] transition-colors">
                          #{order.orderNumber}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-medium text-[#111111]">
                        {formatCurrency(order.total)}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8C8C8C"
                        strokeWidth="1.5"
                        className="group-hover:stroke-[#B8965C] transition-colors hidden sm:block"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Product image thumbnails (up to 3) */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item: OrderListItem["items"][number]) => (
                          <div
                            key={item.id}
                            className="w-9 h-10 rounded border border-[#e5e5e5] bg-[#f5f0e8] overflow-hidden shrink-0"
                          >
                            {item.product.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#C4C4C4"
                                  strokeWidth="1.5"
                                  aria-hidden="true"
                                >
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-9 h-10 rounded border border-[#e5e5e5] bg-[#f5f0e8] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-[#8C8C8C]">
                              +{order.items.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#8C8C8C] truncate">
                        {order.items.length === 1
                          ? order.items[0].product.name
                          : `${order.items.length} items`}
                      </p>
                    </div>

                    {shippingAddress?.city && (
                      <p className="text-[11px] text-[#8C8C8C] shrink-0 hidden sm:block">
                        {shippingAddress.city}
                        {shippingAddress.state ? `, ${shippingAddress.state}` : ""}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            itemLabel="orders"
            buildUrl={(p) => `/account/orders?page=${p}`}
            centered
          />
        </>
      )}
    </div>
  )
}
