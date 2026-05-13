"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart, type CartItem as CartItemType } from "./CartContext"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity } = item

  const decrement = () => {
    if (quantity <= 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const increment = () => {
    updateQuantity(product.id, quantity + 1)
  }

  const lineTotal = product.price * quantity

  return (
    <li className="flex gap-4 py-5 border-b border-[#e8ddd0] last:border-0">
      {/* Product image */}
      <Link
        href={`/shop/${product.slug}`}
        className="shrink-0 w-20 h-24 bg-[#f0ece4] overflow-hidden block"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={80}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#e8e0d0] to-[#d4c9b0]" />
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/shop/${product.slug}`}
              className="font-serif text-sm leading-snug hover:text-[#C8A96B] transition-colors duration-200 line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="text-[11px] text-[#8b7355] mt-0.5 tracking-wide">
              ₦{product.price.toLocaleString()} each
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => removeItem(product.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="shrink-0 text-[#b8b0a8] hover:text-[#c0392b] transition-colors duration-150 mt-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Quantity + line total */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div
            className="flex items-center border border-[#e8ddd0]"
            role="group"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              onClick={decrement}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-[#4a4a4a] hover:bg-[#f0ece4] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96B]"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span
              className="w-9 text-center text-xs font-medium"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              onClick={increment}
              aria-label="Increase quantity"
              disabled={quantity >= product.stock}
              className="w-8 h-8 flex items-center justify-center text-[#4a4a4a] hover:bg-[#f0ece4] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96B]"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Line total */}
          <span className="font-serif text-sm font-medium">
            ₦{lineTotal.toLocaleString()}
          </span>
        </div>

        {/* Low stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-[#C8A96B] tracking-wide mt-1.5" role="status">
            Only {product.stock} left
          </p>
        )}
      </div>
    </li>
  )
}
