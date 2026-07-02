"use client"

import { useEffect } from "react"
import Link from "next/link"

// Patterns that indicate a transient DB/network issue rather than a code bug
const CONNECTION_PATTERNS = [
  "dbUnavailable",           // our DbUnavailableError name in digest
  "connection",
  "econnrefused",
  "etimedout",
  "pool timed out",
  "temporarily unavailable",
  "p1001", "p1002", "p1008", "p2024",  // Prisma connection codes
]

function isConnectionError(error: Error & { digest?: string }): boolean {
  const haystack = [
    error.message ?? "",
    error.name ?? "",
    error.digest ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return CONNECTION_PATTERNS.some((p) => haystack.includes(p))
}

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[App Error]", error)
  }, [error])

  const isConnection = isConnectionError(error)

  if (isConnection) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[#F8F5F2] border border-[#e5e5e5] flex items-center justify-center mx-auto mb-6">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8965C"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>

          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-4">
            Connection issue
          </p>
          <h1 className="font-serif text-[#111111] font-light leading-[1.15] mb-4"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            Having trouble connecting
          </h1>
          <p className="text-sm text-[#8C8C8C] leading-[1.9] mb-8 max-w-xs mx-auto">
            We&apos;re experiencing a temporary connection issue. This usually resolves
            in a few seconds — please try again.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={unstable_retry}
              className="px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-8 py-3.5 border border-[#e5e5e5] text-[#8C8C8C] text-[10px] tracking-[0.25em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Generic unexpected error (code bugs, etc.)
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
