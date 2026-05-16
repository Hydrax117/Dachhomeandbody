"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/app/components/cart/CartContext"
import { ShippingAddressForm, type ShippingAddress } from "./ShippingAddressForm"
import { PaymentMethodSelector } from "./PaymentMethodSelector"
import { CheckoutOrderSummary } from "./CheckoutOrderSummary"

// ── Types ──────────────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string | null
  postalCode: string
  country: string
  isDefault: boolean
}

interface CheckoutClientProps {
  isAuthenticated: boolean
  userEmail: string | null
  userName: string | null
  savedAddresses: SavedAddress[]
  paymentError?: string | null
}

type Step = "shipping" | "payment"

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: "shipping", label: "Shipping", num: 1 },
    { key: "payment", label: "Payment", num: 2 },
  ]

  return (
    <nav aria-label="Checkout steps" className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isActive = step.key === current
        const isDone =
          (current === "payment" && step.key === "shipping")

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <span
                aria-current={isActive ? "step" : undefined}
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold tracking-wide transition-colors duration-300",
                  isActive
                    ? "bg-[#111111] text-[#F8F5F2]"
                    : isDone
                    ? "bg-[#C8A96B] text-[#111111]"
                    : "bg-[#E8DED3] text-[#8b7355]",
                ].join(" ")}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.num
                )}
              </span>
              <span
                className={[
                  "text-[10px] tracking-[0.18em] uppercase font-medium transition-colors duration-300",
                  isActive ? "text-[#111111]" : isDone ? "text-[#C8A96B]" : "text-[#b8b0a8]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-px bg-[#E8DED3] mx-4" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function CheckoutClient({
  isAuthenticated,
  userEmail,
  userName,
  savedAddresses,
  paymentError,
}: CheckoutClientProps) {
  const { cart } = useCart()
  const [step, setStep] = useState<Step>("shipping")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [guestEmail, setGuestEmail] = useState(userEmail ?? "")

  // Empty cart guard
  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF6F1] px-6 pt-20">
        <div className="text-center max-w-sm">
          <p className="font-serif text-2xl font-light text-[#111111] mb-3">Your cart is empty</p>
          <p className="text-sm text-[#8b7355] mb-8">Add some products before checking out.</p>
          <Link href="/shop" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  function handleShippingSubmit(address: ShippingAddress, email: string) {
    setShippingAddress(address)
    setGuestEmail(email)
    setStep("payment")
  }

  function handleBackToShipping() {
    setStep("shipping")
  }

  return (
    <main className="min-h-screen bg-[#FAF6F1] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="py-8 border-b border-[#E8DED3] mb-10">
          <Link
            href="/"
            className="font-serif text-base lg:text-lg tracking-[0.22em] uppercase text-[#111111]"
            aria-label="Dachhomeandbody — Home"
          >
            Dachhomeandbody
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">

          {/* Left — form area */}
          <div className="order-2 lg:order-1">
            <StepIndicator current={step} />

            {/* Payment failure banner (from redirect after failed payment) */}
            {paymentError && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded-sm"
              >
                {paymentError}
              </div>
            )}

            {step === "shipping" && (
              <ShippingAddressForm
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                userName={userName}
                savedAddresses={savedAddresses}
                initialEmail={guestEmail}
                onSubmit={handleShippingSubmit}
              />
            )}

            {step === "payment" && shippingAddress && (
              <PaymentMethodSelector
                shippingAddress={shippingAddress}
                guestEmail={guestEmail}
                isAuthenticated={isAuthenticated}
                onBack={handleBackToShipping}
              />
            )}
          </div>

          {/* Right — order summary */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <CheckoutOrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
