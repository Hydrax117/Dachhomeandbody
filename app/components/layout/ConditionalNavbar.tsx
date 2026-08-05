import { headers } from "next/headers"
import NavbarWrapper from "./NavbarWrapper"

/**
 * Server component — reads the current pathname from request headers to decide
 * which navbar variant to render, then delegates to NavbarWrapper which fetches
 * categories before rendering the client Navbar.
 */
export default async function ConditionalNavbar() {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? ""

  // Admin routes use their own sidebar layout
  if (pathname.startsWith("/admin")) return null
  // Checkout has its own minimal header
  if (pathname.startsWith("/checkout")) return null

  // Only the homepage has a full-bleed dark hero
  const transparentHero = pathname === "/"
  return <NavbarWrapper transparentHero={transparentHero} />
}
