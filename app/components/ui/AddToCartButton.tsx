"use client"

import { useState } from "react"
import { useCart } from "@/app/components/cart/CartContext"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    stock: number
  }
  className?: string
  label?: string
}

export function AddToCartButton({ product, className = "", label = "Add to Cart" }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`Add ${product.name} to cart`}
      className={[
        "w-full py-3 text-[10px] tracking-[0.25em] uppercase font-medium transition-all duration-300",
        added
          ? "bg-[#B8965C] text-[#111111]"
          : "bg-[#111111] text-white hover:bg-[#B8965C] hover:text-[#111111]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {added ? "Added ✓" : label}
    </button>
  )
}
