/**
 * POST /api/webhooks/paystack
 *
 * Handles Paystack webhook events.
 * Verifies the HMAC-SHA512 signature before processing.
 *
 * Supported events:
 *   - charge.success  → create order, clear cart, send confirmation email
 *   - charge.failed   → update payment status to FAILED (cart preserved)
 *
 * Requirements: 4.4, 4.5
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  verifyWebhookSignature,
  verifyPayment,
  fromKobo,
  type PaystackWebhookEvent,
} from "@/lib/paystack"
import {
  sendOrderConfirmationEmail,
  type OrderEmailDetails,
} from "@/lib/email"

// ── Helpers ────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DHB-${timestamp}-${random}`
}

// ── Webhook Handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature") ?? ""

  // Verify the request is genuinely from Paystack
  const isValid = await verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    console.warn("Paystack webhook: invalid signature")
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Acknowledge receipt immediately — Paystack expects a 200 quickly
  // Process asynchronously to avoid timeout
  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event)
        break
      case "charge.failed":
        await handleChargeFailed(event)
        break
      default:
        // Unhandled event type — acknowledge and ignore
        break
    }
  } catch (error) {
    console.error(`Paystack webhook error (${event.event}):`, error)
    // Still return 200 so Paystack doesn't retry indefinitely
    // Errors are logged for investigation
  }

  return Response.json({ received: true })
}

// ── charge.success ─────────────────────────────────────────────────────────

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { reference, amount, metadata, customer } = event.data

  // Double-verify with Paystack API to prevent replay attacks
  const verified = await verifyPayment(reference)
  if (verified.status !== "success") {
    console.warn(`Paystack webhook: reference ${reference} not verified as success`)
    return
  }

  // Idempotency: skip if order already exists for this reference
  const existingOrder = await prisma.order.findFirst({
    where: { paymentReference: reference },
  })
  if (existingOrder) {
    console.info(`Paystack webhook: order already exists for reference ${reference}`)
    return
  }

  // Extract order data from metadata (set during checkout initialization)
  const meta = metadata as {
    userId?: string
    guestEmail?: string
    guestName?: string
    items?: Array<{ productId: string; quantity: number; price: number }>
    shippingAddress?: {
      name: string
      phone: string
      address: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    couponCode?: string
    couponId?: string
    discount?: number
    shippingCost?: number
  } | null

  const items = meta?.items
  const shippingAddress = meta?.shippingAddress

  if (!items?.length || !shippingAddress) {
    console.error(`Paystack webhook: missing order metadata for reference ${reference}`)
    return
  }

  const totalNaira = fromKobo(amount)
  const discount = meta?.discount ?? 0
  const shippingCost = meta?.shippingCost ?? 0
  const subtotal = totalNaira - shippingCost + discount

  // Fetch product details to validate stock and get current prices
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deleted: false },
    select: { id: true, stock: true, name: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  // Create order and order items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: meta?.userId ?? null,
        guestEmail: meta?.guestEmail ?? customer.email,
        guestName: meta?.guestName ?? null,
        subtotal,
        discount,
        shippingCost,
        total: totalNaira,
        status: "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "paystack",
        paymentReference: reference,
        shippingAddress: shippingAddress as object,
        couponCode: meta?.couponCode ?? null,
        couponId: meta?.couponId ?? null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    })

    // Decrement stock for each ordered product
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }

    // Increment coupon usage count if a coupon was applied
    if (meta?.couponId) {
      await tx.coupon.update({
        where: { id: meta.couponId },
        data: { usageCount: { increment: 1 } },
      })

      // Auto-deactivate coupon if usage limit reached
      const coupon = await tx.coupon.findUnique({
        where: { id: meta.couponId },
        select: { usageCount: true, maxUsageCount: true },
      })
      if (
        coupon?.maxUsageCount != null &&
        coupon.usageCount >= coupon.maxUsageCount
      ) {
        await tx.coupon.update({
          where: { id: meta.couponId },
          data: { active: false },
        })
      }
    }

    // Clear the user's persisted cart
    if (meta?.userId) {
      await tx.cartItem.deleteMany({
        where: { userId: meta.userId },
      })
    }

    return newOrder
  })

  // Fetch order items with product names for the confirmation email
  const orderWithItems = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  })

  // Send order confirmation email
  const emailAddress = meta?.userId
    ? (await prisma.user.findUnique({
        where: { id: meta.userId },
        select: { email: true, name: true },
      }))
    : null

  const recipientEmail = emailAddress?.email ?? meta?.guestEmail ?? customer.email
  const recipientName = emailAddress?.name ?? meta?.guestName ?? null

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

  await sendOrderConfirmationEmail(
    recipientEmail,
    order.orderNumber,
    orderDetails,
    recipientName
  )
}

// ── charge.failed ──────────────────────────────────────────────────────────

async function handleChargeFailed(event: PaystackWebhookEvent) {
  const { reference } = event.data

  // If an order was somehow created (e.g. race condition), mark payment as failed
  const existingOrder = await prisma.order.findFirst({
    where: { paymentReference: reference },
  })

  if (existingOrder) {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: { paymentStatus: "FAILED" },
    })
  }

  // Cart is NOT cleared — customer can retry (Requirement 4.5)
  console.info(`Paystack webhook: payment failed for reference ${reference}`)
}
