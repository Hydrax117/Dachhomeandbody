"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/components/cart/CartContext"
import { createPaymentRequestAction } from "@/app/actions/payment-requests"
import type { ShippingAddress } from "./ShippingAddressForm"

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentMethodSelectorProps {
  shippingAddress: ShippingAddress
  guestEmail: string
  isAuthenticated: boolean
  shippingCost: number
  onBack: () => void
}

type PaymentMethod = "paystack" | "request"

// ── Lock icon ──────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Address summary ────────────────────────────────────────────────────────

function AddressSummary({ address, onEdit }: { address: ShippingAddress; onEdit: () => void }) {
  return (
    <div className="mb-8 p-4 border border-[#EBEBEB] rounded-sm bg-[#F8F5F2]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-2">Shipping to</p>
          <p className="text-sm font-medium text-[#111111]">{address.name}</p>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            {address.address}, {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postalCode}
          </p>
          <p className="text-xs text-[#8C8C8C]">{address.phone}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[10px] tracking-[0.12em] uppercase text-[#B8965C] hover:text-[#A07840] transition-colors shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// ── Payment Request Success State ──────────────────────────────────────────

function PaymentRequestSuccess({
  payUrl,
  email,
}: {
  payUrl: string
  email: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(payUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-[#f5f0e8] border border-[#B8965C]/30 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-light text-[#111111] mb-1">Payment link created</h2>
        <p className="text-xs text-[#8C8C8C]">
          We&apos;ve also sent the link to <strong className="text-[#111111]">{email}</strong>
        </p>
      </div>

      {/* Link display */}
      <div className="border border-[#EBEBEB] rounded-sm overflow-hidden">
        <div className="bg-[#F8F5F2] px-4 py-2 border-b border-[#EBEBEB]">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C]">Your payment link</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#111111] break-all font-mono leading-relaxed">{payUrl}</p>
        </div>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-sm text-sm font-medium transition-all duration-200 ${
          copied
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-[#B8965C] text-[#B8965C] hover:bg-[#B8965C]/5"
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied to clipboard" : "Copy link"}
      </button>

      {/* Info */}
      <div className="text-xs text-[#8C8C8C] space-y-1.5 px-1">
        <p className="flex items-start gap-2">
          <span className="text-[#B8965C] mt-0.5">→</span>
          Share this link with whoever will pay for your order.
        </p>
        <p className="flex items-start gap-2">
          <span className="text-[#B8965C] mt-0.5">→</span>
          The link is valid for <strong className="text-[#111111]">48 hours</strong> and can only be used once.
        </p>
        <p className="flex items-start gap-2">
          <span className="text-[#B8965C] mt-0.5">→</span>
          Once paid, you&apos;ll receive a confirmation email and your order will be processed.
        </p>
      </div>

      {/* Manage link */}
      <a
        href="/account/payment-requests"
        className="block text-center text-xs tracking-[0.12em] uppercase text-[#8C8C8C] hover:text-[#B8965C] transition-colors mt-2"
      >
        Manage your payment requests →
      </a>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function PaymentMethodSelector({
  shippingAddress,
  guestEmail,
  isAuthenticated,
  shippingCost,
  onBack,
}: PaymentMethodSelectorProps) {
  const { cart, clearCart } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paystack")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [requestResult, setRequestResult] = useState<{ payUrl: string } | null>(null)

  // Total = subtotal - discount + shipping
  const orderTotal = Math.max(0, cart.subtotal - cart.discount + shippingCost)

  // ── Pay Now ──────────────────────────────────────────────────────────────
  async function handlePay() {
    setError(null)
    startTransition(async () => {
      try {
        const email = guestEmail || "customer@dachhomeandbody.com"
        const metadata = {
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            variantName: item.product.variantName ?? null,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
          guestEmail: isAuthenticated ? null : guestEmail,
          couponCode: cart.couponCode ?? null,
          subtotal: cart.subtotal,
          discount: cart.discount,
          shippingCost,
          total: orderTotal,
        }
        const callbackUrl = `${window.location.origin}/checkout/verify`
        const res = await fetch("/api/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, amount: orderTotal, metadata, callbackUrl }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as { error?: string }).error ?? "Failed to initialize payment")
        }
        const { authorizationUrl } = (await res.json()) as { authorizationUrl: string }
        window.location.href = authorizationUrl
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      }
    })
  }

  // ── Request Payment ──────────────────────────────────────────────────────
  async function handleRequestPayment() {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createPaymentRequestAction({
          requesterEmail: guestEmail,
          requesterName: shippingAddress.name,
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            variantName: item.product.variantName ?? null,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            image: item.product.images?.[0] ?? null,
          })),
          shippingAddress: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state ?? null,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          subtotal: cart.subtotal,
          discount: cart.discount,
          shippingCost,
          total: orderTotal,
          couponCode: cart.couponCode ?? null,
          couponId: null,
        })

        if (result.errors?._form) {
          setError(result.errors._form[0])
          return
        }

        if (result.success && result.payUrl) {
          // Clear cart — items are locked into the payment request
          clearCart()
          setRequestResult({ payUrl: result.payUrl })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      }
    })
  }

  // ── If request was created, show the success/share screen ────────────────
  if (requestResult) {
    return (
      <div aria-label="Payment request created">
        <h2 className="font-serif text-2xl font-light text-[#111111] mb-6">Payment</h2>
        <PaymentRequestSuccess payUrl={requestResult.payUrl} email={guestEmail} />
      </div>
    )
  }

  return (
    <div aria-label="Payment method">
      <h2 className="font-serif text-2xl font-light text-[#111111] mb-6">Payment</h2>

      {/* Shipping address summary */}
      <AddressSummary address={shippingAddress} onEdit={onBack} />

      {/* Payment method selection */}
      <div className="mb-6 space-y-3">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#111111]/50 mb-3">
          How would you like to pay?
        </p>

        {/* Pay with Paystack */}
        <button
          type="button"
          onClick={() => setSelectedMethod("paystack")}
          aria-pressed={selectedMethod === "paystack"}
          className={[
            "w-full text-left px-4 py-4 border rounded-sm transition-all duration-200",
            selectedMethod === "paystack"
              ? "border-[#B8965C] bg-[#B8965C]/5"
              : "border-[#EBEBEB] hover:border-[#B8965C]/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selectedMethod === "paystack" ? "border-[#B8965C]" : "border-[#EBEBEB]",
              ].join(" ")}
              aria-hidden="true"
            >
              {selectedMethod === "paystack" && <div className="w-2 h-2 rounded-full bg-[#B8965C]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-[#111111]">Pay now with Paystack</p>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Cards, bank transfer, USSD & more</p>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#00C3F7]">Paystack</span>
            </div>
          </div>
        </button>

        {/* Request someone else to pay */}
        <button
          type="button"
          onClick={() => setSelectedMethod("request")}
          aria-pressed={selectedMethod === "request"}
          className={[
            "w-full text-left px-4 py-4 border rounded-sm transition-all duration-200",
            selectedMethod === "request"
              ? "border-[#B8965C] bg-[#B8965C]/5"
              : "border-[#EBEBEB] hover:border-[#B8965C]/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selectedMethod === "request" ? "border-[#B8965C]" : "border-[#EBEBEB]",
              ].join(" ")}
              aria-hidden="true"
            >
              {selectedMethod === "request" && <div className="w-2 h-2 rounded-full bg-[#B8965C]" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#111111]">Let someone else pay</p>
              <p className="text-xs text-[#8C8C8C] mt-0.5">
                Get a shareable link — send it to anyone to pay for your order
              </p>
            </div>
            <div className="ml-auto shrink-0 text-[#B8965C]">
              <LinkIcon />
            </div>
          </div>
        </button>

        {/* Request payment info box */}
        {selectedMethod === "request" && (
          <div className="ml-1 px-4 py-3 bg-[#f5f0e8] border border-[#e5ddd0] rounded-sm text-xs text-[#6b5c45] space-y-1 leading-relaxed">
            <p>A secure, one-time link will be generated for your order.</p>
            <p>Share it with whoever will pay — they enter their card details, and your order is placed automatically.</p>
            <p className="font-medium text-[#111111]">The link expires in 48 hours and is locked to this exact order.</p>
          </div>
        )}
      </div>

      {/* Order total recap */}
      <div className="mb-6 p-4 border border-[#EBEBEB] rounded-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8C8C8C]">Subtotal</span>
          <span>₦{cart.subtotal.toLocaleString()}</span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#B8965C]">Discount</span>
            <span className="text-[#B8965C]">−₦{cart.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#8C8C8C]">Shipping</span>
          <span className={shippingCost === 0 ? "text-[#8C8C8C]" : "text-[#111111]"}>
            {shippingCost === 0 ? "Free" : `₦${shippingCost.toLocaleString()}`}
          </span>
        </div>
        <div className="divider" aria-hidden="true" />
        <div className="flex justify-between font-medium">
          <span className="font-serif">Total</span>
          <span className="font-serif">₦{orderTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div role="alert" className="mb-4 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Action button */}
      {selectedMethod === "paystack" ? (
        <button
          type="button"
          onClick={handlePay}
          disabled={isPending}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          aria-busy={isPending}
        >
          {isPending ? (
            "Redirecting to payment…"
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LockIcon />
              Pay ₦{orderTotal.toLocaleString()} Securely
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRequestPayment}
          disabled={isPending}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          aria-busy={isPending}
        >
          {isPending ? (
            "Creating payment link…"
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LinkIcon />
              Generate Payment Link
            </span>
          )}
        </button>
      )}

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        disabled={isPending}
        className="mt-4 w-full text-center text-xs tracking-[0.12em] uppercase text-[#8C8C8C] hover:text-[#B8965C] transition-colors disabled:opacity-40"
      >
        ← Back to Shipping
      </button>

      {/* Trust signals */}
      <p className="mt-6 text-[10px] text-center text-[#C4C4C4] tracking-wide">
        Secured by Paystack · Your payment info is never stored
      </p>
    </div>
  )
}
