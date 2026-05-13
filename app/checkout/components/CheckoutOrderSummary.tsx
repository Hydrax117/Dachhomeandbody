"use client"

import Image from "next/image"
import { useCart } from "@/app/components/cart/CartContext"

export function CheckoutOrderSummary() {
  const { cart } = useCart()

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DED3] rounded-sm p-6">
      <h2 className="font-serif text-lg font-light text-[#111111] mb-5">
        Order Summary
      </h2>

      {/* Items */}
      <ul className="space-y-4 mb-5" aria-label="Cart items">
        {cart.items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            {/* Product image */}
            <div className="relative w-16 h-20 shrink-0 bg-[#E8DED3] rounded-sm overflow-hidden">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8b0a8" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              {/* Quantity badge */}
              <span
                aria-label={`Quantity: ${item.quantity}`}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#111111] text-[#F8F5F2] text-[9px] font-semibold flex items-center justify-center"
              >
                {item.quantity}
              </span>
            </div>

            {/* Item details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-[#8b7355] mt-0.5">
                ₦{item.product.price.toLocaleString()} each
              </p>
            </div>

            {/* Line total */}
            <p className="text-sm font-medium text-[#111111] shrink-0">
              ₦{(item.product.price * item.quantity).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <div className="divider mb-4" aria-hidden="true" />

      {/* Totals */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-[#8b7355]">Subtotal</span>
          <span>₦{cart.subtotal.toLocaleString()}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#C8A96B]">
              Discount
              {cart.couponCode ? ` (${cart.couponCode})` : ""}
            </span>
            <span className="text-[#C8A96B]">−₦{cart.discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-[#8b7355]">Shipping</span>
          <span className="text-[#8b7355]">Calculated at next step</span>
        </div>

        <div className="divider" aria-hidden="true" />

        <div className="flex justify-between">
          <span className="font-serif text-base font-medium">Total</span>
          <span className="font-serif text-base font-medium">
            ₦{cart.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-5 pt-4 border-t border-[#E8DED3] flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5 text-[#8b7355]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[10px] tracking-wide">Secure</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#8b7355]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-[10px] tracking-wide">Protected</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#8b7355]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[10px] tracking-wide">Free Returns</span>
        </div>
      </div>
    </div>
  )
}
