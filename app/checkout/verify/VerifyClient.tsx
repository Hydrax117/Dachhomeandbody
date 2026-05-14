"use client"

/**
 * Clears the client-side cart and redirects to the confirmation page.
 * The order is already created server-side before this component renders.
 */

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/components/cart/CartContext"

interface VerifyClientProps {
  orderNumber: string
}

export function VerifyClient({ orderNumber }: VerifyClientProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const clearedRef = useRef(false)
  const [dots, setDots] = useState(".")

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Clear cart once, then redirect
  useEffect(() => {
    if (clearedRef.current) return
    clearedRef.current = true
    clearCart()
    router.replace(`/checkout/confirmation/${orderNumber}`)
  }, [clearCart, orderNumber, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF6F1] px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[#C8A96B]/10 flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C8A96B"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-serif text-2xl font-light text-[#111111] mb-2">
          Payment confirmed
        </p>
        <p className="text-sm text-[#8b7355]">Preparing your order{dots}</p>
      </div>
    </main>
  )
}
