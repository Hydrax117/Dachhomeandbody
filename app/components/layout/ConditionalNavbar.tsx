"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"

/**
 * Renders the public Navbar only on non-admin routes.
 * Admin routes use their own layout with a sidebar.
 */
export default function ConditionalNavbar() {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null
  return <Navbar />
}
