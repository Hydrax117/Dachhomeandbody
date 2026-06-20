"use server"

import { auth } from "@/lib/auth"
import { restockProduct, restockVariant, restockSchema } from "@/lib/products"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type RestockState = {
  errors?: Partial<Record<keyof z.infer<typeof restockSchema> | "_form", string[]>>
  success?: boolean
}

export async function restockProductAction(
  productId: string,
  _prev: RestockState,
  formData: FormData
): Promise<RestockState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const parsed = restockSchema.safeParse({
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  })

  if (!parsed.success) {
    const fieldErrors: RestockState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await restockProduct(productId, parsed.data, session.user.id)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to restock."
    return { errors: { _form: [msg] } }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath("/admin/products")
  revalidatePath("/admin/inventory")
  revalidatePath("/shop")
  return { success: true }
}

export async function restockVariantAction(
  productId: string,
  variantId: string,
  _prev: RestockState,
  formData: FormData
): Promise<RestockState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const parsed = restockSchema.safeParse({
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  })

  if (!parsed.success) {
    const fieldErrors: RestockState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await restockVariant(variantId, parsed.data, session.user.id)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to restock variant."
    return { errors: { _form: [msg] } }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath("/admin/products")
  revalidatePath("/admin/inventory")
  revalidatePath("/shop")
  return { success: true }
}
