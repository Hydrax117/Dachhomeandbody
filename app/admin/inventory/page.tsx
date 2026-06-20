import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAdminProducts } from "@/lib/products"
import Link from "next/link"
import RestockInline from "./components/RestockInline"
import {
  restockProductAction,
} from "@/app/admin/products/actions/restock"

export const metadata = {
  title: "Inventory",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
      {stock} in stock
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/admin")
  }

  const isAdmin = session.user.role === "ADMIN"
  const params = await searchParams
  const filterParam = params.filter ?? "all"
  const searchTerm = params.search ?? ""

  // Fetch all non-deleted products with variants
  const result = await getAdminProducts(
    { search: searchTerm || undefined },
    "newest",
    { pageSize: 200 }
  )

  // Apply stock filter client-side after fetch
  let products = result.data
  if (filterParam === "low") {
    products = products.filter((p) => p.stock > 0 && p.stock <= 5)
  } else if (filterParam === "out") {
    products = products.filter((p) => p.stock === 0)
  }

  const outOfStockCount = result.data.filter((p) => p.stock === 0).length
  const lowStockCount = result.data.filter((p) => p.stock > 0 && p.stock <= 5).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Inventory
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {result.total} products ·{" "}
            <span className="text-red-600">{outOfStockCount} out of stock</span> ·{" "}
            <span className="text-yellow-600">{lowStockCount} low stock</span>
          </p>
        </div>
        <Link
          href="/admin/inventory/in-store"
          className="inline-flex items-center gap-2 bg-[#111111] text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record In-Store Sale
        </Link>
        <Link
          href="/admin/inventory/in-store/history"
          className="inline-flex items-center gap-2 border border-[#e5e5e5] text-[#6b6b6b] text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded hover:bg-[#F8F5F2] transition-colors"
        >
          Sales History →
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Stock filter tabs */}
        <div className="flex border border-[#e5e5e5] rounded overflow-hidden text-xs">
          {[
            { value: "all", label: "All" },
            { value: "low", label: `Low Stock (${lowStockCount})` },
            { value: "out", label: `Out of Stock (${outOfStockCount})` },
          ].map(({ value, label }) => (
            <Link
              key={value}
              href={`/admin/inventory?filter=${value}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`}
              className={`px-3 py-2 transition-colors ${
                filterParam === value
                  ? "bg-[#111111] text-white"
                  : "text-[#6b6b6b] hover:bg-[#f5f0e8]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form className="flex-1 min-w-[200px] max-w-xs">
          <input
            name="search"
            type="search"
            defaultValue={searchTerm}
            placeholder="Search products…"
            className="w-full px-3 py-2 border border-[#e5e5e5] text-sm text-[#111111] rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
          />
          <input type="hidden" name="filter" value={filterParam} />
        </form>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">No products match your filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                    Variants
                  </th>
                  {isAdmin && (
                    <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F8F5F2] transition-colors">
                    {/* Product name */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111111]">{product.name}</p>
                      <p className="text-xs text-[#8C8C8C]">{product.category?.name}</p>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs text-[#8C8C8C]">{product.sku}</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Variants breakdown */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {product.variants && product.variants.length > 0 ? (
                        <div className="space-y-0.5">
                          {product.variants.map((v) => (
                            <div key={v.id} className="flex items-center gap-2">
                              <span className="text-xs text-[#8C8C8C]">{v.name}:</span>
                              <span className={`text-xs font-medium ${v.stock === 0 ? "text-red-600" : v.stock <= 5 ? "text-yellow-600" : "text-green-700"}`}>
                                {v.stock}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#aaa]">No variants</span>
                      )}
                    </td>

                    {/* Admin-only actions */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                            aria-label={`Edit stock for ${product.name}`}
                          >
                            Edit
                          </Link>
                          <RestockInline
                            productId={product.id}
                            productName={product.name}
                            currentStock={product.stock}
                            action={restockProductAction.bind(null, product.id)}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
