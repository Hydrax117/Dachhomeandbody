"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  createGiftBox,
  updateGiftBox,
  deleteGiftBox,
  createGiftOrder,
  updateGiftOrderStatus,
  giftBoxCreateSchema,
  giftBoxUpdateSchema,
  giftOrderCreateSchema,
  type GiftOrderStatus,
} from "@/lib/gift-boxes"

// ── Admin: Create Gift Box ─────────────────────────────────────────────────

export type GiftBoxFormState = {
  errors?: Partial<
    Record<keyof z.infer<typeof giftBoxCreateSchema> | "_form", string[]>
  >
  success?: boolean
}

export async function createGiftBoxAction(
  _prev: GiftBoxFormState,
  formData: FormData
): Promise<GiftBoxFormState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    maxItems: Number(formData.get("maxItems")),
    price: Number(formData.get("price")),
    theme: formData.get("theme"),
    active: formData.get("active") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  }

  const parsed = giftBoxCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: GiftBoxFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await createGiftBox(parsed.data)
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A gift box with this slug already exists."
        : "Failed to create gift box. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidatePath("/admin/gift-boxes")
  revalidatePath("/gift-box")
  redirect("/admin/gift-boxes")
}

export async function updateGiftBoxAction(
  id: string,
  _prev: GiftBoxFormState,
  formData: FormData
): Promise<GiftBoxFormState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    maxItems: Number(formData.get("maxItems")),
    price: Number(formData.get("price")),
    theme: formData.get("theme"),
    active: formData.get("active") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  }

  const parsed = giftBoxUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: GiftBoxFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await updateGiftBox(id, parsed.data)
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A gift box with this slug already exists."
        : "Failed to update gift box. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidatePath("/admin/gift-boxes")
  revalidatePath("/gift-box")
  redirect("/admin/gift-boxes")
}

export async function deleteGiftBoxAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await deleteGiftBox(id)
    revalidatePath("/admin/gift-boxes")
    revalidatePath("/gift-box")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete gift box." }
  }
}

// ── Admin: Update Gift Order Status ───────────────────────────────────────

const VALID_GIFT_ORDER_STATUSES: GiftOrderStatus[] = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export async function updateGiftOrderStatusAction(
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  if (!VALID_GIFT_ORDER_STATUSES.includes(status as GiftOrderStatus)) {
    return { success: false, error: "Invalid status" }
  }

  try {
    await updateGiftOrderStatus(orderId, status as GiftOrderStatus)
    revalidatePath(`/admin/gift-boxes/orders/${orderId}`)
    revalidatePath("/admin/gift-boxes/orders")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update order status." }
  }
}

// ── Customer: Place Gift Order ─────────────────────────────────────────────

export type PlaceGiftOrderState = {
  errors?: Partial<
    Record<keyof z.infer<typeof giftOrderCreateSchema> | "_form", string[]>
  >
  success?: boolean
  orderId?: string
  orderNumber?: string
}

export async function placeGiftOrderAction(
  _prev: PlaceGiftOrderState,
  formData: FormData
): Promise<PlaceGiftOrderState> {
  const session = await auth()

  // Parse product IDs (comma-separated)
  const productIdsRaw = formData.get("productIds")
  const productIds =
    typeof productIdsRaw === "string"
      ? productIdsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  // Parse delivery date
  const deliveryDateRaw = formData.get("deliveryDate")
  const deliveryDate =
    deliveryDateRaw && typeof deliveryDateRaw === "string"
      ? new Date(deliveryDateRaw)
      : undefined

  const raw = {
    giftBoxId: formData.get("giftBoxId"),
    productIds,
    customization: {
      message: formData.get("message") || undefined,
      cardStyle: formData.get("cardStyle") || "MINIMAL",
      ribbonStyle: formData.get("ribbonStyle") || "BLACK_SATIN",
      deliveryDate,
      anonymous: formData.get("anonymous") === "true",
    },
    shippingAddress: {
      name: formData.get("shippingName"),
      phone: formData.get("shippingPhone"),
      address: formData.get("shippingAddress"),
      city: formData.get("shippingCity"),
      state: formData.get("shippingState") || undefined,
      postalCode: formData.get("shippingPostalCode"),
      country: formData.get("shippingCountry") || "Nigeria",
    },
    paymentMethod: formData.get("paymentMethod") || "paystack",
    notes: formData.get("notes") || undefined,
  }

  const parsed = giftOrderCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: PlaceGiftOrderState["errors"] = {}
    for (const [key, msgs] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    const order = await createGiftOrder(parsed.data, session?.user?.id)
    revalidatePath("/account/gift-orders")
    return { success: true, orderId: order.id, orderNumber: order.orderNumber }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to place order. Please try again."
    return { errors: { _form: [msg] } }
  }
}
