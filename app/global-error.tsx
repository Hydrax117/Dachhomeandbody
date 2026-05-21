"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[Global Error]", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F5F2",
          color: "#111111",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#B8965C",
              marginBottom: "1.5rem",
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 400,
              marginBottom: "1rem",
              lineHeight: 1.15,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "#C4C4C4",
              marginBottom: "2rem",
              lineHeight: 1.75,
            }}
          >
            A critical error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                fontFamily: "monospace",
                color: "#C4C4C4",
                marginBottom: "2rem",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={unstable_retry}
            style={{
              padding: "0.875rem 2rem",
              backgroundColor: "#111111",
              color: "#F8F5F2",
              border: "1px solid #111111",
              borderRadius: "0.125rem",
              fontSize: "0.6875rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
