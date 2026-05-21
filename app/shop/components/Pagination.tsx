"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"

interface PaginationProps {
  page: number
  totalPages: number
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) {
      params.delete("page")
    } else {
      params.set("page", String(p))
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true })
    })
  }

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const pages: (number | "…")[] = []
  const delta = 1

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i)
    } else if (
      (i === page - delta - 1 && i > 1) ||
      (i === page + delta + 1 && i < totalPages)
    ) {
      pages.push("…")
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1 mt-12 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Prev */}
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="w-11 h-11 flex items-center justify-center border border-[#EBEBEB] text-[#4A4A4A] hover:border-[#111111] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-11 h-11 flex items-center justify-center text-[#C4C4C4] text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`w-11 h-11 flex items-center justify-center text-sm border transition-colors ${
              p === page
                ? "bg-[#111111] text-white border-[#111111]"
                : "border-[#EBEBEB] text-[#4A4A4A] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="w-11 h-11 flex items-center justify-center border border-[#EBEBEB] text-[#4A4A4A] hover:border-[#111111] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  )
}
