/**
 * Payment Request data access layer.
 *
 * A Payment Request is a "Pay For Me" link that lets a customer build their
 * cart, fill in their delivery details, and then share a one-time link with
 * someone else who completes the payment.
 *
 * Flow:
 *  1. Requester fills checkout → chooses "Request Payment" → record created (PENDING)
 *  2. Payer opens /pay/[token] → sees items + total → pays via Paystack
 *  3. Webhook / verify page calls fulfillPaymentRequest() → order created, status → PAID
 *  4. Both requester and payer receive confirmation emails
 *  5. Admin gets a notification email
 */

import { prisma } from "@/lib/prisma"
import { buildPaginationArgs, paginate, type PaginationParams } from "@/lib/db"
import type { Prisma } from "@prisma/client"
import crypto from "crypto"

// ── Constants ──────────────────────────────────────────────────────────────

/** How long a payment request link stays valid (48 hours). */
const EXPIRY_HOURS = 48

// ── Types ──────────────────────────────────────────────────────────────────

export interface PaymentRequestItem {
  productId: string
  variantId: string | null
  variantName: string | null
  quantity: number
  price: number
  name: string
  image: string | null
}

export interface PaymentRequestAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string | null
  postalCode: string
  country: string
}

export interface CreatePaymentRequestInput {
  userId?: string | null
  requesterEmail: string
  requesterName?: string | null
  items: PaymentRequestItem[]
  shippingAddress: PaymentRequestAddress
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  couponCode?: string | null
  couponId?: string | null
}

// ── Select shapes ──────────────────────────────────────────────────────────

const paymentRequestSelect = {
  id: true,
  token: true,
  userId: true,
  requesterEmail: true,
  requesterName: true,
  items: true,
  shippingAddress: true,
  subtotal: true,
  discount: true,
  shippingCost: true,
  total: true,
  couponCode: true,
  couponId: true,
  status: true,
  expiresAt: true,
  paymentReference: true,
  payerEmail: true,
  orderId: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PaymentRequestSelect

export type PaymentRequestRecord = NonNullable<
  Awaited<ReturnType<typeof getPaymentRequestByToken>>
>

// ── Token generation ───────────────────────────────────────────────────────

/** Generate a 32-byte cryptographically random hex token. */
export function generatePaymentRequestToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// ── Create ─────────────────────────────────────────────────────────────────

/**
 * Create a new payment request.
 * Returns the token and full record.
 */
export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  const token = generatePaymentRequestToken()
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000)

  return prisma.paymentRequest.create({
    data: {
      token,
      userId: input.userId ?? null,
      requesterEmail: input.requesterEmail,
      requesterName: input.requesterName ?? null,
      items: input.items as unknown as Prisma.InputJsonValue,
      shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
      subtotal: input.subtotal,
      discount: input.discount,
      shippingCost: input.shippingCost,
      total: input.total,
      couponCode: input.couponCode ?? null,
      couponId: input.couponId ?? null,
      expiresAt,
      status: "PENDING",
    },
    select: paymentRequestSelect,
  })
}

// ── Fetch by token (public payer page) ────────────────────────────────────

/**
 * Get a payment request by its public token.
 * Used on the /pay/[token] page.
 * Does NOT check expiry here — let the page decide what to show.
 */
export async function getPaymentRequestByToken(token: string) {
  return prisma.paymentRequest.findUnique({
    where: { token },
    select: paymentRequestSelect,
  })
}

// ── Fetch by id (admin) ───────────────────────────────────────────────────

export async function getPaymentRequestById(id: string) {
  return prisma.paymentRequest.findUnique({
    where: { id },
    select: paymentRequestSelect,
  })
}

// ── User's own requests ───────────────────────────────────────────────────

export async function getUserPaymentRequests(
  userId: string,
  pagination: PaginationParams = {}
) {
  const { skip, take } = buildPaginationArgs(pagination)
  const where: Prisma.PaymentRequestWhereInput = { userId }

  const [data, total] = await Promise.all([
    prisma.paymentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: paymentRequestSelect,
    }),
    prisma.paymentRequest.count({ where }),
  ])

  return paginate(data, total, pagination)
}

// ── Admin list ─────────────────────────────────────────────────────────────

export interface AdminPaymentRequestFilters {
  status?: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"
  search?: string
}

export async function getAdminPaymentRequests(
  filters: AdminPaymentRequestFilters = {},
  pagination: PaginationParams = {}
) {
  const where: Prisma.PaymentRequestWhereInput = {}
  if (filters.status) where.status = filters.status
  if (filters.search) {
    where.OR = [
      { requesterEmail: { contains: filters.search, mode: "insensitive" } },
      { requesterName: { contains: filters.search, mode: "insensitive" } },
      { payerEmail: { contains: filters.search, mode: "insensitive" } },
      { token: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const { skip, take } = buildPaginationArgs(pagination)
  const [data, total] = await Promise.all([
    prisma.paymentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: paymentRequestSelect,
    }),
    prisma.paymentRequest.count({ where }),
  ])

  return paginate(data, total, pagination)
}

// ── Fulfil (called by webhook / verify after successful payment) ───────────

/**
 * Mark a payment request as PAID, linking it to the created order.
 * Idempotent — if already PAID returns the existing record without error.
 */
export async function fulfillPaymentRequest(
  token: string,
  paymentReference: string,
  payerEmail: string,
  orderId: string
) {
  const request = await prisma.paymentRequest.findUnique({ where: { token } })
  if (!request) throw new Error(`Payment request not found: ${token}`)
  if (request.status === "PAID") {
    // Already fulfilled — idempotent
    return prisma.paymentRequest.findUnique({ where: { token }, select: paymentRequestSelect })
  }

  return prisma.paymentRequest.update({
    where: { token },
    data: {
      status: "PAID",
      paymentReference,
      payerEmail,
      orderId,
      paidAt: new Date(),
    },
    select: paymentRequestSelect,
  })
}

// ── Cancel (requester cancels their own link) ─────────────────────────────

export async function cancelPaymentRequest(id: string, userId: string) {
  const request = await prisma.paymentRequest.findUnique({ where: { id } })
  if (!request) throw new Error("Payment request not found")
  if (request.userId !== userId) throw new Error("Unauthorized")
  if (request.status !== "PENDING") throw new Error("Only pending requests can be cancelled")

  return prisma.paymentRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
    select: paymentRequestSelect,
  })
}

// ── Expire stale requests ─────────────────────────────────────────────────

/**
 * Mark all PENDING requests past their expiresAt as EXPIRED.
 * Call this from a cron job or inline before showing a request.
 */
export async function expireStalePaymentRequests() {
  return prisma.paymentRequest.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  })
}

/**
 * Check if a single token is still payable (PENDING + not expired).
 * Also auto-expires it if stale.
 */
export async function checkPaymentRequestPayable(
  token: string
): Promise<{ payable: boolean; reason?: string }> {
  const request = await prisma.paymentRequest.findUnique({ where: { token } })
  if (!request) return { payable: false, reason: "not_found" }
  if (request.status === "PAID") return { payable: false, reason: "already_paid" }
  if (request.status === "CANCELLED") return { payable: false, reason: "cancelled" }
  if (request.status === "EXPIRED") return { payable: false, reason: "expired" }

  // Auto-expire if past expiresAt
  if (new Date() > request.expiresAt) {
    await prisma.paymentRequest.update({
      where: { token },
      data: { status: "EXPIRED" },
    })
    return { payable: false, reason: "expired" }
  }

  return { payable: true }
}
