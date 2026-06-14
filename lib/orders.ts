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
import { revalidatePath } from "next/cache"

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
    variantId: string | null
    variantName: string | null
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
  items?: Array<{ productId: string; variantId?: string | null; variantName?: string | null; quantity: number; price: number }>
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
 * Safely parse a value that Paystack may have JSON-stringified in transit.
 * Paystack serialises nested objects/arrays as strings in metadata.
 */
function safeParseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value !== "string") return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

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
    select: { orderNumber: true, id: true },
  })

  // Paystack can stringify nested objects/arrays in metadata — deserialise defensively
  const rawMeta = metadata as Record<string, unknown> | null

  // ── Pay-For-Me reference detection ───────────────────────────────────────
  // If the reference starts with PAY-, extract the token from it and look up
  // the PaymentRequest directly from DB. This avoids any Paystack metadata
  // round-trip unreliability.
  // Reference format: PAY-[first 24 chars of token]-[4 char random]
  let payRequestToken: string | null = null
  if (reference.startsWith("PAY-")) {
    const parts = reference.split("-")
    // parts[0]="PAY", parts[1]=token-prefix, rest=random
    const tokenPrefix = parts[1] ?? ""
    if (tokenPrefix.length >= 16) {
      // Find the PaymentRequest whose token starts with this prefix
      const matchingRequest = await prisma.paymentRequest.findFirst({
        where: { token: { startsWith: tokenPrefix } },
        select: { token: true },
      })
      if (matchingRequest) {
        payRequestToken = matchingRequest.token
      }
    }
  }

  if (existing) {
    // Even on duplicate calls, fulfil the PaymentRequest if not yet done
    await fulfilPaymentRequestIfPresent(
      rawMeta, existing.id, existing.orderNumber,
      reference, amountKobo, customerEmail, payRequestToken
    )
    try {
      revalidatePath("/admin/orders")
      revalidatePath("/admin")
      revalidatePath("/account/orders")
      revalidatePath("/account/payment-requests")
    } catch { /* no-op outside Next.js context */ }
    return { orderNumber: existing.orderNumber, isNew: false }
  }

  const items = safeParseJson<OrderMetadata["items"]>(rawMeta?.items, undefined)
  const shippingAddress = safeParseJson<OrderMetadata["shippingAddress"]>(
    rawMeta?.shippingAddress,
    undefined
  )

  if (!items?.length || !shippingAddress) {
    throw new Error(`Missing order metadata for reference ${reference}`)
  }

  const totalNaira = fromKobo(amountKobo)
  const discount = Number(rawMeta?.discount ?? 0)
  const shippingCost = Number(rawMeta?.shippingCost ?? 0)
  const subtotal = totalNaira - shippingCost + discount

  // Coerce item fields to numbers (Paystack metadata serialises everything as strings)
  // Also normalise variantId/variantName — Paystack stringifies JS null as "null"
  const coercedItems = items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId && item.variantId !== "null" && item.variantId !== "" ? item.variantId : null,
    variantName: item.variantName && item.variantName !== "null" && item.variantName !== "" ? item.variantName : null,
    quantity: Number(item.quantity),
    price: Number(item.price),
  }))

  // Validate that all variantIds exist in the DB — FK constraint will fail otherwise
  const variantIdsToCheck = coercedItems.map((i) => i.variantId).filter(Boolean) as string[]
  const validVariants = variantIdsToCheck.length > 0
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIdsToCheck } },
        select: { id: true },
      })
    : []
  const validVariantIdSet = new Set(validVariants.map((v) => v.id))

  // Null out any variantId that doesn't exist in DB
  const safeItems = coercedItems.map((item) => ({
    ...item,
    variantId: item.variantId && validVariantIdSet.has(item.variantId) ? item.variantId : null,
  }))

  // Safely resolve userId — validate it exists in User table
  const rawUserId = (rawMeta?.userId as string | null) && (rawMeta?.userId as string) !== "null"
    ? (rawMeta?.userId as string)
    : null
  const userId = rawUserId
    ? (await prisma.user.findUnique({ where: { id: rawUserId }, select: { id: true } }))?.id ?? null
    : null

  // Safely resolve couponId — only use it if it's a non-empty string and
  // actually exists in the database (prevents FK constraint failures from
  // Paystack stringifying null values or stale IDs)
  const rawCouponId = (rawMeta?.couponId as string | null) || null
  const couponId = rawCouponId && rawCouponId !== "null"
    ? (await prisma.coupon.findUnique({ where: { id: rawCouponId }, select: { id: true } }))?.id ?? null
    : null
  const couponCode = (rawMeta?.couponCode as string | null) || null

  // Fetch products for stock decrement
  const productIds = safeItems.map((i) => i.productId)
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
        userId: userId,
        guestEmail: (rawMeta?.guestEmail as string | null) || customerEmail,
        guestName: (rawMeta?.guestName as string | null) ?? null,
        subtotal,
        discount,
        shippingCost,
        total: totalNaira,
        status: "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "paystack",
        paymentReference: reference,
        shippingAddress: shippingAddress as object,
        couponCode: couponCode,
        couponId: couponId,
        items: {
          create: safeItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    })

    // Decrement stock — prefer variant stock, fall back to product stock
    for (const item of safeItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
        // Re-sync product base stock to sum of variants
        const variants = await tx.productVariant.findMany({
          where: { productId: item.productId },
          select: { stock: true },
        })
        const totalStock = variants.reduce((s, v) => s + v.stock, 0)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: totalStock },
        })
      } else {
        if (!productMap.has(item.productId)) continue
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    // Coupon usage tracking — use the DB-validated couponId (never trust rawMeta directly)
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      })
      const couponRecord = await tx.coupon.findUnique({
        where: { id: couponId },
        select: { usageCount: true, maxUsageCount: true },
      })
      if (couponRecord?.maxUsageCount != null && couponRecord.usageCount >= couponRecord.maxUsageCount) {
        await tx.coupon.update({ where: { id: couponId }, data: { active: false } })
      }
    }
    // Clear persisted cart for authenticated users
    if (userId) {
      await tx.cartItem.deleteMany({ where: { userId } })
    }

    return newOrder
  })

  // Send confirmation email (non-blocking — don't fail the order if email fails)
  try {
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: { select: { name: true } } } } },
    })

    const userRecord = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        })
      : null

    const guestEmail = rawMeta?.guestEmail as string | null | undefined
    const guestName = rawMeta?.guestName as string | null | undefined

    const recipientEmail = userRecord?.email ?? guestEmail ?? customerEmail
    const recipientName = userRecord?.name ?? guestName ?? null

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

  // If this payment came from a "Pay For Me" link, fulfil the request and notify everyone.
  await fulfilPaymentRequestIfPresent(
    rawMeta, order.id, order.orderNumber,
    reference, amountKobo, customerEmail, payRequestToken
  )

  // Revalidate admin and user dashboards so the new order shows immediately
  try {
    revalidatePath("/admin/orders")
    revalidatePath("/admin")
    revalidatePath("/account/orders")
    revalidatePath("/account/payment-requests")
  } catch {
    // revalidatePath is a no-op outside of Next.js request context (e.g. webhook)
  }

  return { orderNumber: order.orderNumber, isNew: true }
}

// ── Post-order payment request fulfilment ─────────────────────────────────

/**
 * If metadata contains a paymentRequestToken, mark the PaymentRequest as PAID
 * and send all three notification emails (requester, payer, admin).
 *
 * Uses the Paystack-verified customerEmail as the authoritative payer email
 * (payerEmail in metadata may have been dropped/stringified by Paystack).
 */
async function fulfilPaymentRequestIfPresent(
  rawMeta: Record<string, unknown> | null,
  orderId: string,
  orderNumber: string,
  paymentReference: string,
  amountKobo: number,
  customerEmail: string,
  /** Token extracted from the reference string — more reliable than metadata */
  referenceToken: string | null = null
) {
  // Prefer token extracted from reference (100% reliable), fall back to metadata
  const rawToken = referenceToken ?? rawMeta?.paymentRequestToken
  const token = typeof rawToken === "string" && rawToken.length > 0 ? rawToken : null
  if (!token) return   // Not a Pay-For-Me payment

  // customerEmail is the Paystack-verified payer email
  const payerEmail = customerEmail

  try {
    const { fulfillPaymentRequest } = await import("@/lib/payment-requests")

    // fulfillPaymentRequest is idempotent — safe to call multiple times
    const request = await fulfillPaymentRequest(token, paymentReference, payerEmail, orderId)
    if (!request) return

    // Revalidate the requester's payment requests page so status shows as PAID immediately
    try {
      revalidatePath("/account/payment-requests")
      revalidatePath("/admin/payment-requests")
    } catch { /* no-op outside Next.js context */ }

    const {
      sendPaymentRequestFulfilledEmail,
      sendPayerConfirmationEmail,
      sendAdminPaymentRequestNotification,
    } = await import("@/lib/email")

    const { fromKobo: fk } = await import("@/lib/paystack")
    const total = fk(amountKobo)

    const items = request.items as Array<{ name: string; quantity: number; price: number }>
    const shippingAddress = request.shippingAddress as {
      name: string; address: string; city: string; state?: string | null
      postalCode: string; country: string; phone: string
    }

    const emailDetails = {
      items,
      subtotal: request.subtotal,
      discount: request.discount,
      shippingCost: request.shippingCost,
      total,
      shippingAddress,
      paymentRequestToken: token,
    }

    await Promise.allSettled([
      sendPaymentRequestFulfilledEmail(
        request.requesterEmail,
        orderNumber,
        payerEmail,
        emailDetails,
        request.requesterName
      ),
      sendPayerConfirmationEmail(payerEmail, orderNumber, request.requesterName, emailDetails),
      ...(process.env.ADMIN_EMAIL
        ? [sendAdminPaymentRequestNotification(
            process.env.ADMIN_EMAIL,
            orderNumber,
            request.requesterEmail,
            payerEmail,
            total
          )]
        : []),
    ])
  } catch (err) {
    // Log but don't crash — the order is already created successfully
    console.error("fulfilPaymentRequestIfPresent error:", err)
  }
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
      variantId: true,
      variantName: true,
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
          items: { select: { productId: true, variantId: true, quantity: true } },
        },
      })

      if (!current) throw new Error("Order not found")

      // Only restore stock if transitioning from a non-cancelled state
      if (current.status !== "CANCELLED" && current.status !== "REFUNDED") {
        for (const item of current.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
            // Re-sync product base stock
            const variants = await tx.productVariant.findMany({
              where: { productId: item.productId },
              select: { stock: true },
            })
            const totalStock = variants.reduce((s, v) => s + v.stock, 0)
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: totalStock },
            })
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }
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

/**
 * Process a refund for an order.
 * Updates order status to REFUNDED, payment status to REFUNDED,
 * and restores stock for all items.
 * Requirements: 9.4
 */
export async function processRefund(
  id: string,
  refundAmount: number,
  notes?: string
): Promise<{ orderNumber: string }> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: {
        status: true,
        orderNumber: true,
        items: { select: { productId: true, variantId: true, quantity: true } },
      },
    })

    if (!order) throw new Error("Order not found")
    if (order.status === "REFUNDED") throw new Error("Order has already been refunded")

    // Restore stock if order was not already cancelled
    if (order.status !== "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
          const variants = await tx.productVariant.findMany({
            where: { productId: item.productId },
            select: { stock: true },
          })
          const totalStock = variants.reduce((s, v) => s + v.stock, 0)
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }

    const updated = await tx.order.update({
      where: { id },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
        notes: notes ?? null,
      },
      select: { orderNumber: true },
    })

    return updated
  })
}
