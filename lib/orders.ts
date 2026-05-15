/**
 * Order data access functions.
 * Covers order creation (from payment), customer-facing queries, and admin queries.
 *
 * Requirements: 4.4, 5.1, 5.2, 9.1, 9.3
 */

import { type Prisma, type OrderStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail, type OrderEmailDetails } from "@/lib/email"
import { fromKobo } from "@/lib/paystack"
import {
  buildPaginationArgs,
  paginate,
  type PaginationParams,
} from "@/lib/db"

// ── Types ──────────────────────────────────────────────────────────────────

/** Shape returned by admin order list queries. */
export interface AdminOrderRow {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentReference: string | null
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  couponCode: string | null
  shippingAddress: Prisma.JsonValue
  createdAt: Date
  updatedAt: Date
  shippedAt: Date | null
  deliveredAt: Date | null
  userId: string | null
  guestEmail: string | null
  guestName: string | null
  user: { id: string; name: string | null; email: string } | null
  items: Array<{
    id: string
    quantity: number
    price: number
    subtotal: number
    product: {
      id: string
      name: string
      slug: string
      images: string[]
      sku: string
    }
  }>
}

export interface OrderMetadata {
  userId?: string | null
  guestEmail?: string | null
  guestName?: string | null
  items?: Array<{ productId: string; quantity: number; price: number }>
  shippingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
  }
  couponCode?: string | null
  couponId?: string | null
  discount?: number
  shippingCost?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DHB-${timestamp}-${random}`
}

// ── Create order from verified payment ────────────────────────────────────

/**
 * Creates an order from a verified Paystack payment.
 * Idempotent — safe to call multiple times for the same reference.
 * Returns the order (existing or newly created).
 */
export async function createOrderFromPayment({
  reference,
  amountKobo,
  metadata,
  customerEmail,
}: {
  reference: string
  amountKobo: number
  metadata: OrderMetadata | null
  customerEmail: string
}): Promise<{ orderNumber: string; isNew: boolean }> {
  // Idempotency check — return existing order if already created
  const existing = await prisma.order.findFirst({
    where: { paymentReference: reference },
    select: { orderNumber: true },
  })
  if (existing) {
    return { orderNumber: existing.orderNumber, isNew: false }
  }

  const items = metadata?.items
  const shippingAddress = metadata?.shippingAddress

  if (!items?.length || !shippingAddress) {
    throw new Error(`Missing order metadata for reference ${reference}`)
  }

  const totalNaira = fromKobo(amountKobo)
  const discount = Number(metadata?.discount ?? 0)
  const shippingCost = Number(metadata?.shippingCost ?? 0)
  const subtotal = totalNaira - shippingCost + discount

  // Coerce item fields to numbers (Paystack metadata serialises everything as strings)
  const coercedItems = items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    price: Number(item.price),
  }))

  // Fetch products for stock decrement
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deleted: false },
    select: { id: true, stock: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: metadata?.userId ?? null,
        guestEmail: metadata?.guestEmail || customerEmail,
        guestName: metadata?.guestName ?? null,
        subtotal,
        discount,
        shippingCost,
        total: totalNaira,
        status: "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "paystack",
        paymentReference: reference,
        shippingAddress: shippingAddress as object,
        couponCode: metadata?.couponCode || null,
        couponId: metadata?.couponId ?? null,
        items: {
          create: coercedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    })

    // Decrement stock
    for (const item of coercedItems) {
      if (!productMap.has(item.productId)) continue
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Coupon usage tracking
    if (metadata?.couponId) {
      await tx.coupon.update({
        where: { id: metadata.couponId },
        data: { usageCount: { increment: 1 } },
      })

      const coupon = await tx.coupon.findUnique({
        where: { id: metadata.couponId },
        select: { usageCount: true, maxUsageCount: true },
      })
      if (coupon?.maxUsageCount != null && coupon.usageCount >= coupon.maxUsageCount) {
        await tx.coupon.update({
          where: { id: metadata.couponId },
          data: { active: false },
        })
      }
    }

    // Clear persisted cart for authenticated users
    if (metadata?.userId) {
      await tx.cartItem.deleteMany({ where: { userId: metadata.userId } })
    }

    return newOrder
  })

  // Send confirmation email (non-blocking — don't fail the order if email fails)
  try {
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: { select: { name: true } } } } },
    })

    const userRecord = metadata?.userId
      ? await prisma.user.findUnique({
          where: { id: metadata.userId },
          select: { email: true, name: true },
        })
      : null

    const recipientEmail = userRecord?.email ?? metadata?.guestEmail ?? customerEmail
    const recipientName = userRecord?.name ?? metadata?.guestName ?? null

    const orderDetails: OrderEmailDetails = {
      items: (orderWithItems?.items ?? []).map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      discount,
      shippingCost,
      total: totalNaira,
      shippingAddress,
    }

    await sendOrderConfirmationEmail(recipientEmail, order.orderNumber, orderDetails, recipientName)
  } catch (emailError) {
    console.error("Failed to send order confirmation email:", emailError)
  }

  return { orderNumber: order.orderNumber, isNew: true }
}

// ── Shared select shapes ───────────────────────────────────────────────────

/** Minimal order fields for list views. */
const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentReference: true,
  subtotal: true,
  discount: true,
  shippingCost: true,
  total: true,
  couponCode: true,
  shippingAddress: true,
  createdAt: true,
  updatedAt: true,
  shippedAt: true,
  deliveredAt: true,
  userId: true,
  guestEmail: true,
  guestName: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderSelect

/** Full order with items and product details for detail views. */
const orderDetailSelect = {
  ...orderListSelect,
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      subtotal: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          sku: true,
        },
      },
    },
  },
} satisfies Prisma.OrderSelect

// ── Customer-facing queries ────────────────────────────────────────────────

/**
 * Get all orders for a user, sorted newest first, with pagination.
 * Requirements: 5.1
 */
export async function getUserOrders(
  userId: string,
  pagination: PaginationParams = {}
) {
  const { skip, take } = buildPaginationArgs(pagination)
  const where: Prisma.OrderWhereInput = { userId }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: orderDetailSelect,
    }),
    prisma.order.count({ where }),
  ])

  return paginate(data, total, pagination)
}

/**
 * Get a single order by id, including all items and product details.
 * Requirements: 5.2, 9.3
 */
export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    select: orderDetailSelect,
  })
}

/**
 * Get a single order by order number (used on confirmation page).
 * Requirements: 4.8, 5.4
 */
export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    select: orderDetailSelect,
  })
}

// ── Admin queries ──────────────────────────────────────────────────────────

export interface AdminOrderFilters {
  status?: OrderStatus
  /** ISO date string — orders created on or after this date */
  startDate?: string
  /** ISO date string — orders created on or before this date */
  endDate?: string
  /** Matches customer name, email, or order number */
  search?: string
  userId?: string
}

export type AdminOrderSort = "newest" | "oldest" | "total_desc" | "total_asc"

/**
 * Build a Prisma `where` clause from AdminOrderFilters.
 */
function buildAdminOrderWhere(
  filters: AdminOrderFilters
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {}

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.userId) {
    where.userId = filters.userId
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate)
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  if (filters.search) {
    const term = filters.search.trim()
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { guestName: { contains: term, mode: "insensitive" } },
      { guestEmail: { contains: term, mode: "insensitive" } },
    ]
  }

  return where
}

function buildAdminOrderOrderBy(
  sort: AdminOrderSort
): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" }
    case "total_desc":
      return { total: "desc" }
    case "total_asc":
      return { total: "asc" }
    case "newest":
    default:
      return { createdAt: "desc" }
  }
}

/**
 * Get all orders for admin with filters, sorting, and pagination.
 * Requirements: 9.1, 9.5
 */
export async function getAdminOrders(
  filters: AdminOrderFilters = {},
  sort: AdminOrderSort = "newest",
  pagination: PaginationParams = {}
): Promise<import("@/lib/db").PaginatedResult<AdminOrderRow>> {
  const where = buildAdminOrderWhere(filters)
  const orderBy = buildAdminOrderOrderBy(sort)
  const { skip, take } = buildPaginationArgs(pagination)

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take,
      select: orderDetailSelect,
    }) as Promise<AdminOrderRow[]>,
    prisma.order.count({ where }),
  ])

  return paginate(data, total, pagination)
}

/**
 * Update order status and optionally set shipped/delivered timestamps.
 * When an order is cancelled, restores stock for all order items.
 * Requirements: 9.2, 5.5, 18.5
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ orderNumber: string; status: OrderStatus }> {
  const data: Prisma.OrderUpdateInput = { status }

  if (status === "SHIPPED") data.shippedAt = new Date()
  if (status === "DELIVERED") data.deliveredAt = new Date()

  // When cancelling, restore stock for all items in a transaction
  if (status === "CANCELLED") {
    return prisma.$transaction(async (tx) => {
      // Fetch current order to check it's not already cancelled
      const current = await tx.order.findUnique({
        where: { id },
        select: {
          status: true,
          items: { select: { productId: true, quantity: true } },
        },
      })

      if (!current) throw new Error("Order not found")

      // Only restore stock if transitioning from a non-cancelled state
      if (current.status !== "CANCELLED" && current.status !== "REFUNDED") {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data,
        select: { orderNumber: true, status: true },
      })

      return updated
    })
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    select: { orderNumber: true, status: true },
  })

  return updated
}
