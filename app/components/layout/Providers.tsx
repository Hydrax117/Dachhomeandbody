"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/app/components/cart/CartContext"
import { CartDrawer } from "@/app/components/cart/CartDrawer"
import { ToastProvider } from "@/app/components/ui/Toast"
import GiftBoxFAB from "@/app/components/GiftBoxFAB"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <GiftBoxFAB />
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
