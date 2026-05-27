"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-[#EBEBEB] pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <p className="text-[10px] tracking-[0.28em] uppercase font-medium text-[#111111] mb-4">
        {title}
      </p>
      {children}
    </div>
  )
}

function RadioOption({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-2 min-h-[44px]">
      <span className="flex items-center gap-3">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
            checked
              ? "border-[#111111] bg-[#111111]"
              : "border-[#C4C4C4] group-hover:border-[#111111]"
          }`}
          aria-hidden="true"
        >
          {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          aria-label={label}
        />
        <span
          className={`text-sm transition-colors duration-200 ${
            checked ? "text-[#111111] font-medium" : "text-[#4A4A4A] group-hover:text-[#111111]"
          }`}
        >
          {label}
        </span>
      </span>
      {count !== undefined && (
        <span className="text-[11px] text-[#8C8C8C] ml-2">{count}</span>
      )}
    </label>
  )
}

// ---------------------------------------------------------------------------
// Price range input
// ---------------------------------------------------------------------------

function PriceRange({
  min,
  max,
  onApply,
}: {
  min: string
  max: string
  onApply: (min: string, max: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="label text-[9px] mb-1" htmlFor="price-min">Min (₦)</label>
          <input
            type="number"
            defaultValue={min}
            min={0}
            placeholder="0"
            className="input text-sm py-2"
            id="price-min"
            onBlur={(e) => onApply(e.target.value, max)}
          />
        </div>
        <span className="text-[#C4C4C4] mt-5">–</span>
        <div className="flex-1">
          <label className="label text-[9px] mb-1" htmlFor="price-max">Max (₦)</label>
          <input
            type="number"
            defaultValue={max}
            min={0}
            placeholder="Any"
            className="input text-sm py-2"
            id="price-max"
            onBlur={(e) => onApply(min, e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main FilterSidebar
// ---------------------------------------------------------------------------

interface FilterSidebarProps {
  categories: Category[]
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function FilterSidebar({ categories, mobileOpen, onMobileClose }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const selectedCategory = searchParams.get("categoryId") ?? ""
  const priceMin = searchParams.get("priceMin") ?? ""
  const priceMax = searchParams.get("priceMax") ?? ""

  const hasActiveFilters = selectedCategory !== "" || priceMin !== "" || priceMax !== ""

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;["categoryId", "priceMin", "priceMax", "page"].forEach((k) => params.delete(k))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const content = (
    <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] tracking-[0.3em] uppercase font-medium">Filters</p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] tracking-[0.15em] uppercase text-[#B8965C] hover:text-[#111111] transition-colors underline underline-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-0.5">
            <RadioOption
              label="All Products"
              checked={selectedCategory === ""}
              onChange={() => updateParams({ categoryId: null })}
            />
            {categories.map((cat) => (
              <RadioOption
                key={cat.id}
                label={cat.name}
                count={cat._count.products}
                checked={selectedCategory === cat.id}
                onChange={() => updateParams({ categoryId: cat.id })}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price">
        <PriceRange
          min={priceMin}
          max={priceMax}
          onApply={(min, max) => updateParams({ priceMin: min, priceMax: max })}
        />
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0" aria-label="Product filters">
        {content}
      </aside>

      {/* Mobile drawer */}
      <>
        <div
          aria-hidden="true"
          onClick={onMobileClose}
          className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
          className={`fixed top-0 left-0 h-full w-[min(320px,85vw)] bg-[#F8F5F2] z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-[#EBEBEB] shrink-0">
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium">Filters</span>
            <button
              aria-label="Close filters"
              onClick={onMobileClose}
              className="hover:text-[#B8965C] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">{content}</div>
        </div>
      </>
    </>
  )
}
