import { prisma } from "@/lib/prisma"
import {
  getAnalyticsSummary,
  getRevenueByDay,
  getTopProducts,
  getCustomerMetrics,
} from "@/lib/analytics"
import Link from "next/link"
import { Suspense } from "react"
import DateRangeFilter, { type DateRangePreset } from "./components/DateRangeFilter"
import RevenueChartWrapper from "./components/RevenueChartWrapper"

export const metadata = {
  title: "Dashboard",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getDateRange(range: DateRangePreset): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
  startDate.setDate(startDate.getDate() - (days - 1))

  return { startDate, endDate }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6 rounded">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs tracking-[0.18em] uppercase text-[#8b7355]">{label}</p>
        <span className="text-[#C8A96B]">{icon}</span>
      </div>
      <p className="font-serif text-3xl font-medium text-[#111111]">{value}</p>
      {sub && <p className="text-xs text-[#8b7355] mt-1">{sub}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick link card
// ---------------------------------------------------------------------------
function QuickLink({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-[#e5e5e5] p-5 rounded hover:border-[#C8A96B] transition-colors"
    >
      <p className="text-sm font-medium text-[#111111] group-hover:text-[#C8A96B] transition-colors mb-1">
        {label}
      </p>
      <p className="text-xs text-[#8b7355]">{description}</p>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
        statusStyles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.toLowerCase()}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function getAlertStats() {
  const [pendingOrders, pendingReviews, lowStockProducts] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { stock: { lte: 5 }, deleted: false } }),
  ])
  return { pendingOrders, pendingReviews, lowStockProducts }
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      guestName: true,
      guestEmail: true,
    },
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = (params.range ?? "30d") as DateRangePreset
  const validRanges: DateRangePreset[] = ["7d", "30d", "90d", "365d"]
  const safeRange: DateRangePreset = validRanges.includes(range) ? range : "30d"

  const { startDate, endDate } = getDateRange(safeRange)

  const [summary, revenueByDay, topProducts, customerMetrics, alertStats, recentOrders] =
    await Promise.all([
      getAnalyticsSummary(startDate, endDate),
      getRevenueByDay(startDate, endDate),
      getTopProducts(startDate, endDate, 8),
      getCustomerMetrics(startDate, endDate),
      getAlertStats(),
      getRecentOrders(),
    ])

  const rangeLabel =
    safeRange === "7d"
      ? "last 7 days"
      : safeRange === "30d"
      ? "last 30 days"
      : safeRange === "90d"
      ? "last 90 days"
      : "last year"

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Dashboard
          </h1>
          <p className="text-sm text-[#8b7355] mt-1">
            Analytics for the {rangeLabel}
          </p>
        </div>
        <Suspense fallback={null}>
          <DateRangeFilter current={safeRange} />
        </Suspense>
      </div>

      {/* Analytics stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          sub="From paid orders"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Orders"
          value={summary.orderCount.toLocaleString()}
          sub={`Avg ${formatCurrency(summary.averageOrderValue)}`}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatCard
          label="New Customers"
          value={summary.customerCount.toLocaleString()}
          sub="Registered in period"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Returning"
          value={`${customerMetrics.returningPercentage}%`}
          sub={`${customerMetrics.returningCustomers} returning orders`}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
          }
        />
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white border border-[#e5e5e5] rounded p-6">
        <h2 className="text-xs tracking-[0.18em] uppercase text-[#8b7355] mb-4">
          Revenue Trend
        </h2>
        <RevenueChartWrapper data={revenueByDay} />
      </div>

      {/* Top products + Customer metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white border border-[#e5e5e5] rounded p-6">
          <h2 className="text-xs tracking-[0.18em] uppercase text-[#8b7355] mb-4">
            Top Products by Sales
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[#8b7355] py-4 text-center">No sales in this period</p>
          ) : (
            <ol className="space-y-3">
              {topProducts.map((product, i) => {
                const maxQty = topProducts[0].totalQuantity
                const pct = maxQty > 0 ? (product.totalQuantity / maxQty) * 100 : 0
                return (
                  <li key={product.productId} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#aaa] w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          href={`/admin/products`}
                          className="text-sm text-[#111111] truncate hover:text-[#C8A96B] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <span className="text-xs text-[#8b7355] shrink-0 ml-2">
                          {product.totalQuantity} sold
                        </span>
                      </div>
                      <div className="h-1 bg-[#f0ece4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C8A96B] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#111111] shrink-0 w-20 text-right">
                      {formatCurrency(product.totalRevenue)}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Customer metrics */}
        <div className="bg-white border border-[#e5e5e5] rounded p-6">
          <h2 className="text-xs tracking-[0.18em] uppercase text-[#8b7355] mb-4">
            Customer Metrics
          </h2>
          <div className="space-y-4">
            {/* New vs returning donut-style display */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90" aria-hidden="true">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#f0ece4"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#C8A96B"
                    strokeWidth="3"
                    strokeDasharray={`${customerMetrics.returningPercentage} ${100 - customerMetrics.returningPercentage}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-serif font-medium text-[#111111]">
                    {customerMetrics.returningPercentage}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96B] shrink-0" />
                    <span className="text-xs text-[#8b7355]">Returning orders</span>
                  </div>
                  <p className="text-xl font-serif font-medium text-[#111111] pl-4">
                    {customerMetrics.returningCustomers.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f0ece4] border border-[#e5e5e5] shrink-0" />
                    <span className="text-xs text-[#8b7355]">New customers</span>
                  </div>
                  <p className="text-xl font-serif font-medium text-[#111111] pl-4">
                    {customerMetrics.newCustomers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attention items */}
      {(alertStats.pendingOrders > 0 || alertStats.pendingReviews > 0 || alertStats.lowStockProducts > 0) && (
        <div className="bg-[#fffbf0] border border-[#C8A96B]/30 rounded p-4">
          <p className="text-xs tracking-[0.18em] uppercase text-[#8b7355] mb-3">Needs Attention</p>
          <div className="flex flex-wrap gap-4">
            {alertStats.pendingOrders > 0 && (
              <Link href="/admin/orders?status=PENDING" className="text-sm text-[#111111] hover:text-[#C8A96B] transition-colors">
                <span className="font-medium">{alertStats.pendingOrders}</span> pending order{alertStats.pendingOrders !== 1 ? "s" : ""}
              </Link>
            )}
            {alertStats.pendingReviews > 0 && (
              <Link href="/admin/reviews" className="text-sm text-[#111111] hover:text-[#C8A96B] transition-colors">
                <span className="font-medium">{alertStats.pendingReviews}</span> review{alertStats.pendingReviews !== 1 ? "s" : ""} to moderate
              </Link>
            )}
            {alertStats.lowStockProducts > 0 && (
              <Link href="/admin/products?stock=low" className="text-sm text-[#111111] hover:text-[#C8A96B] transition-colors">
                <span className="font-medium">{alertStats.lowStockProducts}</span> low-stock product{alertStats.lowStockProducts !== 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-[0.12em] uppercase text-[#111111]">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded p-8 text-center">
            <p className="text-sm text-[#8b7355]">No orders yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#FAF8F5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {recentOrders.map((order) => {
                  const customerName = order.user?.name ?? order.guestName ?? "Guest"
                  const customerEmail = order.user?.email ?? order.guestEmail ?? ""
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-[#111111] hover:text-[#C8A96B] transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-[#8b7355] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-[#111111]">{customerName}</p>
                        <p className="text-[11px] text-[#8b7355]">{customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#111111]">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-medium tracking-[0.12em] uppercase text-[#111111] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink
            href="/admin/products/new"
            label="Add Product"
            description="Create a new product listing"
          />
          <QuickLink
            href="/admin/orders"
            label="Manage Orders"
            description="View and update order statuses"
          />
          <QuickLink
            href="/admin/reviews"
            label="Moderate Reviews"
            description="Approve or reject pending reviews"
          />
          <QuickLink
            href="/admin/coupons"
            label="Create Coupon"
            description="Set up a new discount code"
          />
        </div>
      </div>
    </div>
  )
}
