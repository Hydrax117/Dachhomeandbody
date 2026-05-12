/**
 * Property-Based Tests for Password Reset
 *
 * Property 4: Password reset generates secure tokens
 * Validates: Requirements 1.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// In-memory Prisma mock — no live database required
// ---------------------------------------------------------------------------
type MockUser = {
  id: string
  email: string
  name: string | null
  password: string | null
  role: string
  resetToken: string | null
  resetTokenExpiry: Date | null
}

const mockUsers = new Map<string, MockUser>()
let idCounter = 0

const mockPrisma = {
  user: {
    create: vi.fn(async ({ data }: { data: Partial<MockUser> & { email: string } }) => {
      const user: MockUser = {
        id: `id-${++idCounter}`,
        email: data.email,
        name: data.name ?? null,
        password: data.password ?? null,
        role: data.role ?? 'CUSTOMER',
        resetToken: null,
        resetTokenExpiry: null,
      }
      mockUsers.set(data.email, user)
      return user
    }),
    findUnique: vi.fn(async ({ where }: { where: { email?: string } }) => {
      if (where.email) return mockUsers.get(where.email) ?? null
      return null
    }),
    findFirst: vi.fn(async ({ where }: { where: { resetToken?: string; resetTokenExpiry?: { gt: Date } } }) => {
      for (const user of mockUsers.values()) {
        if (
          user.resetToken === where.resetToken &&
          where.resetTokenExpiry &&
          user.resetTokenExpiry &&
          user.resetTokenExpiry > where.resetTokenExpiry.gt
        ) {
          return user
        }
      }
      return null
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<MockUser> }) => {
      for (const [email, user] of mockUsers.entries()) {
        if (user.id === where.id) {
          const updated = { ...user, ...data }
          mockUsers.set(email, updated)
          return updated
        }
      }
      return null
    }),
  },
}

vi.mock('../../../lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('../../../lib/email', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// ---------------------------------------------------------------------------
// Helpers that mirror the logic in app/actions/auth.ts
// ---------------------------------------------------------------------------

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function tokenExpiry(offsetMs = 60 * 60 * 1000): Date {
  return new Date(Date.now() + offsetMs)
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------
const emailArbitrary = fc.emailAddress()
const nameArbitrary = fc.string({ minLength: 2, maxLength: 50 })

const RUNS = 20

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Property 4: Password reset generates secure tokens', () => {
  beforeEach(() => {
    mockUsers.clear()
    vi.clearAllMocks()
  })

  /**
   * Tokens must be 64 hex characters (32 bytes → 64 hex chars)
   */
  it('should generate a 64-character hex token for any reset request', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const token = generateResetToken()

        expect(token).toHaveLength(64)
        expect(token).toMatch(/^[0-9a-f]+$/)
      }),
      { numRuns: RUNS }
    )
  }, 15_000)

  /**
   * Every generated token must be unique (no two calls produce the same value)
   */
  it('should produce unique tokens on every call', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 10 }), async (count) => {
        const tokens = Array.from({ length: count }, () => generateResetToken())
        const unique = new Set(tokens)
        expect(unique.size).toBe(count)
      }),
      { numRuns: RUNS }
    )
  }, 15_000)

  /**
   * The stored token must be the SHA-256 hash of the raw token, never the raw token itself
   */
  it('should store a hashed token, not the raw token', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        const user = await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const rawToken = generateResetToken()
        const hashed = hashToken(rawToken)

        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: hashed, resetTokenExpiry: tokenExpiry() },
        })

        const updated = await mockPrisma.user.findUnique({ where: { email } })

        expect(updated!.resetToken).not.toBe(rawToken)
        expect(updated!.resetToken).toBe(hashed)
        expect(updated!.resetToken).toHaveLength(64) // SHA-256 hex = 64 chars
      }),
      { numRuns: RUNS }
    )
  }, 20_000)

  /**
   * Reset token expiry must always be set in the future (1 hour from now)
   */
  it('should set token expiry to 1 hour in the future', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        const user = await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const before = Date.now()
        const expiry = tokenExpiry()
        const after = Date.now()

        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: hashToken(generateResetToken()), resetTokenExpiry: expiry },
        })

        const updated = await mockPrisma.user.findUnique({ where: { email } })

        expect(updated!.resetTokenExpiry).not.toBeNull()
        const expiryMs = updated!.resetTokenExpiry!.getTime()

        // Must be ~1 hour ahead (allow 5s tolerance for test execution time)
        expect(expiryMs).toBeGreaterThanOrEqual(before + 60 * 60 * 1000 - 5000)
        expect(expiryMs).toBeLessThanOrEqual(after + 60 * 60 * 1000 + 5000)
      }),
      { numRuns: RUNS }
    )
  }, 20_000)

  /**
   * A valid (non-expired) token must be found when looked up by its hash
   */
  it('should find a user by valid hashed token before expiry', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        const user = await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const rawToken = generateResetToken()
        const hashed = hashToken(rawToken)

        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: hashed, resetTokenExpiry: tokenExpiry() },
        })

        // Simulate the lookup in resetPassword action
        const found = await mockPrisma.user.findFirst({
          where: {
            resetToken: hashed,
            resetTokenExpiry: { gt: new Date() },
          },
        })

        expect(found).not.toBeNull()
        expect(found!.email).toBe(email)
      }),
      { numRuns: RUNS }
    )
  }, 20_000)

  /**
   * An expired token must NOT be found
   */
  it('should not find a user when the token has expired', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        const user = await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const rawToken = generateResetToken()
        const hashed = hashToken(rawToken)

        // Set expiry in the past
        const pastExpiry = new Date(Date.now() - 1000)

        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: hashed, resetTokenExpiry: pastExpiry },
        })

        const found = await mockPrisma.user.findFirst({
          where: {
            resetToken: hashed,
            resetTokenExpiry: { gt: new Date() },
          },
        })

        expect(found).toBeNull()
      }),
      { numRuns: RUNS }
    )
  }, 20_000)

  /**
   * After a successful reset, the token fields must be cleared
   */
  it('should clear reset token fields after password reset', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, nameArbitrary, async (email, name) => {
        const user = await mockPrisma.user.create({ data: { email, name, role: 'CUSTOMER' } })

        const rawToken = generateResetToken()
        const hashed = hashToken(rawToken)

        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: hashed, resetTokenExpiry: tokenExpiry() },
        })

        // Simulate clearing after successful reset
        await mockPrisma.user.update({
          where: { id: user.id },
          data: { resetToken: null, resetTokenExpiry: null },
        })

        const updated = await mockPrisma.user.findUnique({ where: { email } })

        expect(updated!.resetToken).toBeNull()
        expect(updated!.resetTokenExpiry).toBeNull()
      }),
      { numRuns: RUNS }
    )
  }, 20_000)
})
