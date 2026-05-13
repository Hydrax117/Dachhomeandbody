"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"

/**
 * Renders the public Navbar only on non-admin routes.
 * Admin routes use their own layout with a sidebar.
 */
export default function ConditionalNavbar() {
  const pathname = usePathname()
  // Admin routes use their own sidebar layout
  if (pathname.startsWith("/admin")) return null
  // Checkout has its own minimal header
  if (pathname.startsWith("/checkout")) return null
  // Only the homepage has a full-bleed dark hero — all other pages have a light background
  const transparentHero = pathname === "/"
  return <Navbar transparentHero={transparentHero} />
}
