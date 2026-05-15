import { getAdminProduct } from "@/lib/products"
import { getStockHistory } from "@/lib/products"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updateProductAction, updateStockAction } from "../../actions"
import ProductForm from "../../components/ProductForm"
import StockManager from "../../components/StockManager"
import type { ProductInitialData } from "../../components/ProductForm"

export const metadata = {
  title: "Edit Product",
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, stockHistory] = await Promise.all([
    getAdminProduct(id),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getStockHistory(id),
  ])

  if (!product) notFound()

  const initialData: ProductInitialData = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    images: product.images,
    categoryId: product.category.id,
    stock: product.stock,
    sku: product.sku,
    featured: product.featured,
    fragranceType: product.fragranceType ?? null,
    topNotes: product.topNotes,
    heartNotes: product.heartNotes,
    baseNotes: product.baseNotes,
    longevity: product.longevity ?? null,
    strength: product.strength ?? null,
    moodTags: product.moodTags,
    gender: product.gender ?? null,
  }

  // Bind the product id into the actions
  const boundUpdateAction = updateProductAction.bind(null, id)
  const boundStockAction = updateStockAction.bind(null, id)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-[#8b7355] hover:text-[#111111] transition-colors"
          aria-label="Back to products"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Edit Product
          </h1>
          <p className="text-sm text-[#8b7355] mt-0.5">
            {product.name}
          </p>
        </div>
      </div>

      <ProductForm
        categories={categories}
        action={boundUpdateAction}
        initialData={initialData}
        mode="edit"
      />

      {/* Stock Management Section */}
      <div>
        <h2 className="font-serif text-xl font-medium text-[#111111] mb-4">
          Stock Management
        </h2>
        <StockManager
          productId={id}
          currentStock={product.stock}
          stockHistory={stockHistory}
          updateAction={boundStockAction}
        />
      </div>
    </div>
  )
}
