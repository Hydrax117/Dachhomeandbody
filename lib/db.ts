/**
 * Database utility functions and transaction helpers.
 * All data access should go through these helpers or the prisma client directly.
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

/**
 * Run a set of operations inside a Prisma interactive transaction.
 * Automatically retries on write-conflict (P2034) up to `maxRetries` times.
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { maxRetries?: number; timeout?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  const timeout = options?.timeout ?? 10_000 // ms

  let attempt = 0
  while (true) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: timeout,
        timeout,
      })
    } catch (err) {
      // P2034 = Transaction failed due to a write conflict or deadlock
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2034' &&
        attempt < maxRetries - 1
      ) {
        attempt++
        continue
      }
      throw err
    }
  }
}

// ---------------------------------------------------------------------------
// Pagination helpers
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Build Prisma `skip` / `take` args from page-based pagination params.
 */
export function buildPaginationArgs(params: PaginationParams): {
  skip: number
  take: number
} {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  return { skip: (page - 1) * pageSize, take: pageSize }
}

/**
 * Wrap a list of items with pagination metadata.
 */
export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the Prisma error indicates a unique-constraint violation.
 */
export function isUniqueConstraintError(
  err: unknown
): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  )
}

/**
 * Returns true when the Prisma error indicates a record was not found.
 */
export function isNotFoundError(
  err: unknown
): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
  )
}

// ---------------------------------------------------------------------------
// Common query helpers
// ---------------------------------------------------------------------------

/**
 * Find a record by id or return null (avoids throwing on missing records).
 */
export async function findById<
  Model extends { findUnique: (args: { where: { id: string } }) => Promise<T | null> },
  T,
>(model: Model, id: string): Promise<T | null> {
  return model.findUnique({ where: { id } })
}

/**
 * Soft-delete a record by setting `deleted = true`.
 * The model must have a `deleted` boolean field.
 */
export async function softDelete(
  model: {
    update: (args: {
      where: { id: string }
      data: { deleted: boolean }
    }) => Promise<unknown>
  },
  id: string
): Promise<void> {
  await model.update({ where: { id }, data: { deleted: true } })
}

// Re-export prisma so callers only need to import from one place if desired.
export { prisma }
