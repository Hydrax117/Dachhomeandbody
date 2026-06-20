/**
 * Staff management data access functions.
 * Admin-only — creating, listing, and deactivating staff accounts.
 */

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// ── Schemas ────────────────────────────────────────────────────────────────

export const staffCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  phone: z.string().max(20).optional(),
})

export type StaffCreateInput = z.infer<typeof staffCreateSchema>

// ── Types ──────────────────────────────────────────────────────────────────

export interface StaffRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  _count: {
    orders: number
    stockHistory: number
    inStoreSales: number
  }
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * List all staff accounts, newest first.
 */
export async function getStaffMembers(): Promise<StaffRow[]> {
  return prisma.user.findMany({
    where: { role: "STAFF" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          stockHistory: true,
          inStoreSales: true,
        },
      },
    },
  }) as Promise<StaffRow[]>
}

/**
 * Get a single staff member by id.
 */
export async function getStaffMember(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "STAFF" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          stockHistory: true,
          inStoreSales: true,
        },
      },
    },
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Create a new staff account.
 * Password is hashed with bcrypt before storage.
 */
export async function createStaffMember(input: StaffCreateInput) {
  const { name, email, password, phone } = staffCreateSchema.parse(input)

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error("An account with this email already exists.")
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone ?? null,
      role: "STAFF",
      emailVerified: new Date(), // Staff accounts are pre-verified by admin
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })
}

/**
 * Deactivate a staff member by downgrading their role to CUSTOMER.
 * This revokes their admin dashboard access without deleting the account.
 */
export async function deactivateStaffMember(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!user) throw new Error("User not found")
  if (user.role !== "STAFF") throw new Error("User is not a staff member")

  return prisma.user.update({
    where: { id },
    data: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, role: true },
  })
}

/**
 * Reactivate a previously deactivated staff member.
 */
export async function reactivateStaffMember(id: string) {
  return prisma.user.update({
    where: { id },
    data: { role: "STAFF" },
    select: { id: true, name: true, email: true, role: true },
  })
}

/**
 * Update a staff member's name, phone.
 */
export async function updateStaffMember(
  id: string,
  data: { name?: string; phone?: string | null }
) {
  return prisma.user.update({
    where: { id, role: "STAFF" },
    data,
    select: { id: true, name: true, email: true, phone: true },
  })
}
