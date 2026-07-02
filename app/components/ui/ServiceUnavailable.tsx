import Link from "next/link"

/**
 * Shown in place of data-driven sections when the database is temporarily
 * unreachable. Keeps the page shell intact so users don't see a crash screen.
 */
export default function ServiceUnavailable({
  message = "We're having trouble loading this content right now.",
  showRetry = true,
}: {
  message?: string
  showRetry?: boolean
}) {
  return (
    <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-center px-5">
      <div className="w-12 h-12 rounded-full bg-[#F8F5F2] border border-[#e5e5e5] flex items-center justify-center mb-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B8965C"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-3">
        Temporarily unavailable
      </p>
      <p className="text-sm text-[#4A4A4A] leading-[1.8] max-w-sm mb-6">
        {message}
      </p>
      {showRetry && (
        <div className="flex items-center gap-3">
          <Link
            href="."
            className="px-6 py-3 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-[#e5e5e5] text-[#8C8C8C] text-[10px] tracking-[0.2em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300"
          >
            Go home
          </Link>
        </div>
      )}
    </div>
  )
}
