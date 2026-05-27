import type { Metadata } from "next"
import { getProducts } from "@/lib/products"
import type { ProductFilters, ProductSort } from "@/lib/products"
import { getCategories } from "@/lib/categories"
import { ShopClient } from "./components/ShopClient"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our full collection of luxury home fragrance, natural skincare, and curated gift services.",
}

// ---------------------------------------------------------------------------
// Helpers — parse & validate URL search params
// ---------------------------------------------------------------------------

function parsePositiveNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const n = parseFloat(value)
  return isFinite(n) && n >= 0 ? n : undefined
}

function parsePage(value: string | null): number {
  const n = parseInt(value ?? "1", 10)
  return isFinite(n) && n >= 1 ? n : 1
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams

  // Helper to get a single string value
  const str = (key: string): string | null => {
    const v = params[key]
    if (!v) return null
    return Array.isArray(v) ? v[0] : v
  }

  // Build filters
  const filters: ProductFilters = {
    search: str("q") ?? undefined,
    categoryId: str("categoryId") ?? undefined,
    priceMin: parsePositiveNumber(str("priceMin")),
    priceMax: parsePositiveNumber(str("priceMax")),
  }

  // Sort
  const sortParam = str("sort") ?? "newest"
  const validSorts: ProductSort[] = ["newest", "popularity", "price_asc", "price_desc"]
  const sort: ProductSort = validSorts.includes(sortParam as ProductSort)
    ? (sortParam as ProductSort)
    : "newest"

  // Pagination
  const page = parsePage(str("page"))
  const pageSize = 20

  const [result, categories] = await Promise.all([
    getProducts(filters, sort, { page, pageSize }),
    getCategories(),
  ])

  return (
    <main>
      {/* Editorial shop header */}
      <header className="relative overflow-hidden bg-[#111111] pt-28 pb-14 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgb(184 150 92 / 0.07) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgb(184 150 92 / 0.2), transparent)" }}
          aria-hidden="true"
        />
        <div className="grain-overlay" aria-hidden="true" />

        <div className="relative z-10 px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-6 h-px bg-[#B8965C]/50" aria-hidden="true" />
            <p className="text-[#B8965C] text-[10px] tracking-[0.4em] uppercase">Our Products</p>
          </div>
          <h1
            className="font-serif text-white font-light leading-[1.05] mb-4 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
          >
            Curated for<br />
            <em className="not-italic" style={{
              background: "linear-gradient(90deg, #CBA96E 0%, #B8965C 50%, #8C6E3A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>intentional living</em>.
          </h1>
          <p className="text-white/35 text-sm lg:text-base leading-[1.9] max-w-lg font-light">
            Luxury home fragrance, natural skincare, and curated gift services — 
            each product chosen to transform your space and elevate your rituals.
          </p>
        </div>
      </header>

      {/* Shop content */}
      <div className="container-luxury pt-8 sm:pt-12 pb-16 sm:pb-20">
        <ShopClient
          products={result.data}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          categories={categories}
        />
      </div>
    </main>
  )
}
