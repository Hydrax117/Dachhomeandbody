"use server"

import { auth } from "@/lib/auth"
import { createProduct, deleteProduct, updateProduct, updateProductStock, stockAdjustmentSchema, productCreateSchema, productUpdateSchema } from "@/lib/products"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

export async function deleteProductAction(productId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await deleteProduct(productId)
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return {}
  } catch {
    return { error: "Failed to delete product. Please try again." }
  }
}

export type CreateProductState = {
  errors?: Partial<Record<keyof z.infer<typeof productCreateSchema> | "_form", string[]>>
  success?: boolean
}

export async function createProductAction(
  _prev: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  // Parse arrays from comma-separated strings
  const parseNotes = (val: FormDataEntryValue | null): string[] => {
    if (!val || typeof val !== "string") return []
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const parseMoodTags = (val: FormDataEntryValue | null): string[] => {
    if (!val || typeof val !== "string") return []
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const parseImages = (): string[] => {
    const all = formData.getAll("images")
    return all
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean)
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    compareAtPrice: formData.get("compareAtPrice")
      ? Number(formData.get("compareAtPrice"))
      : undefined,
    images: parseImages(),
    categoryId: formData.get("categoryId"),
    stock: Number(formData.get("stock")),
    sku: formData.get("sku"),
    featured: formData.get("featured") === "true",
    fragranceType: formData.get("fragranceType") || undefined,
    topNotes: parseNotes(formData.get("topNotes")),
    heartNotes: parseNotes(formData.get("heartNotes")),
    baseNotes: parseNotes(formData.get("baseNotes")),
    longevity: formData.get("longevity") || undefined,
    strength: formData.get("strength") || undefined,
    moodTags: parseMoodTags(formData.get("moodTags")),
    gender: formData.get("gender") || undefined,
  }

  const parsed = productCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CreateProductState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await createProduct(parsed.data)
  } catch (err: unknown) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A product with this slug or SKU already exists."
        : "Failed to create product. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  redirect("/admin/products")
}

export type UpdateProductState = {
  errors?: Partial<Record<keyof z.infer<typeof productUpdateSchema> | "_form", string[]>>
  success?: boolean
}

export async function updateProductAction(
  productId: string,
  _prev: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const parseNotes = (val: FormDataEntryValue | null): string[] => {
    if (!val || typeof val !== "string") return []
    return val.split(",").map((s) => s.trim()).filter(Boolean)
  }

  const parseImages = (): string[] => {
    const all = formData.getAll("images")
    return all.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean)
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    compareAtPrice: formData.get("compareAtPrice")
      ? Number(formData.get("compareAtPrice"))
      : undefined,
    images: parseImages(),
    categoryId: formData.get("categoryId"),
    stock: Number(formData.get("stock")),
    sku: formData.get("sku"),
    featured: formData.get("featured") === "true",
    fragranceType: formData.get("fragranceType") || undefined,
    topNotes: parseNotes(formData.get("topNotes")),
    heartNotes: parseNotes(formData.get("heartNotes")),
    baseNotes: parseNotes(formData.get("baseNotes")),
    longevity: formData.get("longevity") || undefined,
    strength: formData.get("strength") || undefined,
    moodTags: parseNotes(formData.get("moodTags")),
    gender: formData.get("gender") || undefined,
  }

  const parsed = productUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: UpdateProductState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await updateProduct(productId, parsed.data)
  } catch (err: unknown) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A product with this slug or SKU already exists."
        : "Failed to update product. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath("/shop")
  redirect("/admin/products")
}

export type UpdateStockState = {
  errors?: Partial<Record<keyof z.infer<typeof stockAdjustmentSchema> | "_form", string[]>>
  success?: boolean
}

export async function updateStockAction(
  productId: string,
  _prev: UpdateStockState,
  formData: FormData
): Promise<UpdateStockState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    newStock: Number(formData.get("newStock")),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  }

  const parsed = stockAdjustmentSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: UpdateStockState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await updateProductStock(productId, parsed.data, session.user.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update stock. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return { success: true }
}
