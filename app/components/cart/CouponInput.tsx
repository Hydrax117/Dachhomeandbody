"use client"

import { useState, type FormEvent } from "react"
import { useCart } from "./CartContext"

export function CouponInput() {
  const { cart, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const hasCoupon = !!cart.couponCode

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim() || loading) return
    setLoading(true)
    try {
      await applyCoupon(code.trim().toUpperCase())
      if (!cart.couponError) setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    removeCoupon()
    setCode("")
  }

  if (hasCoupon) {
    return (
      <div className="flex items-center justify-between py-2.5 px-3 bg-[#f0ece4] border border-[#C8A96B]/30">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8A96B" strokeWidth="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs tracking-[0.12em] uppercase font-medium text-[#4a4a4a]">
            {cart.couponCode}
          </span>
          <span className="text-xs text-[#C8A96B]">
            −₦{cart.discount.toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleRemove}
          aria-label="Remove coupon"
          className="text-[#b8b0a8] hover:text-[#c0392b] transition-colors duration-150 text-xs tracking-wide"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-0" role="search" aria-label="Apply coupon code">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          aria-label="Coupon code"
          aria-describedby={cart.couponError ? "coupon-error" : undefined}
          className="input flex-1 text-xs tracking-[0.08em] uppercase placeholder:normal-case placeholder:tracking-normal rounded-none border-r-0 h-10 py-0"
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-secondary h-10 px-4 text-[10px] rounded-none border-l-0 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Apply coupon"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Applying
            </span>
          ) : (
            "Apply"
          )}
        </button>
      </form>

      {cart.couponError && (
        <p id="coupon-error" className="field-error mt-1.5" role="alert">
          {cart.couponError}
        </p>
      )}
    </div>
  )
}
