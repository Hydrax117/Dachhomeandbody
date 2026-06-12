"use client"

import { useState } from "react"
import { AddToCartButton } from "./AddToCartButton"

// ── Types ──────────────────────────────────────────────────────────────────

interface Variant {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  sortOrder: number
}

interface ProductInfo {
  id: string
  name: string
  slug: string
  images: string[]
  basePrice: number
  baseCompareAtPrice: number | null
  baseStock: number
}

interface VariantSelectorProps {
  product: ProductInfo
  variants: Variant[]
}

// ── Component ──────────────────────────────────────────────────────────────

export function VariantSelector({ product, variants }: VariantSelectorProps) {
  // Default to the first in-stock variant, or just the first
  const defaultVariant = variants.find((v) => v.stock > 0) ?? variants[0]
  const [selected, setSelected] = useState<Variant>(defaultVariant)

  const hasDiscount =
    selected.compareAtPrice != null && selected.compareAtPrice > selected.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((selected.compareAtPrice! - selected.price) / selected.compareAtPrice!) * 100
      )
    : 0

  return (
    <div className="space-y-0">
      {/* Price */}
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className={`font-serif text-2xl lg:text-3xl font-light transition-all duration-200 ${
            selected.stock === 0 ? "text-[#8C8C8C]" : "text-[#111111]"
          }`}
          aria-live="polite"
          aria-label={`Price: ₦${selected.price.toLocaleString()}`}
        >
          ₦{selected.price.toLocaleString()}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-[#C4C4C4] line-through">
              ₦{selected.compareAtPrice!.toLocaleString()}
            </span>
            <span className="badge badge-gold text-[9px]">−{discountPercent}%</span>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="mb-6">
        {selected.stock === 0 ? (
          <p className="text-sm text-[#8C8C8C] flex items-center gap-2" role="status" aria-live="polite">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C] inline-block" aria-hidden="true" />
            Out of Stock
          </p>
        ) : selected.stock <= 5 ? (
          <p className="text-sm text-[#B8965C] flex items-center gap-2" role="status" aria-live="polite">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8965C] inline-block" aria-hidden="true" />
            Only {selected.stock} left
          </p>
        ) : (
          <p className="text-sm text-[#4A4A4A] flex items-center gap-2" role="status" aria-live="polite">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" aria-hidden="true" />
            In Stock
          </p>
        )}
      </div>

      {/* Variant buttons */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8C8C8C] mb-3">Size / Option</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select a variant">
          {variants.map((v) => {
            const isSelected = v.id === selected.id
            const isOutOfStock = v.stock === 0
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                aria-pressed={isSelected}
                aria-label={`${v.name}${isOutOfStock ? " — out of stock" : ""}`}
                disabled={isOutOfStock}
                className={[
                  "px-4 py-2 text-xs tracking-[0.1em] border transition-all duration-150 rounded",
                  isSelected
                    ? "border-[#111111] bg-[#111111] text-white"
                    : isOutOfStock
                    ? "border-[#e5e5e5] text-[#C4C4C4] cursor-not-allowed line-through"
                    : "border-[#e5e5e5] text-[#4A4A4A] hover:border-[#B8965C] hover:text-[#B8965C]",
                ].join(" ")}
              >
                {v.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#EBEBEB] mb-8" aria-hidden="true" />

      {/* Add to cart — passes variant details */}
      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: selected.price,
          images: product.images,
          stock: selected.stock,
          variantId: selected.id,
          variantName: selected.name,
        }}
      />
    </div>
  )
}
