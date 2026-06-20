"use server"

import { auth } from "@/lib/auth"
import {
  createStaffMember,
  deactivateStaffMember,
  reactivateStaffMember,
  staffCreateSchema,
} from "@/lib/staff"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ── Guard ──────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

// ── Types ──────────────────────────────────────────────────────────────────

export type CreateStaffState = {
  errors?: Partial<Record<keyof z.infer<typeof staffCreateSchema> | "_form", string[]>>
  success?: boolean
  staffId?: string
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createStaffAction(
  _prev: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  if (!(await requireAdmin())) {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  }

  const parsed = staffCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: CreateStaffState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    const staff = await createStaffMember(parsed.data)
    revalidatePath("/admin/staff")
    return { success: true, staffId: staff.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create staff account."
    return { errors: { _form: [msg] } }
  }
}

// ── Deactivate ─────────────────────────────────────────────────────────────

export async function deactivateStaffAction(
  id: string
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" }

  try {
    await deactivateStaffMember(id)
    revalidatePath("/admin/staff")
    return {}
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to deactivate staff member."
    return { error: msg }
  }
}

// ── Reactivate ─────────────────────────────────────────────────────────────

export async function reactivateStaffAction(
  id: string
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" }

  try {
    await reactivateStaffMember(id)
    revalidatePath("/admin/staff")
    return {}
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reactivate staff member."
    return { error: msg }
  }
}
