"use server"

import { auth } from "@/lib/auth"
import {
  createCoupon,
  setCouponActive,
  deleteCoupon,
  couponCreateSchema,
} from "@/lib/coupons"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ── Types ──────────────────────────────────────────────────────────────────

export type CouponFormState = {
  errors?: Partial<Record<keyof z.infer<typeof couponCreateSchema> | "_form", string[]>>
  success?: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

function revalidateAll() {
  revalidatePath("/admin/coupons")
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  if (!(await requireAdmin())) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue")),
    minOrderValue: formData.get("minOrderValue") ? Number(formData.get("minOrderValue")) : null,
    maxUsageCount: formData.get("maxUsageCount") ? Number(formData.get("maxUsageCount")) : null,
    expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
    active: formData.get("active") === "true",
  }

  const parsed = couponCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CouponFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await createCoupon(parsed.data)
  } catch (err: unknown) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A coupon with this code already exists."
        : "Failed to create coupon. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidateAll()
  return { success: true }
}

// ── Toggle active ──────────────────────────────────────────────────────────

export async function toggleCouponActiveAction(
  id: string,
  active: boolean
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" }

  try {
    await setCouponActive(id, active)
  } catch {
    return { error: "Failed to update coupon." }
  }

  revalidateAll()
  return {}
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteCouponAction(id: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" }

  try {
    await deleteCoupon(id)
  } catch {
    return { error: "Cannot delete a coupon that has been used on orders." }
  }

  revalidateAll()
  return {}
}
