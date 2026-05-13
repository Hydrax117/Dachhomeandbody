/**
 * Paystack payment gateway integration.
 * Uses the Paystack REST API directly (no SDK dependency).
 * Docs: https://paystack.com/docs/api/
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = "https://api.paystack.co"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PaystackInitializeParams {
  email: string
  /** Amount in kobo (NGN × 100) */
  amount: number
  reference?: string
  callback_url?: string
  metadata?: Record<string, unknown>
}

export interface PaystackInitializeResult {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export interface PaystackVerifyResult {
  status: "success" | "failed" | "abandoned" | "pending"
  reference: string
  amount: number // in kobo
  currency: string
  paidAt?: string
  metadata?: Record<string, unknown>
  customer: {
    email: string
    name?: string
  }
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    reference: string
    status: string
    amount: number
    currency: string
    paid_at?: string
    metadata?: Record<string, unknown>
    customer: {
      email: string
      first_name?: string
      last_name?: string
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function paystackHeaders() {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  }
}

/** Convert NGN amount (naira) to kobo for Paystack */
export function toKobo(naira: number): number {
  return Math.round(naira * 100)
}

/** Convert kobo back to naira */
export function fromKobo(kobo: number): number {
  return kobo / 100
}

/** Generate a unique payment reference */
export function generateReference(prefix = "DHB"): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// ── Initialize Transaction ─────────────────────────────────────────────────

/**
 * Initialize a Paystack transaction.
 * Returns the authorization URL to redirect the customer to.
 */
export async function initializePayment(
  params: PaystackInitializeParams
): Promise<PaystackInitializeResult> {
  const reference = params.reference ?? generateReference()

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Paystack initialization failed: ${(error as { message?: string }).message ?? response.statusText}`
    )
  }

  const result = (await response.json()) as {
    status: boolean
    message: string
    data: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }

  if (!result.status) {
    throw new Error(`Paystack initialization failed: ${result.message}`)
  }

  return {
    authorizationUrl: result.data.authorization_url,
    accessCode: result.data.access_code,
    reference: result.data.reference,
  }
}

// ── Verify Transaction ─────────────────────────────────────────────────────

/**
 * Verify a Paystack transaction by reference.
 * Should be called after the customer returns from the payment page
 * or when processing a webhook event.
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResult> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: paystackHeaders(),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Paystack verification failed: ${(error as { message?: string }).message ?? response.statusText}`
    )
  }

  const result = (await response.json()) as {
    status: boolean
    message: string
    data: {
      status: string
      reference: string
      amount: number
      currency: string
      paid_at?: string
      metadata?: Record<string, unknown>
      customer: {
        email: string
        first_name?: string
        last_name?: string
      }
    }
  }

  if (!result.status) {
    throw new Error(`Paystack verification failed: ${result.message}`)
  }

  const { data } = result
  const customerName =
    [data.customer.first_name, data.customer.last_name]
      .filter(Boolean)
      .join(" ") || undefined

  return {
    status: data.status as PaystackVerifyResult["status"],
    reference: data.reference,
    amount: data.amount,
    currency: data.currency,
    paidAt: data.paid_at,
    metadata: data.metadata,
    customer: {
      email: data.customer.email,
      name: customerName,
    },
  }
}

// ── Webhook Signature Verification ────────────────────────────────────────

/**
 * Verify that a webhook request genuinely came from Paystack.
 * Paystack signs the request body with HMAC-SHA512 using the secret key.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  if (!PAYSTACK_SECRET_KEY || !signature) return false

  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY)
    const messageData = encoder.encode(rawBody)

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    )

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    return computedSignature === signature
  } catch {
    return false
  }
}
