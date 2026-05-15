/**
 * /admin/customers — Admin customer list page
 *
 * Displays all customers in a table with search functionality and
 * customer stats (order count, total spend).
 * Requirements: 23.1, 23.3
 */

import { getAdminCustomers, type AdminCustomerFilters, type AdminCustomerSort } from "@/lib/customers"
import Link from "next/link"
import type { Metadata } from "next"
import CustomersToolbar from "./components/CustomersToolbar"

export const metadata: Metadata = {
  title: "Customers",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  newPage: number
): string {
  const qs = new URLSearchParams()
  if (params.search && typeof params.search === "string") qs.set("search", params.search)
  if (params.sort && typeof params.sort === "string") qs.set("sort", params.sort)
  qs.set("page", String(newPage))
  return `/admin/customers?${qs.toString()}`
}

const VALID_SORTS: AdminCustomerSort[] = ["newest", "oldest", "spend_desc", "orders_desc"]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const search = typeof params.search === "string" ? params.search : ""
  const rawSort = typeof params.sort === "string" ? params.sort : "newest"
  const sort: AdminCustomerSort = VALID_SORTS.includes(rawSort as AdminCustomerSort)
    ? (rawSort as AdminCustomerSort)
    : "newest"
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  const pageSize = 20

  const filters: AdminCustomerFilters = {
    search: search || undefined,
  }

  const result = await getAdminCustomers(filters, sort, { page, pageSize })
  const { data: customers, total, totalPages } = result

  const hasFilters = search || sort !== "newest"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">Customers</h1>
        <p className="text-sm text-[#8b7355] mt-1">
          {total} customer{total !== 1 ? "s" : ""}
          {hasFilters ? " matching filters" : " total"}
        </p>
      </div>

      {/* Toolbar */}
      <CustomersToolbar currentSearch={search} currentSort={sort} />

      {/* Table */}
      {customers.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8b7355]">
            {hasFilters ? "No customers match your search." : "No customers yet."}
          </p>
          {hasFilters && (
            <Link
              href="/admin/customers"
              className="inline-block mt-3 text-xs text-[#C8A96B] hover:underline"
            >
              Clear filters →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#FAF8F5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden md:table-cell">
                    Orders
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Total Spend
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-[#f5f0e8] border border-[#e5e5e5] flex items-center justify-center">
                          {customer.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={customer.image}
                              alt={customer.name ?? customer.email}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] font-medium text-[#8b7355] uppercase">
                              {(customer.name ?? customer.email).charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#111111] truncate max-w-[160px]">
                            {customer.name ?? "—"}
                          </p>
                          <p className="text-[11px] text-[#8b7355] truncate max-w-[160px] sm:hidden">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-[#111111] truncate max-w-[200px]">
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="text-[11px] text-[#8b7355] mt-0.5">{customer.phone}</p>
                      )}
                    </td>

                    {/* Order count */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-sm text-[#111111]">{customer._count.orders}</span>
                    </td>

                    {/* Total spend */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-[#111111]">
                        {formatCurrency(customer.totalSpend)}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#8b7355]">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                        aria-label={`View customer ${customer.name ?? customer.email}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#FAF8F5]">
              <p className="text-xs text-[#8b7355]">
                Page {page} of {totalPages} — {total} customers
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(params, page - 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(params, page + 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
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
