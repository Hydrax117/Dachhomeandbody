"use server"

import { auth } from "@/lib/auth"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/categories"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryFormState = {
  errors?: Partial<Record<keyof z.infer<typeof categoryCreateSchema> | "_form", string[]>>
  success?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return null
  }
  return session
}

function revalidateAll() {
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/shop")
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  if (!(await requireAdmin())) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  }

  const parsed = categoryCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CategoryFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await createCategory(parsed.data)
  } catch (err: unknown) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A category with this name or slug already exists."
        : "Failed to create category. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidateAll()
  return { success: true }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  if (!(await requireAdmin())) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  }

  const parsed = categoryUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CategoryFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await updateCategory(id, parsed.data)
  } catch (err: unknown) {
    const msg =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A category with this name or slug already exists."
        : "Failed to update category. Please try again."
    return { errors: { _form: [msg] } }
  }

  revalidateAll()
  return { success: true }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) {
    return { error: "Unauthorized" }
  }

  try {
    await deleteCategory(id)
  } catch {
    return { error: "Failed to delete category. Please try again." }
  }

  revalidateAll()
  return {}
}
