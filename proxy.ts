/**
 * Proxy (formerly middleware) — must stay under 1 MB.
 *
 * We use the lightweight edge-compatible NextAuth initialisation that only
 * imports `authConfig` (no Prisma, no bcrypt, no heavy Node.js modules).
 * The full auth config (with adapter, providers, etc.) lives in lib/auth.ts
 * and is only used in the Node.js runtime (server actions, API routes).
 *
 * Also generates a per-request CSP nonce and sets a strict Content-Security-Policy
 * header on every HTML response to defend against XSS attacks.
 */
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const isDev = process.env.NODE_ENV === "development"

// ---------------------------------------------------------------------------
// CSP helper
// ---------------------------------------------------------------------------

function buildCsp(nonce: string): string {

  const policy = [
    // Only allow resources from the same origin by default
    "default-src 'self'",

    // Scripts: nonce for Next.js inline runtime chunks.
    // 'strict-dynamic' lets nonce-trusted scripts load further scripts
    // (required for Next.js chunk loading). 'self' is redundant with
    // strict-dynamic but kept for older browser fallback.
    // 'unsafe-eval' is required by Framer Motion's animation engine in
    // both dev and production — it uses eval() internally.
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,

    // Styles — split into two granular directives (CSP Level 3):
    //
    // style-src-elem  governs <style> tags and <link rel="stylesheet">.
    //   Next.js automatically attaches the nonce to every <style> it emits,
    //   so nonce-only is correct here.
    //
    // style-src-attr  governs style="…" *attributes* on HTML elements.
    //   Nonces cannot be placed on attributes (only on elements), so the only
    //   practical option for allowing framework/library inline styles (Framer
    //   Motion sets opacity:1;transform:none, etc.) is 'unsafe-inline'.
    //   This is acceptable: style attributes cannot execute scripts, so the
    //   XSS risk of unsafe-inline here is limited to CSS-based attacks (e.g.
    //   data exfiltration via attribute selectors), not arbitrary JS execution.
    //   A strict script-src with nonces/strict-dynamic already covers the
    //   primary injection vector.
    //
    // style-src is intentionally omitted so the two granular directives take
    // full effect without a fallback overriding them.
    `style-src-elem 'self' 'nonce-${nonce}'`,
    `style-src-attr 'unsafe-inline'`,

    // Images: same origin, data URIs (used by some UI libs), blob: (canvas exports),
    // plus the two external image hosts used by next/image.
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.papersmiths.co.uk",

    // Fonts: self only — next/font/google self-hosts all fonts at build time.
    "font-src 'self'",

    // Fetch/XHR: same origin only. Paystack API calls happen server-side (Node.js),
    // never from the browser, so no external connect-src needed.
    "connect-src 'self'",

    // No plugins (Flash, etc.)
    "object-src 'none'",

    // No iframes from other origins
    "frame-src 'none'",

    // Prevent this site being embedded in foreign frames (clickjacking)
    "frame-ancestors 'none'",

    // Forms can only submit to same origin, plus Paystack's hosted checkout
    // (the browser redirects to checkout.paystack.com after server init)
    "form-action 'self' https://checkout.paystack.com",

    // Prevent <base> tag hijacking
    "base-uri 'self'",

    // Auto-upgrade any accidental http:// resource loads to https://
    "upgrade-insecure-requests",

    // NOTE: Trusted Types (require-trusted-types-for / trusted-types) is
    // intentionally omitted. Turbopack's chunk loader assigns script.src as a
    // plain string without going through any Trusted Types policy — enabling
    // the directive crashes the app in both dev and prod.
    // XSS protection is provided by the nonce-based script-src + strict-dynamic
    // above, which already prevents any injected script from executing.
  ]

  return policy.join("; ")
}

// ---------------------------------------------------------------------------
// Routes that require authentication (customer account area)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Proxy
// ---------------------------------------------------------------------------

export default auth((req: any) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "ADMIN"
  const isStaff = session?.user?.role === "STAFF"
  const isAdminOrStaff = isAdmin || isStaff

  // Generate a fresh nonce for every request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = buildCsp(nonce)

  // Helper: build a response that always carries the CSP + nonce headers
  function withCsp(response: NextResponse): NextResponse {
    response.headers.set("Content-Security-Policy", csp)
    // Pass nonce to Server Components via a readable request header
    response.headers.set("x-nonce", nonce)

    // ── Transport security ───────────────────────────────────────────────
    // 2-year max-age, covers all subdomains, eligible for browser preload lists.
    // Only sent in production — dev runs over http so HSTS would break it.
    if (!isDev) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      )
    }

    // ── Origin isolation (COOP + COEP + CORP) ───────────────────────────
    // COOP: isolates this window from cross-origin windows opened via
    // window.open() or target="_blank". Prevents cross-origin JS from
    // accessing window references (Spectre, XS-Leaks).
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")

    // COEP: requires every sub-resource to explicitly opt in to being
    // loaded cross-origin. Required to enable SharedArrayBuffer / high-res
    // timers. "credentialless" is less strict than "require-corp" and works
    // with third-party images (Cloudinary) that don't send CORP headers.
    response.headers.set("Cross-Origin-Embedder-Policy", "credentialless")

    // CORP: prevents other origins from reading this document's resources
    // in no-cors requests (Spectre side-channel mitigation).
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin")

    // ── Clickjacking (belt-and-suspenders with frame-ancestors in CSP) ───
    // X-Frame-Options covers older browsers that don't support CSP.
    response.headers.set("X-Frame-Options", "DENY")

    // ── MIME sniffing ────────────────────────────────────────────────────
    response.headers.set("X-Content-Type-Options", "nosniff")

    // ── Referrer ─────────────────────────────────────────────────────────
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // ── Feature/Permissions policy ───────────────────────────────────────
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()"
    )

    return response
  }

  // ── Always-public paths — never intercept ─────────────────────────────
  if (
    pathname.startsWith("/pay/") ||
    publicCheckoutPaths.some((p) => pathname.startsWith(p))
  ) {
    return withCsp(NextResponse.next())
  }

  // ── Admin routes ───────────────────────────────────────────────────────
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return withCsp(NextResponse.redirect(loginUrl))
    }
    if (!isAdminOrStaff) {
      return withCsp(NextResponse.redirect(new URL("/", nextUrl)))
    }
    return withCsp(NextResponse.next())
  }

  // ── Customer-only routes — redirect admins/staff to their dashboard ────
  if (customerOnlyRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn && isAdminOrStaff) {
    return withCsp(NextResponse.redirect(new URL("/admin", nextUrl)))
  }

  // ── Protected checkout (requires login) ───────────────────────────────
  if (protectedCheckoutPrefixes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withCsp(NextResponse.redirect(loginUrl))
  }

  // ── Protected account area ─────────────────────────────────────────────
  if (protectedPrefixes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withCsp(NextResponse.redirect(loginUrl))
  }

  // ── Auth pages — redirect logged-in users to their destination ─────────
  if (authRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl")
    const destination = isAdminOrStaff
      ? "/admin"
      : callbackUrl && callbackUrl.startsWith("/")
      ? callbackUrl
      : "/account"
    return withCsp(NextResponse.redirect(new URL(destination, nextUrl)))
  }

  return withCsp(NextResponse.next())
})

export const config = {
  matcher: [
    {
      // Match all page routes; skip static assets and image optimisation —
      // they don't need a nonce and skipping them keeps the proxy lean.
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        // Don't re-run on RSC prefetch requests — they inherit the parent nonce
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}

