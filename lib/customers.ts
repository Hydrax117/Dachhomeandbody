/**
 * Customer data access functions for admin management.
 * Requirements: 23.1, 23.3
 */

import { prisma } from "@/lib/prisma"
import {
  buildPaginationArgs,
  paginate,
  type PaginationParams,
} from "@/lib/db"

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminCustomerRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  role: string
  createdAt: Date
  _count: {
    orders: number
  }
  totalSpend: number
}

export interface AdminCustomerFilters {
  /** Matches customer name, email, or phone */
  search?: string
}

export type AdminCustomerSort = "newest" | "oldest" | "spend_desc" | "orders_desc"

// ── Helpers ────────────────────────────────────────────────────────────────

function buildAdminCustomerWhere(filters: AdminCustomerFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { role: "CUSTOMER" }

  if (filters.search) {
    const term = filters.search.trim()
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ]
  }

  return where
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Get all customers for admin with search, sorting, and pagination.
 * Includes order count and total spend per customer.
 * Requirements: 23.1, 23.3
 */
export async function getAdminCustomers(
  filters: AdminCustomerFilters = {},
  sort: AdminCustomerSort = "newest",
  pagination: PaginationParams = {}
): Promise<import("@/lib/db").PaginatedResult<AdminCustomerRow>> {
  const where = buildAdminCustomerWhere(filters)
  const { skip, take } = buildPaginationArgs(pagination)

  const dbSort = sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const }

  // Fetch users with order count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
        },
      },
      orderBy: dbSort,
    }),
    prisma.user.count({ where }),
  ])

  // Compute total spend per customer
  let rows: AdminCustomerRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    image: u.image,
    role: u.role,
    createdAt: u.createdAt,
    _count: u._count,
    totalSpend: u.orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0),
  }))

  // Apply in-memory sorts that can't be done via Prisma orderBy on aggregates
  if (sort === "spend_desc") {
    rows = rows.sort((a, b) => b.totalSpend - a.totalSpend)
  } else if (sort === "orders_desc") {
    rows = rows.sort((a, b) => b._count.orders - a._count.orders)
  }

  return paginate(rows, total, pagination)
}
