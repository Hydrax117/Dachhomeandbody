/**
 * /checkout/confirmation/[orderNumber]
 *
 * Order confirmation page displayed after successful payment.
 * Shows order details, estimated delivery date, and a tracking link.
 *
 * Requirements: 4.8, 5.4
 */

import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Confirmed",
}

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

// Estimated delivery: 3–7 business days from order date
function estimatedDelivery(createdAt: Date): string {
  const minDays = 3
  const maxDays = 7
  const minDate = new Date(createdAt)
  const maxDate = new Date(createdAt)

  // Skip weekends for business day calculation
  let added = 0
  while (added < minDays) {
    minDate.setDate(minDate.getDate() + 1)
    const day = minDate.getDay()
    if (day !== 0 && day !== 6) added++
  }

  added = 0
  while (added < maxDays) {
    maxDate.setDate(maxDate.getDate() + 1)
    const day = maxDate.getDay()
    if (day !== 0 && day !== 6) added++
  }

  const fmt = new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" })
  return `${fmt.format(minDate)} – ${fmt.format(maxDate)}`
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: true, slug: true },
          },
        },
      },
    },
  })

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

  const deliveryRange = estimatedDelivery(order.createdAt)

  return (
    <main className="min-h-screen bg-[#FAF6F1] pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="py-8 border-b border-[#E8DED3] mb-10">
          <Link
            href="/"
            className="font-serif text-base tracking-[0.22em] uppercase text-[#111111]"
            aria-label="Dachhomeandbody — Home"
          >
            Dachhomeandbody
          </Link>
        </div>

        {/* Success icon */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#C8A96B]/10 flex items-center justify-center mx-auto mb-5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8A96B"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-light text-[#111111] mb-2">
            Order confirmed
          </h1>
          <p className="text-sm text-[#8b7355]">
            Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order number + delivery estimate */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-[#E8DED3] rounded-sm bg-[#FAF8F5]">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1">
              Order number
            </p>
            <p className="font-medium text-[#111111] text-sm">{order.orderNumber}</p>
          </div>
          <div className="p-4 border border-[#E8DED3] rounded-sm bg-[#FAF8F5]">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1">
              Estimated delivery
            </p>
            <p className="font-medium text-[#111111] text-sm">{deliveryRange}</p>
          </div>
        </div>

        {/* Order status */}
        <div className="mb-8 p-4 border border-[#E8DED3] rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1">
                Status
              </p>
              <p className="text-sm font-medium text-[#111111] capitalize">
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </p>
            </div>
            <Link
              href="/account/orders"
              className="text-[10px] tracking-[0.12em] uppercase text-[#C8A96B] hover:text-[#b8965a] transition-colors"
            >
              Track order →
            </Link>
          </div>
        </div>

        {/* Order items */}
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-4">
            Items ordered
          </h2>
          <ul className="space-y-3" aria-label="Order items">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 p-3 border border-[#E8DED3] rounded-sm"
              >
                {/* Product image */}
                <div className="w-12 h-14 shrink-0 bg-[#E8DED3] rounded-sm overflow-hidden">
                  {item.product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8b0a8" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111111] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[#8b7355] mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-medium text-[#111111] shrink-0">
                  ₦{item.subtotal.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Order totals */}
        <div className="mb-8 p-4 border border-[#E8DED3] rounded-sm space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#8b7355]">Subtotal</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#C8A96B]">
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </span>
              <span className="text-[#C8A96B]">−₦{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#8b7355]">Shipping</span>
            <span className="text-[#8b7355]">
              {order.shippingCost === 0 ? "Free" : `₦${order.shippingCost.toLocaleString()}`}
            </span>
          </div>
          <div className="border-t border-[#E8DED3] pt-2.5 flex justify-between font-medium">
            <span className="font-serif">Total</span>
            <span className="font-serif">₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="mb-10 p-4 border border-[#E8DED3] rounded-sm">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-3">
            Shipping to
          </p>
          <p className="text-sm font-medium text-[#111111]">{shippingAddress.name}</p>
          <p className="text-xs text-[#8b7355] mt-1 leading-relaxed">
            {shippingAddress.address}<br />
            {shippingAddress.city}
            {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
            {shippingAddress.postalCode}<br />
            {shippingAddress.country}
          </p>
          <p className="text-xs text-[#8b7355] mt-1">{shippingAddress.phone}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="btn-primary flex-1 text-center"
          >
            View order details
          </Link>
          <Link
            href="/shop"
            className="btn-secondary flex-1 text-center"
          >
            Continue shopping
          </Link>
        </div>

      </div>
    </main>
  )
}
