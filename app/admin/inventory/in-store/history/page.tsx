import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInStoreSales } from "@/lib/in-store"
import Link from "next/link"

export const metadata = {
  title: "In-Store Sales History",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

const paymentLabel: Record<string, string> = {
  CASH: "Cash",
  POS: "POS / Card",
  TRANSFER: "Transfer",
}

const paymentStyle: Record<string, string> = {
  CASH: "bg-green-50 text-green-700 border-green-200",
  POS: "bg-blue-50 text-blue-700 border-blue-200",
  TRANSFER: "bg-purple-50 text-purple-700 border-purple-200",
}

const PAGE_SIZE = 25

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function InStoreSalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    startDate?: string
    endDate?: string
    payment?: string
  }>
}) {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    redirect("/admin")
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const startDate = params.startDate ? new Date(params.startDate) : undefined
  const endDate = params.endDate ? new Date(params.endDate) : undefined
  const paymentFilter = params.payment ?? ""

  const { data: sales, total } = await getInStoreSales({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    startDate,
    endDate,
  })

  // Client-side filter by payment method (data is small per page)
  const filtered = paymentFilter
    ? sales.filter((s) => s.paymentMethod === paymentFilter)
    : sales

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = params.startDate || params.endDate || paymentFilter

  // Aggregate totals for filtered data
  const periodRevenue = filtered.reduce((sum, s) => sum + s.total, 0)
  const periodItems = filtered.reduce((sum, s) => {
    const items = s.items as Array<{ quantity: number }>
    return sum + items.reduce((q, i) => q + i.quantity, 0)
  }, 0)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const qs = new URLSearchParams()
    const merged = {
      page: String(page),
      startDate: params.startDate,
      endDate: params.endDate,
      payment: paymentFilter || undefined,
      ...overrides,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v)
    }
    return `/admin/inventory/in-store/history?${qs.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/inventory/in-store" className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors">
              ← In-Store Sales
            </Link>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Sales History
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {total} sale{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/inventory/in-store"
          className="inline-flex items-center gap-2 bg-[#111111] text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
        >
          + Record New Sale
        </Link>
      </div>

      {/* Summary cards for the current filter */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sales shown", value: String(filtered.length) },
          { label: "Items sold", value: String(periodItems) },
          { label: "Revenue", value: formatCurrency(periodRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] rounded-lg px-5 py-4">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1">{label}</p>
            <p className="font-serif text-xl font-medium text-[#111111]">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-end bg-white border border-[#e5e5e5] rounded-lg p-4">
        <div>
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
            From
          </label>
          <input
            name="startDate"
            type="date"
            defaultValue={params.startDate ?? ""}
            className="px-3 py-2 border border-[#e5e5e5] text-sm text-[#111111] rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
            To
          </label>
          <input
            name="endDate"
            type="date"
            defaultValue={params.endDate ?? ""}
            className="px-3 py-2 border border-[#e5e5e5] text-sm text-[#111111] rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] mb-1">
            Payment
          </label>
          <select
            name="payment"
            defaultValue={paymentFilter}
            className="px-3 py-2 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
          >
            <option value="">All methods</option>
            <option value="CASH">Cash</option>
            <option value="POS">POS / Card</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase rounded hover:bg-[#333] transition-colors"
        >
          Apply
        </button>
        {hasFilters && (
          <Link
            href="/admin/inventory/in-store/history"
            className="px-4 py-2 border border-[#e5e5e5] text-xs text-[#8C8C8C] rounded hover:bg-[#F8F5F2] transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Sales table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">
            {hasFilters ? "No sales match your filters." : "No sales recorded yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Sale #</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Items</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden lg:table-cell">Staff</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">Payment</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {filtered.map((sale) => {
                  const items = sale.items as Array<{
                    productName: string
                    variantName: string | null
                    quantity: number
                    subtotal: number
                  }>
                  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
                  return (
                    <tr key={sale.id} className="hover:bg-[#F8F5F2] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111111] font-mono text-xs">{sale.saleNumber}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#8C8C8C]">{formatDate(sale.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {items.slice(0, 2).map((item, i) => (
                            <p key={i} className="text-xs text-[#111111]">
                              {item.productName}{item.variantName ? ` — ${item.variantName}` : ""} × {item.quantity}
                            </p>
                          ))}
                          {items.length > 2 && (
                            <p className="text-[10px] text-[#aaa]">+{items.length - 2} more ({itemCount} total)</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-[#8C8C8C]">{sale.customerName ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {sale.staff?.name ?? sale.staff?.email ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${paymentStyle[sale.paymentMethod] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {paymentLabel[sale.paymentMethod] ?? sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#111111]">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr className="border-t-2 border-[#e5e5e5] bg-[#F8F5F2]">
                  <td colSpan={3} className="px-4 py-3 text-xs text-[#8C8C8C]">
                    {filtered.length} sale{filtered.length !== 1 ? "s" : ""} · {periodItems} items
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-right font-serif font-medium text-[#111111]">
                    {formatCurrency(periodRevenue)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs text-[#8C8C8C]">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: String(page - 1) })}
                    className="px-3 py-1.5 border border-[#e5e5e5] rounded hover:bg-[#F8F5F2] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: String(page + 1) })}
                    className="px-3 py-1.5 border border-[#e5e5e5] rounded hover:bg-[#F8F5F2] transition-colors"
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
