import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { createProductAction } from "../actions"
import ProductForm from "../components/ProductForm"

export const metadata = {
  title: "New Product",
}

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-[#8C8C8C] hover:text-[#111111] transition-colors"
          aria-label="Back to products"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            New Product
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-0.5">
            Fill in the details to add a product to your catalog.
          </p>
        </div>
      </div>

      <ProductForm categories={categories} action={createProductAction} />
    </div>
  )
}
