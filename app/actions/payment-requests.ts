"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  createPaymentRequest,
  cancelPaymentRequest,
  type CreatePaymentRequestInput,
  type PaymentRequestItem,
  type PaymentRequestAddress,
} from "@/lib/payment-requests"
import { sendPaymentRequestLinkEmail } from "@/lib/email"

// ── Create a payment request ───────────────────────────────────────────────

export interface CreatePaymentRequestState {
  errors?: { _form?: string[] }
  success?: boolean
  token?: string
  payUrl?: string
}

/**
 * Called from the checkout payment step when the user chooses "Request Payment".
 * Persists the request and emails the requester their shareable link.
 */
export async function createPaymentRequestAction(
  input: CreatePaymentRequestInput
): Promise<CreatePaymentRequestState> {
  const session = await auth()

  // Basic validation
  if (!input.requesterEmail) {
    return { errors: { _form: ["Email is required to create a payment request."] } }
  }
  if (!input.items?.length) {
    return { errors: { _form: ["Your cart is empty."] } }
  }
  if (!input.shippingAddress) {
    return { errors: { _form: ["Shipping address is required."] } }
  }
  if (input.total <= 0) {
    return { errors: { _form: ["Order total must be greater than zero."] } }
  }

  try {
    const record = await createPaymentRequest({
      ...input,
      userId: session?.user?.id ?? null,
    })

    const payUrl = `${process.env.NEXTAUTH_URL ?? ""}/pay/${record.token}`

    // Send link email (non-blocking)
    sendPaymentRequestLinkEmail(
      input.requesterEmail,
      record.token,
      input.total,
      input.items.length,
      input.requesterName
    ).catch((err) => console.error("Failed to send payment request link email:", err))

    // Revalidate account page
    if (session?.user?.id) {
      revalidatePath("/account/payment-requests")
    }

    return { success: true, token: record.token, payUrl }
  } catch (err) {
    console.error("Failed to create payment request:", err)
    return {
      errors: {
        _form: [
          err instanceof Error
            ? err.message
            : "Failed to create payment request. Please try again.",
        ],
      },
    }
  }
}

// ── Cancel a payment request ───────────────────────────────────────────────

export async function cancelPaymentRequestAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to cancel a payment request." }
  }

  try {
    await cancelPaymentRequest(id, session.user.id)
    revalidatePath("/account/payment-requests")
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel payment request.",
    }
  }
}
