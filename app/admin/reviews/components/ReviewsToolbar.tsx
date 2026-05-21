"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"
import type { AdminReviewSort } from "@/lib/reviews"

interface ReviewsToolbarProps {
  currentSearch: string
  currentStatus: string
  currentSort: AdminReviewSort
}

const REVIEW_STATUSES = [
  { value: "", label: "All Reviews" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating_desc", label: "Highest Rating" },
  { value: "rating_asc", label: "Lowest Rating" },
]

export default function ReviewsToolbar({
  currentSearch,
  currentStatus,
  currentSort,
}: ReviewsToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const merged = {
        search: currentSearch,
        status: currentStatus,
        sort: currentSort,
        page: "1",
        ...updates,
      }
      const qs = new URLSearchParams()
      if (merged.search) qs.set("search", merged.search)
      if (merged.status) qs.set("status", merged.status)
      if (merged.sort && merged.sort !== "newest") qs.set("sort", merged.sort)
      if (merged.page && merged.page !== "1") qs.set("page", merged.page)
      const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      startTransition(() => router.push(url))
    },
    [router, pathname, currentSearch, currentStatus, currentSort]
  )

  const hasFilters = currentSearch || currentStatus || currentSort !== "newest"

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search by product or reviewer…"
          defaultValue={currentSearch}
          onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C] transition-colors placeholder:text-[#aaa]"
          aria-label="Search reviews"
        />
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateParams({ status: e.target.value, page: "1" })}
        className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
        aria-label="Filter by status"
      >
        {REVIEW_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
        className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
        aria-label="Sort reviews"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() =>
            updateParams({ search: "", status: "", sort: "newest", page: "1" })
          }
          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
