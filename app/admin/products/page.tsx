import { getAdminProducts } from "@/lib/products"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deleteProductAction } from "./actions"
import ProductsToolbar from "./components/ProductsToolbar"
import DeleteProductButton from "./components/DeleteProductButton"

export const metadata = {
  title: "Products",
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

// Stock status badge
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
        Out of Stock
      </span>
    )
  }
  if (stock <= 5) {
    return (
      <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
        Low ({stock})
      </span>
    )
  }
  return (
    <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
      In Stock ({stock})
    </span>
  )
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const categoryId = typeof params.category === "string" ? params.category : undefined
  const stockFilter = typeof params.stock === "string" ? params.stock : ""
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  const pageSize = 20

  // Build inStock filter
  const inStock = stockFilter === "in" ? true : stockFilter === "out" ? false : undefined

  const [result, categories] = await Promise.all([
    getAdminProducts(
      {
        search: search || undefined,
        categoryId,
        inStock,
      },
      "newest",
      { page, pageSize }
    ),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  const { data: products, total, totalPages } = result

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Products
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Search + filters toolbar (client component) */}
      <ProductsToolbar
        categories={categories}
        currentSearch={search}
        currentCategory={categoryId ?? ""}
        currentStock={stockFilter}
      />

      {/* Products table */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">
            {search || categoryId || stockFilter
              ? "No products match your filters."
              : "No products yet."}
          </p>
          {!search && !categoryId && !stockFilter && (
            <Link
              href="/admin/products/new"
              className="inline-block mt-4 text-xs text-[#B8965C] hover:underline"
            >
              Add your first product →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F8F5F2] transition-colors">
                    {/* Product name + SKU */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded border border-[#e5e5e5] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#f0ece4] rounded border border-[#e5e5e5] shrink-0 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#111111] truncate max-w-[180px]">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-[#8C8C8C]">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[#8C8C8C] text-xs">{product.category.name}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-medium text-[#111111]">
                        {formatCurrency(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="block text-[11px] text-[#aaa] line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Featured badge */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {product.featured && (
                        <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-[#fffbf0] text-[#B8965C] border-[#B8965C]/30">
                          Featured
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                          aria-label={`Edit ${product.name}`}
                        >
                          Edit
                        </Link>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          deleteAction={deleteProductAction}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#F8F5F2]">
              <p className="text-xs text-[#8C8C8C]">
                Page {page} of {totalPages} — {total} products
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(params, page - 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(params, page + 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function buildPageUrl(
  params: { [key: string]: string | string[] | undefined },
  newPage: number
): string {
  const qs = new URLSearchParams()
  if (params.search && typeof params.search === "string") qs.set("search", params.search)
  if (params.category && typeof params.category === "string") qs.set("category", params.category)
  if (params.stock && typeof params.stock === "string") qs.set("stock", params.stock)
  qs.set("page", String(newPage))
  return `/admin/products?${qs.toString()}`
}
