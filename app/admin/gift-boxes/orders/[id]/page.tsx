import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  getGiftOrder,
  GIFT_BOX_THEME_META,
  GIFT_CARD_STYLE_META,
  GIFT_RIBBON_STYLE_META,
  type GiftBoxTheme,
  type GiftOrderStatus,
  type GiftCardStyle,
  type GiftRibbonStyle,
} from "@/lib/gift-boxes"
import GiftOrderStatusForm from "../../components/GiftOrderStatusForm"

export const metadata: Metadata = { title: "Gift Order" }

interface GiftOrderData {
  id: string
  orderNumber: string
  guestEmail: string | null
  guestName: string | null
  subtotal: number
  boxPrice: number
  total: number
  status: GiftOrderStatus
  paymentStatus: string
  paymentMethod: string | null
  paymentReference: string | null
  shippingAddress: unknown
  notes: string | null
  createdAt: Date
  updatedAt: Date
  giftBox: { id: string; title: string; image: string; theme: GiftBoxTheme }
  customization: {
    id: string
    message: string | null
    cardStyle: GiftCardStyle
    ribbonStyle: GiftRibbonStyle
    deliveryDate: Date | null
    anonymous: boolean
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      slug: string
      images: string[]
      price: number
      topNotes: string[]
      heartNotes: string[]
      baseNotes: string[]
      moodTags: string[]
    }
  }[]
  user: { id: string; name: string | null; email: string } | null
}

type GiftOrderLineItem = GiftOrderData["items"][number]

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

export default async function AdminGiftOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getGiftOrder(id) as GiftOrderData | null
  if (!order) notFound()

  const meta = GIFT_BOX_THEME_META[order.giftBox.theme as GiftBoxTheme]
  const address = order.shippingAddress as Record<string, string>
  const customer =
    order.user?.name ??
    order.user?.email ??
    order.guestEmail ??
    "Guest"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
        <Link href="/admin/gift-boxes" className="hover:text-[#B8965C] transition-colors">
          Gift Boxes
        </Link>
        <span>/</span>
        <Link href="/admin/gift-boxes/orders" className="hover:text-[#B8965C] transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-[#111111]">{order.orderNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`inline-block text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border ${
            statusColors[order.status]
          }`}
        >
          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gift box */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Gift Box
              </p>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="relative w-14 h-18 shrink-0 overflow-hidden">
                <Image
                  src={order.giftBox.image}
                  alt={order.giftBox.title}
                  width={56}
                  height={72}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-[#B8965C] text-[10px] tracking-[0.2em] uppercase mb-1">
                  {meta.label}
                </p>
                <p className="font-serif text-base font-medium text-[#111111]">
                  {order.giftBox.title}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-0.5">
                  Box price: {formatCurrency(order.boxPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Contents ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
              </p>
            </div>
            <div className="divide-y divide-[#f0ece4]">
              {order.items.map((item: GiftOrderLineItem) => (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  <div className="relative w-10 h-12 shrink-0 overflow-hidden bg-[#F2EDE8]">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111111] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#8C8C8C]">
                      Qty: {item.quantity} · {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[#111111] shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[#e5e5e5] bg-[#F8F5F2] space-y-1">
              <div className="flex justify-between text-xs text-[#8C8C8C]">
                <span>Products</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#8C8C8C]">
                <span>Box</span>
                <span>{formatCurrency(order.boxPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#111111] pt-1 border-t border-[#e5e5e5]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Personalisation
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
                    Card Style
                  </p>
                  <p className="text-[#111111]">
                    {GIFT_CARD_STYLE_META[order.customization.cardStyle].label}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
                    Ribbon
                  </p>
                  <p className="text-[#111111]">
                    {GIFT_RIBBON_STYLE_META[order.customization.ribbonStyle].label}
                  </p>
                </div>
                {order.customization.deliveryDate && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
                      Delivery Date
                    </p>
                    <p className="text-[#111111]">
                      {new Date(
                        order.customization.deliveryDate
                      ).toLocaleDateString("en-NG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
                    Anonymous
                  </p>
                  <p className="text-[#111111]">
                    {order.customization.anonymous ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              {order.customization.message && (
                <div className="pt-3 border-t border-[#f0ece4]">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-2">
                    Gift Message
                  </p>
                  <p className="text-sm text-[#4A4A4A] italic leading-relaxed">
                    &ldquo;{order.customization.message}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Customer + Status */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Customer
              </p>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <p className="font-medium text-[#111111]">{customer}</p>
              {order.user?.email && (
                <p className="text-[#8C8C8C] text-xs">{order.user.email}</p>
              )}
              {order.guestEmail && !order.user && (
                <p className="text-[#8C8C8C] text-xs">{order.guestEmail}</p>
              )}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Delivery Address
              </p>
            </div>
            <div className="p-5 text-sm text-[#4A4A4A] space-y-0.5">
              <p className="font-medium text-[#111111]">{address.name}</p>
              <p>{address.phone}</p>
              <p>{address.address}</p>
              <p>
                {address.city}
                {address.state ? `, ${address.state}` : ""}
              </p>
              <p>{address.country}</p>
            </div>
          </div>

          {/* Status update */}
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
                Update Status
              </p>
            </div>
            <div className="p-5">
              <GiftOrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
