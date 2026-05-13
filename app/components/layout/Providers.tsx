"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/app/components/cart/CartContext"
import { CartDrawer } from "@/app/components/cart/CartDrawer"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </SessionProvider>
  )
}
