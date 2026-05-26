"use server"

import { auth } from "@/lib/auth"
import { upsertShippingRate, bulkUpsertShippingRates } from "@/lib/shipping"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ── Update single rate ─────────────────────────────────────────────────────

const updateRateSchema = z.object({
  state: z.string().min(1, "State is required"),
  fee: z
    .number({ error: "Fee must be a number" })
    .min(0, "Fee cannot be negative"),
})

export type UpdateRateState = {
  errors?: Partial<Record<"state" | "fee" | "_form", string[]>>
  success?: boolean
}

export async function updateShippingRateAction(
  _prev: UpdateRateState,
  formData: FormData
): Promise<UpdateRateState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const parsed = updateRateSchema.safeParse({
    state: formData.get("state"),
    fee: Number(formData.get("fee")),
  })

  if (!parsed.success) {
    const fieldErrors: UpdateRateState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await upsertShippingRate(parsed.data.state, parsed.data.fee)
    revalidatePath("/admin/shipping")
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update shipping rate"
    return { errors: { _form: [msg] } }
  }
}

// ── Bulk update rates ──────────────────────────────────────────────────────

export async function bulkUpdateShippingRatesAction(
  rates: Array<{ state: string; fee: number }>
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await bulkUpsertShippingRates(rates)
    revalidatePath("/admin/shipping")
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update rates"
    return { success: false, error: msg }
  }
}
