"use client"

import { useState } from "react"
import { useCart, type CartProduct } from "@/app/components/cart/CartContext"

interface AddToCartButtonProps {
  product: CartProduct
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const isOutOfStock = product.stock === 0 || disabled

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const decrement = () => setQuantity((q) => Math.max(1, q - 1))
  const increment = () => setQuantity((q) => Math.min(product.stock, q + 1))

  if (isOutOfStock) {
    return (
      <button
        disabled
        aria-disabled="true"
        className="w-full py-4 bg-[#EBEBEB] text-[#8C8C8C] text-[10px] tracking-[0.3em] uppercase font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-0 border border-[#EBEBEB] w-fit">
        <button
          onClick={decrement}
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          className="w-11 h-11 flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2EDE8] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8965C]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span
          className="w-12 text-center text-sm font-medium font-serif"
          aria-live="polite"
          aria-label={`Quantity: ${quantity}`}
        >
          {quantity}
        </span>
        <button
          onClick={increment}
          aria-label="Increase quantity"
          disabled={quantity >= product.stock}
          className="w-11 h-11 flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2EDE8] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8965C]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        aria-label={added ? "Added to cart" : `Add ${quantity} to cart`}
        className={`w-full py-4 text-[10px] tracking-[0.3em] uppercase font-medium transition-all duration-500 flex items-center justify-center gap-3 ${
          added
            ? "bg-[#B8965C] text-[#111111]"
            : "bg-[#111111] text-white hover:bg-[#B8965C] hover:text-[#111111]"
        }`}
      >
        {added ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added to Cart
          </>
        ) : (
          "Add to Cart"
        )}
      </button>

      {/* Low stock warning */}
      {product.stock > 0 && product.stock <= 5 && (
        <p className="text-[11px] text-[#B8965C] tracking-wide flex items-center gap-2" role="status">
          <span className="w-1 h-1 rounded-full bg-[#B8965C]" aria-hidden="true" />
          Only {product.stock} left in stock
        </p>
      )}
    </div>
  )
}
