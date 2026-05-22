import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  getUserGiftOrders,
  GIFT_BOX_THEME_META,
  GIFT_CARD_STYLE_META,
  GIFT_RIBBON_STYLE_META,
  type GiftBoxTheme,
  type GiftOrderStatus,
} from "@/lib/gift-boxes"

export const metadata: Metadata = { title: "My Gift Orders" }

type GiftOrderItem = Awaited<ReturnType<typeof getUserGiftOrders>>[number]
type GiftOrderLineItem = GiftOrderItem["items"][number]

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

const statusStyles: Record<GiftOrderStatus, string> = {
  DRAFT: "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

const statusLabel: Record<GiftOrderStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being Prepared",
  SHIPPED: "On Its Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

// Simple timeline steps
const timelineSteps: GiftOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]

function StatusTimeline({ status }: { status: GiftOrderStatus }) {
  if (status === "CANCELLED" || status === "DRAFT") return null
  const currentIdx = timelineSteps.indexOf(status)

  return (
    <div className="flex items-center gap-0 mt-4">
      {timelineSteps.map((step, idx) => {
        const isCompleted = idx <= currentIdx
        const isActive = idx === currentIdx
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${
                isCompleted
                  ? isActive
                    ? "bg-[#B8965C] ring-2 ring-[#B8965C]/30"
                    : "bg-[#B8965C]"
                  : "bg-[#e5e5e5]"
              }`}
            />
            {/* Line */}
            {idx < timelineSteps.length - 1 && (
              <div className="flex-1 h-px mx-1 bg-[#e5e5e5] overflow-hidden">
                <div
                  className="h-full bg-[#B8965C] transition-all duration-500"
                  style={{ width: idx < currentIdx ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function GiftOrdersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account/gift-orders")
  }

  const orders = await getUserGiftOrders(session.user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          My Gift Orders
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {orders.length === 0
            ? "You haven't placed any gift orders yet."
            : `${orders.length} gift order${orders.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <div className="w-14 h-14 bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#111111] mb-1">No gift orders yet</p>
          <p className="text-xs text-[#8C8C8C] mb-6">
            Build a personalised gift box for someone special.
          </p>
          <Link href="/gift-box" className="btn-primary text-xs">
            Build a Gift Box
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: GiftOrderItem) => {
            const meta = GIFT_BOX_THEME_META[order.giftBox.theme as GiftBoxTheme]
            const address = order.shippingAddress as Record<string, string>

            return (
              <div
                key={order.id}
                className="bg-white border border-[#e5e5e5] rounded overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ece4] bg-[#FAF7F4]">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 border ${
                        statusStyles[order.status]
                      }`}
                    >
                      {statusLabel[order.status]}
                    </span>
                    <span className="font-serif text-sm font-medium text-[#111111]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-5">
                  {/* Box image */}
                  <div
                    className={`relative w-20 h-24 overflow-hidden bg-gradient-to-br ${meta.palette} shrink-0`}
                  >
                    <Image
                      src={order.giftBox.image}
                      alt={order.giftBox.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-3 min-w-0">
                    <div>
                      <p className="text-[#B8965C] text-[10px] tracking-[0.2em] uppercase mb-0.5">
                        {meta.label}
                      </p>
                      <p className="font-serif text-base font-medium text-[#111111]">
                        {order.giftBox.title}
                      </p>
                    </div>

                    {/* Products */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {order.items.slice(0, 4).map((item: GiftOrderLineItem) => (
                        <div
                          key={item.id}
                          className="relative w-8 h-10 overflow-hidden bg-[#F2EDE8] border border-[#e5e5e5]"
                          title={item.product.name}
                        >
                          {item.product.images[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-[11px] text-[#8C8C8C]">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Customization summary */}
                    <div className="flex items-center gap-3 text-[11px] text-[#8C8C8C]">
                      <span>
                        {GIFT_CARD_STYLE_META[order.customization.cardStyle].label} card
                      </span>
                      <span className="text-[#e5e5e5]">·</span>
                      <span>
                        {GIFT_RIBBON_STYLE_META[order.customization.ribbonStyle].label} ribbon
                      </span>
                      {order.customization.deliveryDate && (
                        <>
                          <span className="text-[#e5e5e5]">·</span>
                          <span>
                            Deliver{" "}
                            {new Date(
                              order.customization.deliveryDate
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Delivery address */}
                    {address?.city && (
                      <p className="text-[11px] text-[#8C8C8C]">
                        To: {address.name} · {address.city}
                        {address.state ? `, ${address.state}` : ""}
                      </p>
                    )}

                    {/* Status timeline */}
                    <StatusTimeline status={order.status} />
                  </div>
                </div>

                {/* Message preview */}
                {order.customization.message && (
                  <div className="px-5 pb-4">
                    <p className="text-[11px] text-[#8C8C8C] italic border-l-2 border-[#B8965C]/30 pl-3">
                      &ldquo;{order.customization.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/gift-box"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#B8965C] hover:text-[#111111] transition-colors duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          Build Another Gift Box
        </Link>
      </div>
    </div>
  )
}
