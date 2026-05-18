import type { Instrumentation } from "next"

export function register() {
  // Placeholder for observability tool registration (e.g. OpenTelemetry, Sentry)
  // Example: registerOTel('dachhomeandbody')
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const error = err as Error & { digest?: string }
  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    console.error("[Server Request Error]", {
      message: error.message,
      digest: error.digest,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
    })
    return
  }

  // Production: structured log for observability ingestion
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
