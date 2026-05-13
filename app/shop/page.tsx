import type { Metadata } from "next"
import { getProducts } from "@/lib/products"
import type { ProductFilters, ProductSort } from "@/lib/products"
import { FragranceType, Gender, Longevity, Strength } from "@prisma/client"
import { ShopClient } from "./components/ShopClient"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our full collection of luxury fragrances and body care products.",
}

// ---------------------------------------------------------------------------
// Helpers — parse & validate URL search params
// ---------------------------------------------------------------------------

function parseMultiEnum<T extends string>(
  values: string[],
  valid: T[]
): T[] {
  return values.filter((v): v is T => valid.includes(v as T))
}

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

  // Helper to get multiple string values
  const multi = (key: string): string[] => {
    const v = params[key]
    if (!v) return []
    return Array.isArray(v) ? v : [v]
  }

  // Build filters
  const filters: ProductFilters = {
    search: str("q") ?? undefined,
    fragranceType: parseMultiEnum(multi("type"), Object.values(FragranceType)),
    gender: parseMultiEnum(multi("gender"), Object.values(Gender)),
    longevity: parseMultiEnum(multi("longevity"), Object.values(Longevity)),
    strength: parseMultiEnum(multi("strength"), Object.values(Strength)),
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

  const result = await getProducts(filters, sort, { page, pageSize })

  return (
    <main className="pt-24 lg:pt-28 pb-20">
      <div className="container-luxury">
        {/* Page header */}
        <header className="mb-10 lg:mb-14">
          <p className="text-eyebrow mb-3">Collection</p>
          <h1 className="font-serif text-3xl lg:text-5xl font-medium">
            All Fragrances
          </h1>
        </header>

        {/* Shop layout: sidebar + grid */}
        <ShopClient
          products={result.data}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
        />
      </div>
    </main>
  )
}
