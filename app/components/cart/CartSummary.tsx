"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "./CartContext"
import { CouponInput } from "./CouponInput"

interface CartSummaryProps {
  /** When true, shows a "Proceed to Checkout" button. When false (e.g. on checkout page), omits it. */
  showCheckoutButton?: boolean
  /** Called before navigating to checkout (e.g. to close the cart drawer) */
  onCheckout?: () => void
}

export function CartSummary({ showCheckoutButton = true, onCheckout }: CartSummaryProps) {
  const router = useRouter()
  const { cart } = useCart()

  const shippingCost: number = 0 // Free shipping placeholder — will be calculated at checkout
  const hasDiscount = cart.discount > 0

  return (
    <div className="space-y-4">
      {/* Coupon input */}
      <CouponInput />

      {/* Totals */}
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between text-sm">
          <span className="text-[#8C8C8C]">Subtotal</span>
          <span className="font-medium">₦{cart.subtotal.toLocaleString()}</span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-[#B8965C]">Discount ({cart.couponCode})</span>
            <span className="text-[#B8965C] font-medium">−₦{cart.discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-[#8C8C8C]">Shipping</span>
          <span className="text-[#8C8C8C]">
            {shippingCost === 0 ? "Calculated at checkout" : `₦${shippingCost.toLocaleString()}`}
          </span>
        </div>

        <div className="divider" aria-hidden="true" />

        <div className="flex justify-between">
          <span className="font-serif text-base font-medium">Total</span>
          <span className="font-serif text-base font-medium">₦{cart.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      {showCheckoutButton && (
        <div className="pt-1 space-y-2">
          <button
            onClick={() => {
              onCheckout?.()
              router.push("/checkout")
            }}
            disabled={cart.items.length === 0}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Proceed to checkout"
          >
            Proceed to Checkout
          </button>

          <Link
            href="/shop"
            className="btn-secondary w-full text-center block text-[10px]"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Trust signals */}
      <p className="text-[10px] text-center text-[#C4C4C4] tracking-wide pt-1">
        Secure checkout · Free returns
      </p>
    </div>
  )
}
