/**
 * Proxy (formerly middleware) — must stay under 1 MB.
 *
 * We use the lightweight edge-compatible NextAuth initialisation that only
 * imports `authConfig` (no Prisma, no bcrypt, no heavy Node.js modules).
 * The full auth config (with adapter, providers, etc.) lives in lib/auth.ts
 * and is only used in the Node.js runtime (server actions, API routes).
 */
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Routes that require authentication (customer account area)
const protectedPrefixes = ["/account"]

// /checkout itself requires login, but /checkout/verify must stay PUBLIC —
// unauthenticated payers (Pay-For-Me) land here after Paystack redirects them back
const protectedCheckoutPrefixes = ["/checkout"]

// Checkout sub-paths that must remain public even though /checkout is protected
const publicCheckoutPaths = ["/checkout/verify", "/checkout/confirmation"]

// Routes that require admin role
const adminRoutes = ["/admin"]

// Routes only customers should access (not admins)
const customerOnlyRoutes = ["/shop", "/account", "/cart", "/collections"]

// Auth pages — redirect logged-in users away
const authRoutes = ["/auth/login", "/auth/register"]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "ADMIN"

  // ── Always-public paths — never intercept ─────────────────────────────
  // /pay/  — Pay-For-Me public pages (payer has no account)
  // /checkout/verify — Paystack callback (payer is unauthenticated)
  // /checkout/confirmation — confirmation page after order
  if (
    pathname.startsWith("/pay/") ||
    publicCheckoutPaths.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // ── Admin routes ───────────────────────────────────────────────────────
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // ── Customer-only routes — redirect admins to their dashboard ──────────
  if (customerOnlyRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  // ── Protected checkout (requires login) ───────────────────────────────
  if (protectedCheckoutPrefixes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Protected account area ─────────────────────────────────────────────
  if (protectedPrefixes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Auth pages — redirect logged-in users to their destination ─────────
  if (authRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl")
    const destination = isAdmin
      ? "/admin"
      : callbackUrl && callbackUrl.startsWith("/")
      ? callbackUrl
      : "/account"
    return NextResponse.redirect(new URL(destination, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
