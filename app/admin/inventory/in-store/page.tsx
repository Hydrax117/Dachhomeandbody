import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInStoreSales, getTodayInStoreSummary } from "@/lib/in-store"
import { getAdminProducts } from "@/lib/products"
import InStoreSaleForm from "./components/InStoreSaleForm"
import Link from "next/link"

export const metadata = {
  title: "In-Store Sales",
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

const paymentLabel: Record<string, string> = {
  CASH: "Cash",
  POS: "POS / Card",
  TRANSFER: "Transfer",
}

export default async function InStorePage() {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    redirect("/admin")
  }

  // Fetch products for the sale form (non-deleted, with variants)
  const productsResult = await getAdminProducts({}, "newest", { pageSize: 500 })
  const products = productsResult.data.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    price: p.price,
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      stock: v.stock,
      price: v.price,
    })),
  }))

  // Fetch today's summary and recent sales in parallel
  const [summary, { data: recentSales }] = await Promise.all([
    getTodayInStoreSummary(),
    getInStoreSales({ limit: 15 }),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/inventory"
              className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors"
            >
              ← Inventory
            </Link>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            In-Store Sales
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            Record walk-in purchases — stock updates in real time
          </p>
        </div>
        <Link
          href="/admin/inventory/in-store/history"
          className="inline-flex items-center gap-2 border border-[#e5e5e5] text-[#6b6b6b] text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded hover:bg-[#F8F5F2] transition-colors"
        >
          View History →
        </Link>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sales Today", value: String(summary.saleCount) },
          { label: "Items Sold", value: String(summary.totalItems) },
          { label: "Revenue Today", value: formatCurrency(summary.totalRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] rounded-lg px-5 py-4">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1">{label}</p>
            <p className="font-serif text-xl font-medium text-[#111111]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Sale form */}
        <InStoreSaleForm products={products} />

        {/* Recent sales */}
        <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#F8F5F2]">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
              Recent Sales
            </h2>
          </div>

          {recentSales.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-[#8C8C8C]">No in-store sales recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ece4]">
              {recentSales.map((sale) => {
                const items = sale.items as Array<{
                  productName: string
                  variantName: string | null
                  quantity: number
                  price: number
                  subtotal: number
                }>
                return (
                  <div key={sale.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#111111] text-sm">
                          {sale.saleNumber}
                        </p>
                        <p className="text-xs text-[#8C8C8C] mt-0.5">
                          {formatTime(sale.createdAt)}
                          {sale.customerName && (
                            <> · {sale.customerName}</>
                          )}
                          {sale.staff && (
                            <> · {sale.staff.name ?? sale.staff.email}</>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-[#111111] text-sm">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-[10px] text-[#8C8C8C]">
                          {paymentLabel[sale.paymentMethod] ?? sale.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-0.5">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-[#8C8C8C] flex justify-between">
                          <span>
                            {item.productName}
                            {item.variantName ? ` — ${item.variantName}` : ""}
                            {" "}× {item.quantity}
                          </span>
                          <span>{formatCurrency(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
