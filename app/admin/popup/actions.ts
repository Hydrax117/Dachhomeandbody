"use server"

import { auth } from "@/lib/auth"
import { upsertPopupConfig, popupConfigSchema } from "@/lib/popup"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopupFormState = {
  errors?: Partial<Record<keyof z.infer<typeof popupConfigSchema> | "_form", string[]>>
  success?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function updatePopupConfigAction(
  _prev: PopupFormState,
  formData: FormData
): Promise<PopupFormState> {
  if (!(await requireAdmin())) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  // "enabled" is submitted as a single hidden field whose value is set by JS
  // to "true" or "false" — no checkbox ambiguity.
  const raw = {
    enabled: formData.get("enabled") === "true",
    title: formData.get("title"),
    description: formData.get("description") || "",
    ctaLabel: formData.get("ctaLabel"),
    ctaUrl: formData.get("ctaUrl"),
    imageUrl: formData.get("imageUrl") || "",
    productName: formData.get("productName") || "",
    productId: formData.get("productId") || "",
    originalPrice: formData.get("originalPrice") || null,
    discountPercent: formData.get("discountPercent") || null,
    delaySeconds: formData.get("delaySeconds") || 4,
    startDate: formData.get("startDate") || "",
    endDate: formData.get("endDate") || "",
  }

  const parsed = popupConfigSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: PopupFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await upsertPopupConfig(parsed.data)
  } catch {
    return { errors: { _form: ["Failed to save popup configuration. Please try again."] } }
  }

  revalidatePath("/admin/popup")
  revalidatePath("/")
  return { success: true }
}
