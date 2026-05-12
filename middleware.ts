import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Routes that require authentication (customer)
const protectedRoutes = ["/account", "/checkout"]

// Routes that require admin role
const adminRoutes = ["/admin"]

// Auth routes (redirect to home if already logged in)
const authRoutes = ["/auth/login", "/auth/register"]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "ADMIN"

  // Check if the path is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the path is a protected customer route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Admin routes: require ADMIN role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      // Preserve the intended destination for post-login redirect (Req 1.6)
      const loginUrl = new URL("/auth/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (!isAdmin) {
      // Authenticated but not admin — redirect to home
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Protected customer routes: require authentication
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes: redirect logged-in users away from login/register
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - API auth routes (handled by NextAuth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
