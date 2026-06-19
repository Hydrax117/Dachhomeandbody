import Link from "next/link"

interface PaginationProps {
  page: number
  totalPages: number
  /** Function that returns the URL for a given page number */
  buildUrl: (page: number) => string
  /** Short label shown in "Page X of Y — N items" e.g. "products", "orders" */
  itemLabel?: string
  total?: number
  /** Extra class on the outer wrapper */
  className?: string
  /** Compact mode — centres the nav instead of space-between layout */
  centered?: boolean
}

/**
 * Shared pagination component.
 *
 * Renders:
 *   ← Prev  1  2  [3]  4  5  …  12  Next →
 *
 * The current page is highlighted.  At most 7 page buttons are shown at once,
 * with an ellipsis when the range is interrupted.
 */
export default function Pagination({
  page,
  totalPages,
  buildUrl,
  itemLabel,
  total,
  className = "",
  centered = false,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // ── Build page number list with ellipsis ──────────────────────────────────
  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const delta = 1 // pages to show around current
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)

    const pages: (number | "…")[] = [1]

    if (left > 2) pages.push("…")
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push("…")

    pages.push(totalPages)
    return pages
  }

  const pages = getPageNumbers()

  const btnBase =
    "inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-xs border rounded transition-colors select-none"
  const btnDefault =
    "border-[#e5e5e5] text-[#4A4A4A] hover:border-[#B8965C] hover:text-[#B8965C]"
  const btnActive =
    "border-[#111111] bg-[#111111] text-white cursor-default"
  const btnDisabled =
    "border-[#e5e5e5] text-[#CACACA] cursor-not-allowed pointer-events-none"
  const btnEllipsis =
    "border-transparent text-[#8C8C8C] pointer-events-none"

  return (
    <div
      className={[
        "px-4 py-3 border-t border-[#e5e5e5] bg-[#F8F5F2]",
        centered ? "flex flex-col items-center gap-3" : "flex items-center justify-between flex-wrap gap-3",
        className,
      ].join(" ")}
    >
      {/* Count label */}
      {(itemLabel || total !== undefined) && (
        <p className="text-xs text-[#8C8C8C] shrink-0">
          Page {page} of {totalPages}
          {total !== undefined && itemLabel ? ` — ${total} ${itemLabel}` : ""}
        </p>
      )}

      {/* Nav */}
      <nav className="flex items-center gap-1 flex-wrap" aria-label="Pagination">
        {/* Prev */}
        {page > 1 ? (
          <Link href={buildUrl(page - 1)} className={`${btnBase} ${btnDefault}`} aria-label="Previous page">
            ← Prev
          </Link>
        ) : (
          <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">← Prev</span>
        )}

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className={`${btnBase} ${btnEllipsis}`} aria-hidden="true">
              …
            </span>
          ) : p === page ? (
            <span
              key={p}
              className={`${btnBase} ${btnActive}`}
              aria-current="page"
              aria-label={`Page ${p}`}
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`${btnBase} ${btnDefault}`}
              aria-label={`Go to page ${p}`}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {page < totalPages ? (
          <Link href={buildUrl(page + 1)} className={`${btnBase} ${btnDefault}`} aria-label="Next page">
            Next →
          </Link>
        ) : (
          <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">Next →</span>
        )}
      </nav>
    </div>
  )
}
