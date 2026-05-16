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

// Routes that require authentication (customer)
const protectedRoutes = ["/account", "/checkout"]

// Routes that require admin role
const adminRoutes = ["/admin"]

// Routes that are for customers only (admins should not access)
const customerOnlyRoutes = ["/shop", "/account", "/checkout", "/cart", "/collections"]

// Auth routes (redirect to home if already logged in)
const authRoutes = ["/auth/login", "/auth/register"]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "ADMIN"

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isCustomerOnlyRoute = customerOnlyRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Admin routes: require ADMIN role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Customer-only routes: admins are redirected to their dashboard
  if (isCustomerOnlyRoute && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  // Protected customer routes: require authentication
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes: redirect logged-in users away from login/register
  if (isAuthRoute && isLoggedIn) {
    const destination = isAdmin ? "/admin" : "/"
    return NextResponse.redirect(new URL(destination, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
