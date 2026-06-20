"use server"

import { auth } from "@/lib/auth"
import { createInStoreSale, inStoreSaleCreateSchema } from "@/lib/in-store"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type InStoreSaleState = {
  errors?: Partial<Record<string, string[]>>
  success?: boolean
  saleNumber?: string
}

export async function createInStoreSaleAction(
  _prev: InStoreSaleState,
  formData: FormData
): Promise<InStoreSaleState> {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  // Parse items JSON sent from the client form
  const itemsRaw = formData.get("items")
  let items: unknown
  try {
    items = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : []
  } catch {
    return { errors: { _form: ["Invalid items data."] } }
  }

  const raw = {
    items,
    customerName: formData.get("customerName") || undefined,
    paymentMethod: formData.get("paymentMethod") || "CASH",
    notes: formData.get("notes") || undefined,
  }

  const parsed = inStoreSaleCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: InStoreSaleState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    // Also surface nested item errors
    const nestedErrors = parsed.error.flatten().fieldErrors
    if (Object.keys(nestedErrors).length) {
      fieldErrors._form = ["Please check the item details and try again."]
    }
    return { errors: fieldErrors }
  }

  try {
    const sale = await createInStoreSale(parsed.data, session.user.id)
    revalidatePath("/admin/inventory/in-store")
    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/shop", "layout")
    return { success: true, saleNumber: sale.saleNumber }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to record sale."
    return { errors: { _form: [msg] } }
  }
}
