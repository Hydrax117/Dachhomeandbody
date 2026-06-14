/**
 * /admin/orders/[id] — Admin order detail page
 *
 * Displays complete order information for admin: customer details and contact
 * info, all order items with products, payment info, and shipping address.
 * Requirements: 9.3, 23.5
 */

import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getOrder } from "@/lib/orders"
import Link from "next/link"
import type { Metadata } from "next"
import OrderStatusForm from "../components/OrderStatusForm"
import RefundForm from "../components/RefundForm"

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrder>>>
type OrderItem = OrderDetail["items"][number]

export const metadata: Metadata = {
  title: "Order Details",
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

const formatDate = (date: Date | string | null) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

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
      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 rounded border ${
        statusStyles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.toLowerCase()}
    </span>
  )
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "text-yellow-700",
  PAID: "text-green-700",
  FAILED: "text-red-700",
  REFUNDED: "text-gray-600",
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0ece4]">
        <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin/orders")
  }

  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const shippingAddress = order.shippingAddress as {
    name: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone: string
  }

  const customerName = order.user?.name ?? order.guestName ?? "Guest"
  const customerEmail = order.user?.email ?? order.guestEmail ?? "—"
  const isRegistered = !!order.user

  const itemCount = order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors mb-4"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-[#8C8C8C] mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: items + totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <Section title={`Items ordered (${itemCount})`}>
            <ul aria-label="Order items">
              {order.items.map((item: OrderItem, index: number) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    index < order.items.length - 1 ? "border-b border-[#f0ece4]" : ""
                  }`}
                >
                  {/* Product image */}
                  <div className="w-14 h-16 shrink-0 bg-[#f5f0e8] rounded border border-[#e5e5e5] overflow-hidden">
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
                          width="16"
                          height="16"
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

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products`}
                      className="text-sm font-medium text-[#111111] hover:text-[#B8965C] transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                        {item.variantName}
                      </p>
                    )}
                    {item.product.sku && (
                      <p className="text-[11px] text-[#C4C4C4] mt-0.5">
                        SKU: {item.product.sku}
                      </p>
                    )}
                    <p className="text-xs text-[#8C8C8C] mt-1">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-[#111111] shrink-0">
                    {formatCurrency(item.subtotal)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          {/* Order totals */}
          <Section title="Order summary">
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8C8C]">Subtotal</span>
                <span className="text-[#111111]">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#B8965C]">
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span className="text-[#B8965C]">−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8C8C]">Shipping</span>
                <span className="text-[#8C8C8C]">
                  {order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="border-t border-[#f0ece4] pt-3 flex justify-between">
                <span className="font-serif font-medium text-[#111111]">Total</span>
                <span className="font-serif font-medium text-[#111111]">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* Right column: customer, payment, shipping, timestamps */}
        <div className="space-y-6">
          {/* Customer details — Requirement 23.5 */}
          <Section title="Customer">
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-[#111111]">{customerName}</p>
                {isRegistered ? (
                  <Link
                    href={`/admin/customers/${order.user!.id}`}
                    className="text-xs text-[#B8965C] hover:underline mt-0.5 inline-block"
                  >
                    View customer profile →
                  </Link>
                ) : (
                  <p className="text-[11px] text-[#C4C4C4] mt-0.5">Guest checkout</p>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 pt-1 border-t border-[#f0ece4]">
                <div className="flex items-center gap-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8C8C8C"
                    strokeWidth="2"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a
                    href={`mailto:${customerEmail}`}
                    className="text-xs text-[#111111] hover:text-[#B8965C] transition-colors truncate"
                  >
                    {customerEmail}
                  </a>
                </div>
                {shippingAddress.phone && (
                  <div className="flex items-center gap-2">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8C8C8C"
                      strokeWidth="2"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a
                      href={`tel:${shippingAddress.phone}`}
                      className="text-xs text-[#111111] hover:text-[#B8965C] transition-colors"
                    >
                      {shippingAddress.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Payment info — Requirement 9.3 */}
          <Section title="Payment">
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Status</span>
                <span
                  className={`capitalize font-medium ${
                    paymentStatusColors[order.paymentStatus] ?? "text-[#8C8C8C]"
                  }`}
                >
                  {order.paymentStatus.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Method</span>
                <span className="text-[#111111] capitalize">{order.paymentMethod}</span>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between text-xs gap-2">
                  <span className="text-[#8C8C8C] shrink-0">Reference</span>
                  <span className="text-[#111111] font-mono text-[10px] truncate">
                    {order.paymentReference}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Shipping address — Requirement 9.3 */}
          <Section title="Shipping address">
            <address className="px-5 py-4 not-italic">
              <p className="text-sm font-medium text-[#111111]">{shippingAddress.name}</p>
              <p className="text-xs text-[#8C8C8C] mt-1 leading-relaxed">
                {shippingAddress.address}
                <br />
                {shippingAddress.city}
                {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
                {shippingAddress.postalCode}
                <br />
                {shippingAddress.country}
              </p>
            </address>
          </Section>

          {/* Order timestamps */}
          <Section title="Timeline">
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Placed</span>
                <span className="text-[#111111]">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {order.shippedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#8C8C8C]">Shipped</span>
                  <span className="text-[#111111]">
                    {new Date(order.shippedAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#8C8C8C]">Delivered</span>
                  <span className="text-[#111111]">
                    {new Date(order.deliveredAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Last updated</span>
                <span className="text-[#111111]">
                  {new Date(order.updatedAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Section>

          {/* Admin actions — status update + refund */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Manage Order
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <OrderStatusForm orderId={order.id} currentStatus={order.status} />
              <div className="border-t border-[#f0ece4] pt-4">
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium mb-3">
                  Refund
                </p>
                <RefundForm
                  orderId={order.id}
                  orderTotal={order.total}
                  currentStatus={order.status}
                />
              </div>
            </div>
          </section>

          <Link
            href="/admin/orders"
            className="w-full text-center text-xs block px-4 py-2.5 border border-[#e5e5e5] text-[#8C8C8C] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
