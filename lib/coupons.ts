/**
 * Coupon data access functions.
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

import { z } from "zod"
import { type DiscountType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// ── Validation schemas ─────────────────────────────────────────────────────

export const couponCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[A-Z0-9_-]+$/i, "Code may only contain letters, numbers, hyphens, and underscores")
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    error: "Discount type is required",
  }),
  discountValue: z
    .number({ error: "Discount value must be a number" })
    .positive("Discount value must be greater than 0"),
  minOrderValue: z
    .number({ error: "Minimum order value must be a number" })
    .nonnegative("Minimum order value must be 0 or greater")
    .optional()
    .nullable(),
  maxUsageCount: z
    .number({ error: "Max usage must be a number" })
    .int("Max usage must be a whole number")
    .positive("Max usage must be greater than 0")
    .optional()
    .nullable(),
  expiresAt: z.date().optional().nullable(),
  active: z.boolean().optional().default(true),
})

export type CouponCreateInput = z.infer<typeof couponCreateSchema>

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminCouponRow {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderValue: number | null
  maxUsageCount: number | null
  usageCount: number
  expiresAt: Date | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  _count: { orders: number }
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Get all coupons for admin display, sorted by creation date (newest first).
 * Requirements: 11.1, 11.4
 */
export async function getAdminCoupons(): Promise<AdminCouponRow[]> {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      minOrderValue: true,
      maxUsageCount: true,
      usageCount: true,
      expiresAt: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { orders: true } },
    },
  }) as Promise<AdminCouponRow[]>
}

/**
 * Create a new coupon.
 * Requirements: 11.1
 */
export async function createCoupon(data: CouponCreateInput): Promise<void> {
  await prisma.coupon.create({
    data: {
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderValue: data.minOrderValue ?? null,
      maxUsageCount: data.maxUsageCount ?? null,
      expiresAt: data.expiresAt ?? null,
      active: data.active,
    },
  })
}

/**
 * Toggle a coupon's active state.
 * Requirements: 11.4
 */
export async function setCouponActive(id: string, active: boolean): Promise<void> {
  await prisma.coupon.update({
    where: { id },
    data: { active },
  })
}

/**
 * Delete a coupon. Only allowed if it has never been used on an order.
 */
export async function deleteCoupon(id: string): Promise<void> {
  await prisma.coupon.delete({ where: { id } })
}

/**
 * Validate a coupon code for use at checkout.
 * Returns the coupon if valid, throws a descriptive error otherwise.
 * Requirements: 11.2, 11.3, 11.4, 11.5, 11.6
 */
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<{ id: string; discountType: DiscountType; discountValue: number }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon) throw new Error("Coupon code not found.")
  if (!coupon.active) throw new Error("This coupon is no longer active.")
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw new Error("This coupon has expired.")
  if (coupon.maxUsageCount != null && coupon.usageCount >= coupon.maxUsageCount)
    throw new Error("This coupon has reached its usage limit.")
  if (coupon.minOrderValue != null && cartTotal < coupon.minOrderValue)
    throw new Error(
      `A minimum order of ₦${coupon.minOrderValue.toLocaleString()} is required for this coupon.`
    )

  return { id: coupon.id, discountType: coupon.discountType, discountValue: coupon.discountValue }
}
