"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // Log to console in development; in production this would go to an observability service
    console.error("[App Error]", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-eyebrow mb-6">Something went wrong</p>
        <h1 className="text-headline mb-4">An unexpected error occurred</h1>
        <p className="text-body mb-8">
          We apologize for the inconvenience. Please try again or return to the homepage.
        </p>
        {error.digest && (
          <p className="text-caption mb-8 font-mono">
            Error reference: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button onClick={unstable_retry} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
