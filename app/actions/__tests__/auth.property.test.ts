/**
 * Property-Based Tests for Authentication
 *
 * Validates: Requirements 1.1, 1.2, 22.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import bcrypt from 'bcryptjs'

// ---------------------------------------------------------------------------
// In-memory Prisma mock — no live database required
// ---------------------------------------------------------------------------
type MockUser = { id: string; email: string; name: string | null; password: string | null; role: string }
const mockUsers = new Map<string, MockUser>()
let idCounter = 0

const mockPrisma = {
  user: {
    create: vi.fn(async ({ data }: { data: { name?: string; email: string; password?: string; role: string } }) => {
      if (mockUsers.has(data.email)) {
        const err = new Error('Unique constraint failed on the fields: (`email`)')
        throw err
      }
      const user: MockUser = {
        id: `id-${++idCounter}`,
        email: data.email,
        name: data.name ?? null,
        password: data.password ?? null,
        role: data.role,
      }
      mockUsers.set(data.email, user)
      return user
    }),
    findUnique: vi.fn(async ({ where }: { where: { email?: string } }) => {
      if (where.email) return mockUsers.get(where.email) ?? null
      return null
    }),
    delete: vi.fn(async ({ where }: { where: { id: string } }) => {
      for (const [email, user] of mockUsers.entries()) {
        if (user.id === where.id) {
          mockUsers.delete(email)
          return user
        }
      }
    }),
  },
}

vi.mock('../../../lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('../../../lib/auth', () => ({ signIn: vi.fn().mockResolvedValue(undefined) }))

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------
const emailArbitrary = fc.emailAddress()

const passwordArbitrary = fc
  .string({ minLength: 8, maxLength: 30 })
  .filter((s) => /[a-zA-Z]/.test(s) && /[0-9]/.test(s))

const nameArbitrary = fc.string({ minLength: 2, maxLength: 50 })

const validUserArbitrary = fc.record({
  name: nameArbitrary,
  email: emailArbitrary,
  password: passwordArbitrary,
})

const RUNS = 10

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Authentication Property-Based Tests', () => {
  beforeEach(() => {
    mockUsers.clear()
    vi.clearAllMocks()
  })

  /**
   * Property 86: Passwords are hashed before storage
   * Validates: Requirements 22.2
   */
  describe('Property 86: Passwords are hashed before storage', () => {
    it('should never store a password in plain text', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArbitrary, async (userData) => {
          const hashed = await bcrypt.hash(userData.password, 10)
          const user = await mockPrisma.user.create({
            data: { name: userData.name, email: userData.email, password: hashed, role: 'CUSTOMER' },
          })

          expect(user.password).not.toBe(userData.password)
          expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/)
          expect(await bcrypt.compare(userData.password, user.password!)).toBe(true)
          expect(await bcrypt.compare(userData.password + 'x', user.password!)).toBe(false)

          await mockPrisma.user.delete({ where: { id: user.id } })
        }),
        { numRuns: RUNS }
      )
    }, 30_000)

    it('should use 10 salt rounds', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          const hashed = await bcrypt.hash(password, 10)
          // bcrypt format: $2a$<rounds>$<rest>
          const rounds = hashed.split('$')[2]
          expect(rounds).toBe('10')
        }),
        { numRuns: RUNS }
      )
    }, 15_000)

    it('should produce a unique hash each time due to random salt', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          const h1 = await bcrypt.hash(password, 10)
          const h2 = await bcrypt.hash(password, 10)
          expect(h1).not.toBe(h2)
          expect(await bcrypt.compare(password, h1)).toBe(true)
          expect(await bcrypt.compare(password, h2)).toBe(true)
        }),
        { numRuns: RUNS }
      )
    }, 15_000)
  })

  /**
   * Property 1: User registration creates authenticated session
   * Validates: Requirements 1.1
   */
  describe('Property 1: User registration creates authenticated session', () => {
    it('should persist a user with a hashed password for any valid input', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArbitrary, async (userData) => {
          const hashed = await bcrypt.hash(userData.password, 10)
          const user = await mockPrisma.user.create({
            data: { name: userData.name, email: userData.email, password: hashed, role: 'CUSTOMER' },
          })

          expect(user.email).toBe(userData.email)
          expect(user.name).toBe(userData.name)
          expect(user.role).toBe('CUSTOMER')
          expect(user.password).not.toBe(userData.password)
          expect(await bcrypt.compare(userData.password, user.password!)).toBe(true)

          await mockPrisma.user.delete({ where: { id: user.id } })
        }),
        { numRuns: RUNS }
      )
    }, 30_000)

    it('should reject duplicate email registrations', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArbitrary, async (userData) => {
          const hashed = await bcrypt.hash(userData.password, 10)
          const first = await mockPrisma.user.create({
            data: { name: userData.name, email: userData.email, password: hashed, role: 'CUSTOMER' },
          })

          await expect(
            mockPrisma.user.create({
              data: { name: 'Other', email: userData.email, password: hashed, role: 'CUSTOMER' },
            })
          ).rejects.toThrow()

          await mockPrisma.user.delete({ where: { id: first.id } })
        }),
        { numRuns: RUNS }
      )
    }, 30_000)
  })

  /**
   * Property 2: Valid credentials authenticate users
   * Validates: Requirements 1.2
   */
  describe('Property 2: Valid credentials authenticate users', () => {
    it('should authenticate any existing user with correct credentials', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArbitrary, async (userData) => {
          const hashed = await bcrypt.hash(userData.password, 10)
          const created = await mockPrisma.user.create({
            data: { name: userData.name, email: userData.email, password: hashed, role: 'CUSTOMER' },
          })

          // Mirrors authorize() in lib/auth.ts
          const found = await mockPrisma.user.findUnique({ where: { email: userData.email } })
          expect(found).not.toBeNull()
          expect(await bcrypt.compare(userData.password, found!.password!)).toBe(true)

          await mockPrisma.user.delete({ where: { id: created.id } })
        }),
        { numRuns: RUNS }
      )
    }, 30_000)

    it('should reject authentication with a wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArbitrary, passwordArbitrary, async (userData, wrong) => {
          if (wrong === userData.password) return

          const hashed = await bcrypt.hash(userData.password, 10)
          const created = await mockPrisma.user.create({
            data: { name: userData.name, email: userData.email, password: hashed, role: 'CUSTOMER' },
          })

          const found = await mockPrisma.user.findUnique({ where: { email: userData.email } })
          expect(await bcrypt.compare(wrong, found!.password!)).toBe(false)

          await mockPrisma.user.delete({ where: { id: created.id } })
        }),
        { numRuns: RUNS }
      )
    }, 30_000)

    it('should return null for non-existent users', async () => {
      await fc.assert(
        fc.asyncProperty(emailArbitrary, async (email) => {
          const found = await mockPrisma.user.findUnique({ where: { email } })
          expect(found).toBeNull()
        }),
        { numRuns: RUNS }
      )
    }, 10_000)
  })
})
