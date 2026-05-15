"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"

interface CustomersToolbarProps {
  currentSearch: string
  currentSort: string
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "spend_desc", label: "Highest Spend" },
  { value: "orders_desc", label: "Most Orders" },
]

export default function CustomersToolbar({
  currentSearch,
  currentSort,
}: CustomersToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const merged = {
        search: currentSearch,
        sort: currentSort,
        page: "1",
        ...updates,
      }
      const qs = new URLSearchParams()
      if (merged.search) qs.set("search", merged.search)
      if (merged.sort && merged.sort !== "newest") qs.set("sort", merged.sort)
      if (merged.page && merged.page !== "1") qs.set("page", merged.page)
      const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      startTransition(() => router.push(url))
    },
    [router, pathname, currentSearch, currentSort]
  )

  const hasFilters = currentSearch || currentSort !== "newest"

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
          placeholder="Search by name, email or phone…"
          defaultValue={currentSearch}
          onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors placeholder:text-[#aaa]"
          aria-label="Search customers"
        />
      </div>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
        className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#C8A96B] transition-colors text-[#111111]"
        aria-label="Sort customers"
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
          onClick={() => updateParams({ search: "", sort: "newest", page: "1" })}
          className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
