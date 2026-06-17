"use client"

import { useState } from "react"
import { FilterSidebar } from "./FilterSidebar"
import { ShopToolbar } from "./ShopToolbar"
import { ProductCard } from "./ProductCard"
import { Pagination } from "./Pagination"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  stock: number
  fragranceType?: string | null
  averageRating?: number | null
  reviewCount: number
  category: { id: string; name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

interface ShopClientProps {
  products: Product[]
  total: number
  page: number
  totalPages: number
  categories: Category[]
}

export function ShopClient({ products, total, page, totalPages, categories }: ShopClientProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="flex gap-10 lg:gap-14">
      {/* Sidebar */}
      <FilterSidebar
        categories={categories}
        mobileOpen={filterOpen}
        onMobileClose={() => setFilterOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <ShopToolbar total={total} onFilterOpen={() => setFilterOpen(true)} />

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 items-stretch"
              aria-label="Product grid"
            >
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#EBEBEB] flex items-center justify-center mb-6" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <h2 className="font-serif text-xl font-medium mb-2">No products found</h2>
      <p className="text-sm text-[#8C8C8C] max-w-xs">
        Try adjusting your filters or search term to find what you&apos;re looking for.
      </p>
    </div>
  )
}
