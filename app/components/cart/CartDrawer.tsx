"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { useCart } from "./CartContext"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"

export function CartDrawer() {
  const { cart, isOpen, closeCart, itemCount, dismissStockNotice } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      // Focus the close button for accessibility
      closeButtonRef.current?.focus()
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, closeCart])

  // Trap focus within drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleTab)
    return () => document.removeEventListener("keydown", handleTab)
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Shopping cart, ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
        className={`fixed top-0 right-0 h-full w-[min(420px,100vw)] bg-[#F8F5F2] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-[#EBEBEB] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-base tracking-[0.08em]">Your Cart</h2>
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="min-w-[20px] h-5 px-1 rounded-full bg-[#B8965C] text-[#111111] text-[10px] font-semibold flex items-center justify-center"
              >
                {itemCount}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            aria-label="Close cart"
            className="btn-icon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stock notice */}
        {cart.stockNotice && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 px-6 py-3 bg-[#fff8ec] border-b border-[#f0d9a0] text-[11px] text-[#7a5c00] tracking-wide"
          >
            <span>{cart.stockNotice}</span>
            <button
              onClick={dismissStockNotice}
              aria-label="Dismiss notice"
              className="shrink-0 text-[#b8a060] hover:text-[#7a5c00] transition-colors mt-0.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Cart items */}
        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#f0ece4] flex items-center justify-center" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.2" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg mb-1">Your cart is empty</p>
              <p className="text-sm text-[#8C8C8C]">Discover our luxury fragrances</p>
            </div>
            <Link
              href="/shop"
              onClick={closeCart}
              className="btn-primary"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2">
              <ul aria-label="Cart items" className="divide-y divide-transparent">
                {cart.items.map((item) => (
                  <CartItem key={`${item.productId}-${item.variantId ?? "base"}`} item={item} />
                ))}
              </ul>
            </div>

            {/* Summary footer */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-[#EBEBEB] bg-[#F8F5F2] shrink-0">
              <CartSummary onCheckout={closeCart} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
