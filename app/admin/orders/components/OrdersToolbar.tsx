"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"

interface OrdersToolbarProps {
  currentSearch: string
  currentStatus: string
  currentStartDate: string
  currentEndDate: string
  currentSort: string
}

const ORDER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "total_desc", label: "Highest Total" },
  { value: "total_asc", label: "Lowest Total" },
]

export default function OrdersToolbar({
  currentSearch,
  currentStatus,
  currentStartDate,
  currentEndDate,
  currentSort,
}: OrdersToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const merged = {
        search: currentSearch,
        status: currentStatus,
        startDate: currentStartDate,
        endDate: currentEndDate,
        sort: currentSort,
        page: "1",
        ...updates,
      }
      const qs = new URLSearchParams()
      if (merged.search) qs.set("search", merged.search)
      if (merged.status) qs.set("status", merged.status)
      if (merged.startDate) qs.set("startDate", merged.startDate)
      if (merged.endDate) qs.set("endDate", merged.endDate)
      if (merged.sort && merged.sort !== "newest") qs.set("sort", merged.sort)
      if (merged.page && merged.page !== "1") qs.set("page", merged.page)
      const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      startTransition(() => router.push(url))
    },
    [router, pathname, currentSearch, currentStatus, currentStartDate, currentEndDate, currentSort]
  )

  const hasFilters =
    currentSearch || currentStatus || currentStartDate || currentEndDate || currentSort !== "newest"

  return (
    <div className="space-y-3">
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
            placeholder="Search by order #, customer name or email…"
            defaultValue={currentSearch}
            onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C] transition-colors placeholder:text-[#aaa]"
            aria-label="Search orders"
          />
        </div>

        {/* Status filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateParams({ status: e.target.value, page: "1" })}
          className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
          aria-label="Filter by status"
        >
          {ORDER_STATUSES.map((s) => (
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
          aria-label="Sort orders"
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
              updateParams({
                search: "",
                status: "",
                startDate: "",
                endDate: "",
                sort: "newest",
                page: "1",
              })
            }
            className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Date range row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="startDate" className="text-xs text-[#8C8C8C] shrink-0">
            From
          </label>
          <input
            id="startDate"
            type="date"
            value={currentStartDate}
            onChange={(e) => updateParams({ startDate: e.target.value, page: "1" })}
            className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
            aria-label="Start date"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endDate" className="text-xs text-[#8C8C8C] shrink-0">
            To
          </label>
          <input
            id="endDate"
            type="date"
            value={currentEndDate}
            onChange={(e) => updateParams({ endDate: e.target.value, page: "1" })}
            className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
            aria-label="End date"
          />
        </div>
      </div>
    </div>
  )
}
