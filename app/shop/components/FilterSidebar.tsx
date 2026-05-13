"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

// ---------------------------------------------------------------------------
// Filter option definitions
// ---------------------------------------------------------------------------

const FRAGRANCE_TYPES = [
  { value: "PERFUME", label: "Perfume" },
  { value: "EAU_DE_PARFUM", label: "Eau de Parfum" },
  { value: "EAU_DE_TOILETTE", label: "Eau de Toilette" },
  { value: "COLOGNE", label: "Cologne" },
  { value: "BODY_MIST", label: "Body Mist" },
]

const GENDERS = [
  { value: "UNISEX", label: "Unisex" },
  { value: "MALE", label: "Men" },
  { value: "FEMALE", label: "Women" },
]

const LONGEVITY = [
  { value: "SHORT", label: "1–3 Hours" },
  { value: "MODERATE", label: "3–6 Hours" },
  { value: "LONG", label: "6–12 Hours" },
  { value: "VERY_LONG", label: "12+ Hours" },
]

const STRENGTH = [
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "STRONG", label: "Strong" },
  { value: "VERY_STRONG", label: "Very Strong" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMultiParam(params: URLSearchParams, key: string): string[] {
  return params.getAll(key)
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
    <div className="border-b border-[#e8ded3] pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <p className="text-[10px] tracking-[0.28em] uppercase font-medium text-[#111111] mb-4">
        {title}
      </p>
      {children}
    </div>
  )
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <span
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
          checked
            ? "bg-[#111111] border-[#111111]"
            : "border-[#b8b0a8] group-hover:border-[#111111]"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span className={`text-sm transition-colors duration-200 ${checked ? "text-[#111111] font-medium" : "text-[#4a4a4a] group-hover:text-[#111111]"}`}>
        {label}
      </span>
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
          <label className="label text-[9px] mb-1">Min (₦)</label>
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
        <span className="text-[#b8b0a8] mt-5">–</span>
        <div className="flex-1">
          <label className="label text-[9px] mb-1">Max (₦)</label>
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
  /** Mobile: whether the drawer is open */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function FilterSidebar({ mobileOpen, onMobileClose }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read current filter values from URL
  const selectedTypes = getMultiParam(searchParams, "type")
  const selectedGenders = getMultiParam(searchParams, "gender")
  const selectedLongevity = getMultiParam(searchParams, "longevity")
  const selectedStrength = getMultiParam(searchParams, "strength")
  const priceMin = searchParams.get("priceMin") ?? ""
  const priceMax = searchParams.get("priceMax") ?? ""

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedGenders.length > 0 ||
    selectedLongevity.length > 0 ||
    selectedStrength.length > 0 ||
    priceMin !== "" ||
    priceMax !== ""

  // Build updated URL params
  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 on filter change
      params.delete("page")

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key)
        if (value === null) continue
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value !== "") {
          params.set(key, value)
        }
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const toggleMulti = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateParams({ [key]: next })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;["type", "gender", "longevity", "strength", "priceMin", "priceMax", "page"].forEach((k) =>
      params.delete(k)
    )
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
            className="text-[10px] tracking-[0.15em] uppercase text-[#8b7355] hover:text-[#111111] transition-colors underline underline-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price">
        <PriceRange
          min={priceMin}
          max={priceMax}
          onApply={(min, max) => updateParams({ priceMin: min, priceMax: max })}
        />
      </FilterSection>

      {/* Fragrance Type */}
      <FilterSection title="Fragrance Type">
        <div className="space-y-0.5">
          {FRAGRANCE_TYPES.map((opt) => (
            <CheckboxOption
              key={opt.value}
              label={opt.label}
              checked={selectedTypes.includes(opt.value)}
              onChange={() => toggleMulti("type", opt.value, selectedTypes)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender">
        <div className="space-y-0.5">
          {GENDERS.map((opt) => (
            <CheckboxOption
              key={opt.value}
              label={opt.label}
              checked={selectedGenders.includes(opt.value)}
              onChange={() => toggleMulti("gender", opt.value, selectedGenders)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Longevity */}
      <FilterSection title="Longevity">
        <div className="space-y-0.5">
          {LONGEVITY.map((opt) => (
            <CheckboxOption
              key={opt.value}
              label={opt.label}
              checked={selectedLongevity.includes(opt.value)}
              onChange={() => toggleMulti("longevity", opt.value, selectedLongevity)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Strength */}
      <FilterSection title="Strength">
        <div className="space-y-0.5">
          {STRENGTH.map((opt) => (
            <CheckboxOption
              key={opt.value}
              label={opt.label}
              checked={selectedStrength.includes(opt.value)}
              onChange={() => toggleMulti("strength", opt.value, selectedStrength)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )

  // Desktop: static sidebar
  // Mobile: slide-in drawer
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
          className={`fixed top-0 left-0 h-full w-[min(320px,85vw)] bg-[#FAF6F1] z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-[#e8ded3] shrink-0">
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium">Filters</span>
            <button
              aria-label="Close filters"
              onClick={onMobileClose}
              className="hover:text-[#C8A96B] transition-colors"
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
