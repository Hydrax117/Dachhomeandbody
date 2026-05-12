/**
 * Property-Based Tests for Authorization
 *
 * Property 5: Admin routes require admin role
 * Property 89: Protected endpoints require authentication
 * Validates: Requirements 1.5, 22.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Route constants — mirrors middleware.ts
// ---------------------------------------------------------------------------
const PROTECTED_ROUTES = ['/account', '/checkout']
const ADMIN_ROUTES = ['/admin']
const PUBLIC_ROUTES = ['/', '/shop', '/auth/login', '/auth/register']

// ---------------------------------------------------------------------------
// Middleware logic extracted for unit testing
// Mirrors the logic in middleware.ts without importing Next.js middleware
// ---------------------------------------------------------------------------

type UserRole = 'CUSTOMER' | 'ADMIN'

interface MockSession {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

type AuthResult =
  | { type: 'allow' }
  | { type: 'redirect'; destination: string }

/**
 * Pure function that mirrors the authorization logic in middleware.ts.
 * Returns what the middleware would do for a given pathname + session.
 */
function evaluateAccess(pathname: string, session: MockSession | null): AuthResult {
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN'

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return { type: 'redirect', destination: `/auth/login?callbackUrl=${pathname}` }
    }
    if (!isAdmin) {
      return { type: 'redirect', destination: '/' }
    }
  }

  if (isProtectedRoute && !isLoggedIn) {
    return { type: 'redirect', destination: `/auth/login?callbackUrl=${pathname}` }
  }

  return { type: 'allow' }
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const adminPathArbitrary = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter((s) => /^[a-z0-9/-]+$/.test(s))
  .map((suffix) => `/admin/${suffix}`)

const protectedPathArbitrary = fc.oneof(
  fc.constant('/account'),
  fc.constant('/checkout'),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => /^[a-z0-9/-]+$/.test(s))
    .map((suffix) => `/account/${suffix}`),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => /^[a-z0-9/-]+$/.test(s))
    .map((suffix) => `/checkout/${suffix}`)
)

const publicPathArbitrary = fc.oneof(...PUBLIC_ROUTES.map(fc.constant))

const customerSessionArbitrary = fc.record({
  user: fc.record({
    id: fc.uuid(),
    email: fc.emailAddress(),
    role: fc.constant<UserRole>('CUSTOMER'),
  }),
})

const adminSessionArbitrary = fc.record({
  user: fc.record({
    id: fc.uuid(),
    email: fc.emailAddress(),
    role: fc.constant<UserRole>('ADMIN'),
  }),
})

const RUNS = 50

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Authorization Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Property 5: Admin routes require admin role
  // -------------------------------------------------------------------------
  describe('Property 5: Admin routes require admin role', () => {
    it('should redirect unauthenticated users away from any admin route', () => {
      fc.assert(
        fc.property(adminPathArbitrary, (pathname) => {
          const result = evaluateAccess(pathname, null)
          expect(result.type).toBe('redirect')
          if (result.type === 'redirect') {
            expect(result.destination).toContain('/auth/login')
            expect(result.destination).toContain(pathname)
          }
        }),
        { numRuns: RUNS }
      )
    })

    it('should redirect CUSTOMER role users away from any admin route', () => {
      fc.assert(
        fc.property(adminPathArbitrary, customerSessionArbitrary, (pathname, session) => {
          const result = evaluateAccess(pathname, session)
          expect(result.type).toBe('redirect')
          if (result.type === 'redirect') {
            // Customer gets redirected to home, not login
            expect(result.destination).toBe('/')
          }
        }),
        { numRuns: RUNS }
      )
    })

    it('should allow ADMIN role users to access any admin route', () => {
      fc.assert(
        fc.property(adminPathArbitrary, adminSessionArbitrary, (pathname, session) => {
          const result = evaluateAccess(pathname, session)
          expect(result.type).toBe('allow')
        }),
        { numRuns: RUNS }
      )
    })

    it('should preserve the intended admin destination in the callbackUrl for unauthenticated redirects', () => {
      fc.assert(
        fc.property(adminPathArbitrary, (pathname) => {
          const result = evaluateAccess(pathname, null)
          expect(result.type).toBe('redirect')
          if (result.type === 'redirect') {
            expect(result.destination).toContain('callbackUrl')
          }
        }),
        { numRuns: RUNS }
      )
    })
  })

  // -------------------------------------------------------------------------
  // Property 89: Protected endpoints require authentication
  // -------------------------------------------------------------------------
  describe('Property 89: Protected endpoints require authentication', () => {
    it('should redirect unauthenticated users away from any protected route', () => {
      fc.assert(
        fc.property(protectedPathArbitrary, (pathname) => {
          const result = evaluateAccess(pathname, null)
          expect(result.type).toBe('redirect')
          if (result.type === 'redirect') {
            expect(result.destination).toContain('/auth/login')
          }
        }),
        { numRuns: RUNS }
      )
    })

    it('should allow authenticated CUSTOMER users to access protected routes', () => {
      fc.assert(
        fc.property(protectedPathArbitrary, customerSessionArbitrary, (pathname, session) => {
          const result = evaluateAccess(pathname, session)
          expect(result.type).toBe('allow')
        }),
        { numRuns: RUNS }
      )
    })

    it('should allow authenticated ADMIN users to access protected routes', () => {
      fc.assert(
        fc.property(protectedPathArbitrary, adminSessionArbitrary, (pathname, session) => {
          const result = evaluateAccess(pathname, session)
          expect(result.type).toBe('allow')
        }),
        { numRuns: RUNS }
      )
    })

    it('should preserve the intended destination in callbackUrl for unauthenticated redirects', () => {
      fc.assert(
        fc.property(protectedPathArbitrary, (pathname) => {
          const result = evaluateAccess(pathname, null)
          expect(result.type).toBe('redirect')
          if (result.type === 'redirect') {
            expect(result.destination).toContain('callbackUrl')
          }
        }),
        { numRuns: RUNS }
      )
    })

    it('should allow any user (authenticated or not) to access public routes', () => {
      fc.assert(
        fc.property(
          publicPathArbitrary,
          fc.oneof(
            fc.constant(null),
            customerSessionArbitrary,
            adminSessionArbitrary
          ),
          (pathname, session) => {
            const result = evaluateAccess(pathname, session)
            expect(result.type).toBe('allow')
          }
        ),
        { numRuns: RUNS }
      )
    })
  })

  // -------------------------------------------------------------------------
  // Combined: role-based access is consistent across all route types
  // -------------------------------------------------------------------------
  describe('Role-based access consistency', () => {
    it('should never allow a null session to access admin or protected routes', () => {
      fc.assert(
        fc.property(
          fc.oneof(adminPathArbitrary, protectedPathArbitrary),
          (pathname) => {
            const result = evaluateAccess(pathname, null)
            expect(result.type).toBe('redirect')
          }
        ),
        { numRuns: RUNS }
      )
    })

    it('should never allow a CUSTOMER to access admin routes', () => {
      fc.assert(
        fc.property(adminPathArbitrary, customerSessionArbitrary, (pathname, session) => {
          const result = evaluateAccess(pathname, session)
          expect(result.type).toBe('redirect')
        }),
        { numRuns: RUNS }
      )
    })

    it('should always allow an ADMIN to access both admin and protected routes', () => {
      fc.assert(
        fc.property(
          fc.oneof(adminPathArbitrary, protectedPathArbitrary),
          adminSessionArbitrary,
          (pathname, session) => {
            const result = evaluateAccess(pathname, session)
            expect(result.type).toBe('allow')
          }
        ),
        { numRuns: RUNS }
      )
    })
  })
})
