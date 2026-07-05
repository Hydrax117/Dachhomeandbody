import * as Sentry from "@sentry/nextjs"
import type { Instrumentation } from "next"

export async function register() {
  // Load Sentry config for the appropriate runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Forward every server-side request error to Sentry
  await Sentry.captureRequestError(err, request, context)

  // Also log locally for observability
  const error = err as Error & { digest?: string }
  console.error(
    JSON.stringify({
      level: "error",
      source: "server-request",
      message: error.message,
      digest: error.digest,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      timestamp: new Date().toISOString(),
    })
  )
}
