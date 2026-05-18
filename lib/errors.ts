import { NextResponse } from "next/server"

// ── Typed application errors ───────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, "FORBIDDEN", 403)
    this.name = "ForbiddenError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 422)
    this.name = "ValidationError"
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, "PAYMENT_ERROR", 402)
    this.name = "PaymentError"
  }
}

// ── Server action result type ──────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

export function actionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code }
  }
  if (error instanceof Error) {
    logError(error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
  return { success: false, error: "An unexpected error occurred. Please try again." }
}

// ── API route error handler ────────────────────────────────────────────────

export function apiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  logError(error instanceof Error ? error : new Error(String(error)))

  return NextResponse.json(
    { error: "An unexpected error occurred", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}

// ── Error logging ──────────────────────────────────────────────────────────

export function logError(error: Error, context?: Record<string, unknown>): void {
  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    console.error("[Error]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    })
    return
  }

  // In production, log structured JSON for observability tools
  console.error(
    JSON.stringify({
      level: "error",
      name: error.name,
      message: error.message,
      digest: (error as Error & { digest?: string }).digest,
      timestamp: new Date().toISOString(),
      ...context,
    })
  )
}
