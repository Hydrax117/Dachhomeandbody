"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition, useState, useRef, useEffect } from "react"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

interface ShopToolbarProps {
  total: number
  onFilterOpen: () => void
}

export function ShopToolbar({ total, onFilterOpen }: ShopToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "")
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentSort = searchParams.get("sort") ?? "newest"

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "")
  }, [searchParams])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParam("q", value)
    }, 400)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updateParam("q", searchValue)
  }

  const clearSearch = () => {
    setSearchValue("")
    updateParam("q", "")
    searchRef.current?.focus()
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      {/* Left: filter toggle (mobile) + result count */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile filter button */}
        <button
          onClick={onFilterOpen}
          className="lg:hidden flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase border border-[#e8ded3] px-4 py-3 min-h-[44px] hover:border-[#111111] transition-colors"
          aria-label="Open filters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filters
        </button>

        <p className="text-sm text-[#8b7355]">
          {isPending ? (
            <span className="inline-block w-16 h-4 skeleton rounded" aria-hidden="true" />
          ) : (
            <>{total.toLocaleString()} {total === 1 ? "product" : "products"}</>
          )}
        </p>
      </div>

      {/* Right: search + sort */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="relative flex-1 sm:w-56"
        >
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8b0a8] pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            id="shop-search"
            type="search"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search fragrances…"
            className="input pl-9 pr-8 py-2.5 text-sm w-full"
            aria-label="Search products"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b0a8] hover:text-[#111111] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </form>

        {/* Sort */}
        <div className="relative shrink-0">
          <label htmlFor="shop-sort" className="sr-only">Sort products</label>
          <select
            id="shop-sort"
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input py-2.5 pr-8 text-sm appearance-none cursor-pointer w-full sm:min-w-[160px]"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b7355]"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}
