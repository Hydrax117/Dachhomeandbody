"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { removeFromWishlist } from "@/app/actions/wishlist"
import { useCart } from "@/app/components/cart/CartContext"
import type { WishlistEntry } from "@/app/actions/wishlist"

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

// ── Single wishlist item card ──────────────────────────────────────────────

function WishlistCard({
  entry,
  onRemoved,
}: {
  entry: WishlistEntry
  onRemoved: (productId: string) => void
}) {
  const { addItem, openCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [addedToCart, setAddedToCart] = useState(false)

  const { product } = entry
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromWishlist(product.id)
      onRemoved(product.id)
    })
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        stock: product.stock,
      },
      1
    )
    openCart()
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <article className="bg-white border border-[#e5e5e5] rounded overflow-hidden group">
      {/* Product image */}
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[3/4] bg-[#f5f0e8]" aria-label={`View ${product.name}`}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-24 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/30" aria-hidden="true" />
          </div>
        )}

        {/* Stock badge */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-1 bg-[#111111] text-white rounded">
              Out of Stock
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            handleRemove()
          }}
          disabled={isPending}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 border border-[#e5e5e5] flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
        >
          {isPending ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" className="animate-spin" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-1">
            {product.category.name}
          </p>
          <Link href={`/shop/${product.slug}`} className="hover:text-[#8C8C8C] transition-colors">
            <h3 className="font-serif text-sm font-medium leading-snug">{product.name}</h3>
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`font-serif text-sm ${isOutOfStock ? "text-[#8C8C8C]" : "text-[#111111]"}`}>
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#C4C4C4] line-through">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Low stock notice */}
        {isLowStock && (
          <p className="text-[11px] text-[#B8965C]" role="status">
            Only {product.stock} left
          </p>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={
            isOutOfStock
              ? `${product.name} is out of stock`
              : addedToCart
              ? "Added to cart"
              : `Add ${product.name} to cart`
          }
          className={`w-full text-xs tracking-[0.12em] uppercase py-2.5 border transition-colors duration-200 ${
            isOutOfStock
              ? "border-[#e5e5e5] text-[#C4C4C4] cursor-not-allowed"
              : addedToCart
              ? "border-[#B8965C] bg-[#B8965C] text-[#111111]"
              : "border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : addedToCart ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </article>
  )
}

// ── Main client component ──────────────────────────────────────────────────

export default function WishlistClient({
  initialItems,
}: {
  initialItems: WishlistEntry[]
}) {
  const [items, setItems] = useState(initialItems)

  const handleRemoved = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#111111] mb-1">Your wishlist is empty</p>
        <p className="text-xs text-[#8C8C8C] mb-6">
          Save products you love and come back to them later.
        </p>
        <Link
          href="/shop"
          className="inline-block text-xs tracking-[0.12em] uppercase px-6 py-3 bg-[#111111] text-white hover:bg-[#2a2a2a] transition-colors"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      aria-label="Wishlist items"
    >
      {items.map((entry) => (
        <WishlistCard key={entry.id} entry={entry} onRemoved={handleRemoved} />
      ))}
    </div>
  )
}
