"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"

interface Category {
  id: string
  name: string
}

interface ProductsToolbarProps {
  categories: Category[]
  currentSearch: string
  currentCategory: string
  currentStock: string
}

export default function ProductsToolbar({
  categories,
  currentSearch,
  currentCategory,
  currentStock,
}: ProductsToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const qs = new URLSearchParams()
      const merged = {
        search: currentSearch,
        category: currentCategory,
        stock: currentStock,
        ...updates,
      }
      if (merged.search) qs.set("search", merged.search)
      if (merged.category) qs.set("category", merged.category)
      if (merged.stock) qs.set("stock", merged.stock)
      // Reset to page 1 on filter change
      const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      startTransition(() => router.push(url))
    },
    [router, pathname, currentSearch, currentCategory, currentStock]
  )

  const hasFilters = currentSearch || currentCategory || currentStock

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
          placeholder="Search products…"
          defaultValue={currentSearch}
          onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C] transition-colors placeholder:text-[#aaa]"
          aria-label="Search products"
        />
      </div>

      {/* Category filter */}
      <select
        value={currentCategory}
        onChange={(e) => updateParams({ category: e.target.value, page: "1" })}
        className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Stock filter */}
      <select
        value={currentStock}
        onChange={(e) => updateParams({ stock: e.target.value, page: "1" })}
        className="text-sm border border-[#e5e5e5] rounded bg-white px-3 py-2 focus:outline-none focus:border-[#B8965C] transition-colors text-[#111111]"
        aria-label="Filter by stock status"
      >
        <option value="">All Stock</option>
        <option value="in">In Stock</option>
        <option value="out">Out of Stock</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => updateParams({ search: "", category: "", stock: "", page: "1" })}
          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
