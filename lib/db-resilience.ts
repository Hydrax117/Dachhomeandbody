/**
 * Database resilience utilities.
 *
 * Provides:
 * - isDbConnectionError()  — detects transient Prisma/Postgres connection failures
 * - withRetry()            — retries an async operation once after a short delay
 * - withDbFallback()       — wraps a DB call; on connection failure returns a
 *                            fallback value instead of throwing (prevents the
 *                            Next.js error boundary from triggering)
 * - DbUnavailableError     — a typed sentinel thrown when all retries are exhausted,
 *                            so error boundaries can show a specific soft message
 */

// ---------------------------------------------------------------------------
// Prisma error codes that indicate a transient connection problem
// (not a query mistake or constraint violation)
// ---------------------------------------------------------------------------

const TRANSIENT_PRISMA_CODES = new Set([
  "P1000", // Authentication failed
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operations timed out
  "P1009", // Database already exists (harmless, but transient)
  "P1011", // TLS connection error
  "P1017", // Server closed connection
  "P2024", // Timed out fetching a connection from the pool
])

const TRANSIENT_PG_MESSAGES = [
  "connection refused",
  "connection reset",
  "connection timed out",
  "timeout expired",
  "econnrefused",
  "econnreset",
  "etimedout",
  "socket hang up",
  "too many connections",
  "remaining connection slots are reserved",
  "connection pool timed out",
  "prepared statement",   // pgbouncer transaction mode
]

export function isDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false

  const error = err as Record<string, unknown>

  // Prisma known error with a transient code
  if (
    error.name === "PrismaClientKnownRequestError" &&
    typeof error.code === "string" &&
    TRANSIENT_PRISMA_CODES.has(error.code)
  ) {
    return true
  }

  // Prisma initialization error (can't connect at startup)
  if (error.name === "PrismaClientInitializationError") return true

  // Prisma unknown request error (wraps raw pg errors)
  if (error.name === "PrismaClientUnknownRequestError") {
    const msg = String(error.message ?? "").toLowerCase()
    return TRANSIENT_PG_MESSAGES.some((pat) => msg.includes(pat))
  }

  // Raw node error (ECONNREFUSED, ETIMEDOUT, etc.)
  if (typeof error.code === "string") {
    const code = error.code.toLowerCase()
    if (code.startsWith("econn") || code === "etimedout" || code === "enotfound") {
      return true
    }
  }

  // Catch-all: message contains a transient pattern
  const msg = String(error.message ?? "").toLowerCase()
  return TRANSIENT_PG_MESSAGES.some((pat) => msg.includes(pat))
}

// ---------------------------------------------------------------------------
// Typed sentinel error — thrown when all retries are exhausted.
// Next.js error boundaries can check instanceof to show a soft message.
// ---------------------------------------------------------------------------

export class DbUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("The service is temporarily unavailable. Please try again in a moment.")
    this.name = "DbUnavailableError"
    this.cause = cause
  }
}

// ---------------------------------------------------------------------------
// withRetry — retries once after `delayMs` on transient errors
// ---------------------------------------------------------------------------

export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 1, delayMs = 600 }: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (!isDbConnectionError(err) || attempt === retries) throw err
      await new Promise((res) => setTimeout(res, delayMs))
    }
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// withDbFallback — safe wrapper for page-level data fetching.
//
// On success:     returns { data: T, unavailable: false }
// On DB error:    returns { data: fallback, unavailable: true }
// On other error: re-throws (keeps existing behaviour for non-DB errors)
//
// Usage in a server component:
//   const { data: products, unavailable } = await withDbFallback(
//     () => getProducts(...),
//     []           // fallback — empty array keeps the page renderable
//   )
//   if (unavailable) return <ServiceUnavailableBanner />
// ---------------------------------------------------------------------------

export async function withDbFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  { retries = 1, delayMs = 600 }: { retries?: number; delayMs?: number } = {}
): Promise<{ data: T; unavailable: boolean }> {
  try {
    const data = await withRetry(fn, { retries, delayMs })
    return { data, unavailable: false }
  } catch (err) {
    if (isDbConnectionError(err)) {
      // Log but don't surface to the user
      console.error("[DB] Connection error — returning fallback:", {
        name: (err as Error)?.name,
        message: (err as Error)?.message,
      })
      return { data: fallback, unavailable: true }
    }
    throw err // Not a connection error — let it propagate normally
  }
}
