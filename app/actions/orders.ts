"use server"

import { auth } from "@/lib/auth"
import { updateOrderStatus, processRefund, getOrder } from "@/lib/orders"
import {
  sendShippingNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "@/lib/email"
import { type OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]

/**
 * Admin server action: update order status, set timestamps, and send
 * customer email notification.
 * Requirements: 5.5, 9.2
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return { success: false, error: "Invalid status" }
  }

  try {
    // Fetch order before update to get customer details
    const order = await getOrder(orderId)
    if (!order) {
      return { success: false, error: "Order not found" }
    }

    // Persist new status + timestamps
    await updateOrderStatus(orderId, status as OrderStatus)

    // Resolve recipient email and name
    const recipientEmail = order.user?.email ?? order.guestEmail
    const recipientName = order.user?.name ?? order.guestName ?? null

    if (recipientEmail) {
      // Send appropriate notification email (non-blocking)
      if (status === "SHIPPED") {
        sendShippingNotificationEmail(
          recipientEmail,
          order.orderNumber,
          null,
          recipientName
        ).catch((err) =>
          console.error("Failed to send shipping notification:", err)
        )
      } else if (status === "DELIVERED") {
        sendDeliveryConfirmationEmail(
          recipientEmail,
          order.orderNumber,
          recipientName
        ).catch((err) =>
          console.error("Failed to send delivery confirmation:", err)
        )
      }
    }

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")

    // Revalidate product pages and admin products when stock changes (cancellation)
    if (status === "CANCELLED") {
      revalidatePath("/shop", "layout")
      revalidatePath("/admin/products")
    }

    return { success: true }
  } catch (err) {
    console.error("Failed to update order status:", err)
    return { success: false, error: "Failed to update order status" }
  }
}

// ── Refund schema ──────────────────────────────────────────────────────────

const refundSchema = z.object({
  refundAmount: z
    .number({ error: "Refund amount must be a number" })
    .positive("Refund amount must be greater than 0"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
})

export type RefundFormState = {
  errors?: Partial<Record<"refundAmount" | "notes" | "_form", string[]>>
  success?: boolean
}

/**
 * Admin server action: process a refund for an order.
 * Updates status to REFUNDED, payment status to REFUNDED, restores stock.
 * Requirements: 9.4
 */
export async function processRefundAction(
  orderId: string,
  _prev: RefundFormState,
  formData: FormData
): Promise<RefundFormState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { errors: { _form: ["Unauthorized"] } }
  }

  const parsed = refundSchema.safeParse({
    refundAmount: Number(formData.get("refundAmount")),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  })

  if (!parsed.success) {
    const fieldErrors: RefundFormState["errors"] = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      ;(fieldErrors as Record<string, string[]>)[key] = msgs as string[]
    }
    return { errors: fieldErrors }
  }

  try {
    await processRefund(orderId, parsed.data.refundAmount, parsed.data.notes)

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    revalidatePath("/shop", "layout")
    revalidatePath("/admin/products")

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to process refund"
    return { errors: { _form: [msg] } }
  }
}
