"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/components/cart/CartContext"
import type { ShippingAddress } from "./ShippingAddressForm"

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentMethodSelectorProps {
  shippingAddress: ShippingAddress
  guestEmail: string
  isAuthenticated: boolean
  onBack: () => void
}

type PaymentMethod = "paystack"

// ── Lock icon ──────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── Address summary ────────────────────────────────────────────────────────

function AddressSummary({
  address,
  onEdit,
}: {
  address: ShippingAddress
  onEdit: () => void
}) {
  return (
    <div className="mb-8 p-4 border border-[#E8DED3] rounded-sm bg-[#FAF8F5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-2">
            Shipping to
          </p>
          <p className="text-sm font-medium text-[#111111]">{address.name}</p>
          <p className="text-xs text-[#8b7355] mt-0.5">
            {address.address}, {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postalCode}
          </p>
          <p className="text-xs text-[#8b7355]">{address.phone}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[10px] tracking-[0.12em] uppercase text-[#C8A96B] hover:text-[#b8965a] transition-colors shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function PaymentMethodSelector({
  shippingAddress,
  guestEmail,
  isAuthenticated,
  onBack,
}: PaymentMethodSelectorProps) {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paystack")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handlePay() {
    setError(null)

    startTransition(async () => {
      try {
        const email = isAuthenticated
          ? (guestEmail || "customer@dachhomeandbody.com")
          : guestEmail

        // Build metadata for the order
        const metadata = {
          cartItems: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
          guestEmail: isAuthenticated ? null : guestEmail,
          couponCode: cart.couponCode ?? null,
          subtotal: cart.subtotal,
          discount: cart.discount,
          total: cart.total,
        }

        const callbackUrl = `${window.location.origin}/checkout/verify`

        const res = await fetch("/api/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            amount: cart.total,
            metadata,
            callbackUrl,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(
            (data as { error?: string }).error ?? "Failed to initialize payment"
          )
        }

        const { authorizationUrl } = (await res.json()) as {
          authorizationUrl: string
        }

        // Redirect to Paystack payment page
        window.location.href = authorizationUrl
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        )
      }
    })
  }

  return (
    <div aria-label="Payment method">
      <h2 className="font-serif text-2xl font-light text-[#111111] mb-6">
        Payment
      </h2>

      {/* Shipping address summary */}
      <AddressSummary address={shippingAddress} onEdit={onBack} />

      {/* Payment method selection */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#111111]/50 mb-3">
          Payment Method
        </p>

        <button
          type="button"
          onClick={() => setSelectedMethod("paystack")}
          aria-pressed={selectedMethod === "paystack"}
          className={[
            "w-full text-left px-4 py-4 border rounded-sm transition-all duration-200",
            selectedMethod === "paystack"
              ? "border-[#C8A96B] bg-[#C8A96B]/5"
              : "border-[#E8DED3] hover:border-[#C8A96B]/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selectedMethod === "paystack"
                  ? "border-[#C8A96B]"
                  : "border-[#E8DED3]",
              ].join(" ")}
              aria-hidden="true"
            >
              {selectedMethod === "paystack" && (
                <div className="w-2 h-2 rounded-full bg-[#C8A96B]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#111111]">
                Pay with Paystack
              </p>
              <p className="text-xs text-[#8b7355] mt-0.5">
                Cards, bank transfer, USSD & more
              </p>
            </div>
            {/* Paystack logo placeholder */}
            <div className="ml-auto">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#00C3F7]">
                Paystack
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Order total recap */}
      <div className="mb-6 p-4 border border-[#E8DED3] rounded-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8b7355]">Subtotal</span>
          <span>₦{cart.subtotal.toLocaleString()}</span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#C8A96B]">Discount</span>
            <span className="text-[#C8A96B]">−₦{cart.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#8b7355]">Shipping</span>
          <span className="text-[#8b7355]">Calculated by carrier</span>
        </div>
        <div className="divider" aria-hidden="true" />
        <div className="flex justify-between font-medium">
          <span className="font-serif">Total</span>
          <span className="font-serif">₦{cart.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div role="alert" className="mb-4 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Pay button */}
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
            Pay ₦{cart.total.toLocaleString()} Securely
          </span>
        )}
      </button>

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        disabled={isPending}
        className="mt-4 w-full text-center text-xs tracking-[0.12em] uppercase text-[#8b7355] hover:text-[#C8A96B] transition-colors disabled:opacity-40"
      >
        ← Back to Shipping
      </button>

      {/* Trust signals */}
      <p className="mt-6 text-[10px] text-center text-[#b8b0a8] tracking-wide">
        Secured by Paystack · Your payment info is never stored
      </p>
    </div>
  )
}
