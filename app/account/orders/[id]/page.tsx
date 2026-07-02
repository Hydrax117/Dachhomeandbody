/**
 * /account/orders/[id] — Customer order detail page
 *
 * Displays complete order information: items, totals, shipping address,
 * payment status, and order tracking timeline.
 * Requirements: 5.2, 5.4
 */

import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getOrder } from "@/lib/orders"
import Link from "next/link"
import type { Metadata } from "next"
import { withDbFallback } from "@/lib/db-resilience"
import ServiceUnavailable from "@/app/components/ui/ServiceUnavailable"

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

// ---------------------------------------------------------------------------
// Tracking timeline
// ---------------------------------------------------------------------------
const TRACKING_STEPS = [
  { key: "PENDING", label: "Order placed", description: "Your order has been received" },
  { key: "PROCESSING", label: "Processing", description: "We're preparing your order" },
  { key: "SHIPPED", label: "Shipped", description: "Your order is on its way" },
  { key: "DELIVERED", label: "Delivered", description: "Your order has been delivered" },
] as const

const STATUS_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]

function TrackingTimeline({
  status,
  shippedAt,
  deliveredAt,
  createdAt,
}: {
  status: string
  shippedAt: Date | null
  deliveredAt: Date | null
  createdAt: Date
}) {
  // Cancelled / Refunded orders get a simplified view
  if (status === "CANCELLED" || status === "REFUNDED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#fafafa] border border-[#e5e5e5] rounded">
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#111111] capitalize">
            Order {status.toLowerCase()}
          </p>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            {new Date(createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    )
  }

  const currentIndex = STATUS_ORDER.indexOf(status)

  const stepDates: Record<string, Date | null> = {
    PENDING: createdAt,
    PROCESSING: null,
    SHIPPED: shippedAt,
    DELIVERED: deliveredAt,
  }

  return (
    <ol className="relative" aria-label="Order tracking">
      {TRACKING_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const stepDate = stepDates[step.key]

        return (
          <li key={step.key} className="flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-[#B8965C] border-[#B8965C]"
                    : "bg-white border-[#e5e5e5]"
                }`}
                aria-hidden="true"
              >
                {isCompleted && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              {index < TRACKING_STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 ${
                    index < currentIndex ? "bg-[#B8965C]" : "bg-[#e5e5e5]"
                  }`}
                />
              )}
            </div>

            {/* Step content */}
            <div className="pt-0.5 pb-2">
              <p
                className={`text-sm font-medium ${
                  isCurrent ? "text-[#B8965C]" : isCompleted ? "text-[#111111]" : "text-[#C4C4C4]"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-[#8C8C8C] mt-0.5">{step.description}</p>
              {stepDate && isCompleted && (
                <p className="text-[11px] text-[#C4C4C4] mt-1">
                  {new Date(stepDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// Estimated delivery: 3–7 business days from order date
function estimatedDelivery(createdAt: Date): string {
  const minDate = new Date(createdAt)
  const maxDate = new Date(createdAt)

  let added = 0
  while (added < 3) {
    minDate.setDate(minDate.getDate() + 1)
    const day = minDate.getDay()
    if (day !== 0 && day !== 6) added++
  }

  added = 0
  while (added < 7) {
    maxDate.setDate(maxDate.getDate() + 1)
    const day = maxDate.getDay()
    if (day !== 0 && day !== 6) added++
  }

  const fmt = new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" })
  return `${fmt.format(minDate)} – ${fmt.format(maxDate)}`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account/orders")
  }

  const { id } = await params

  const { data: order, unavailable } = await withDbFallback(() => getOrder(id), null)

  if (unavailable) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <ServiceUnavailable message="We're having trouble loading this order right now. Please try again in a moment." />
      </div>
    )
  }

  if (!order) {
    notFound()
  }

  // Ensure the order belongs to this user
  if (order.userId && order.userId !== session!.user.id) {
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

  const isActive = !["CANCELLED", "REFUNDED", "DELIVERED"].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: items + totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Items ordered ({order.items.length})
              </h2>
            </div>
            <ul aria-label="Order items">
              {order.items.map((item: OrderItem, index: number) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 ${
                    index < order.items.length - 1 ? "border-b border-[#f0ece4]" : ""
                  }`}
                >
                  {/* Product image */}
                  <div className="w-12 h-14 sm:w-14 sm:h-16 shrink-0 bg-[#f5f0e8] rounded border border-[#e5e5e5] overflow-hidden">
                    {item.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.product.slug}`}
                      className="text-sm font-medium text-[#111111] hover:text-[#B8965C] transition-colors line-clamp-2 leading-snug"
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

                  <p className="text-sm font-medium text-[#111111] shrink-0 ml-1">
                    {formatCurrency(item.subtotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Order totals */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Order summary
              </h2>
            </div>
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
          </section>
        </div>

        {/* Right column: tracking + shipping + payment */}
        <div className="space-y-6">
          {/* Order tracking */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Order tracking
              </h2>
            </div>
            <div className="px-5 py-5">
              <TrackingTimeline
                status={order.status}
                shippedAt={order.shippedAt}
                deliveredAt={order.deliveredAt}
                createdAt={order.createdAt}
              />
              {isActive && (
                <p className="text-[11px] text-[#8C8C8C] mt-4 pt-4 border-t border-[#f0ece4]">
                  Estimated delivery:{" "}
                  <span className="font-medium text-[#111111]">
                    {estimatedDelivery(order.createdAt)}
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* Shipping address */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Shipping address
              </h2>
            </div>
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
              <p className="text-xs text-[#8C8C8C] mt-1">{shippingAddress.phone}</p>
            </address>
          </section>

          {/* Payment info */}
          <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0ece4]">
              <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                Payment
              </h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Method</span>
                <span className="text-[#111111] capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8C8C8C]">Status</span>
                <span
                  className={`capitalize font-medium ${
                    order.paymentStatus === "PAID"
                      ? "text-green-600"
                      : order.paymentStatus === "REFUNDED"
                      ? "text-gray-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.paymentStatus.toLowerCase()}
                </span>
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
          </section>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              href="/shop"
              className="btn-secondary w-full text-center text-xs block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
