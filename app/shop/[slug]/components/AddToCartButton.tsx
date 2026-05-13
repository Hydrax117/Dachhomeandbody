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
        className="btn-primary w-full opacity-40 cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-0 border border-[#e8ddd0] w-fit">
        <button
          onClick={decrement}
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-[#4a4a4a] hover:bg-[#f0ece4] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span
          className="w-12 text-center text-sm font-medium"
          aria-live="polite"
          aria-label={`Quantity: ${quantity}`}
        >
          {quantity}
        </span>
        <button
          onClick={increment}
          aria-label="Increase quantity"
          disabled={quantity >= product.stock}
          className="w-10 h-10 flex items-center justify-center text-[#4a4a4a] hover:bg-[#f0ece4] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B]"
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
        className={`btn-primary w-full transition-all duration-300 ${
          added ? "bg-[#C8A96B] border-[#C8A96B] text-[#111111]" : ""
        }`}
      >
        {added ? (
          <span className="flex items-center gap-2 justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added to Cart
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>

      {/* Low stock warning */}
      {product.stock > 0 && product.stock <= 5 && (
        <p className="text-[11px] text-[#C8A96B] tracking-wide" role="status">
          Only {product.stock} left in stock
        </p>
      )}
    </div>
  )
}
