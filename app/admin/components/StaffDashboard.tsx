"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingCounts {
  pendingOrders: number
  newPayRequests: number
  lowStock: number
}

interface StaffDashboardProps {
  staffName: string | null | undefined
  staffEmail: string | null | undefined
  initial: {
    pendingOrders: number
    newPayRequests: number
    lowStock: number
    todaySales: number
    todayRevenue: number
    todayItems: number
    recentOrders: Array<{
      id: string
      orderNumber: string
      total: number
      status: string
      createdAt: Date
      customerName: string
      customerEmail: string
    }>
  }
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

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
    <span className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${statusStyles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status.toLowerCase()}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StaffDashboard({ staffName, staffEmail, initial }: StaffDashboardProps) {
  const [counts, setCounts] = useState<PendingCounts>({
    pendingOrders: initial.pendingOrders,
    newPayRequests: initial.newPayRequests,
    lowStock: initial.lowStock,
  })
  const [flash, setFlash] = useState(false)
  const prevPending = useRef(initial.pendingOrders + initial.newPayRequests)

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/counts", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json() as { pendingOrders: number; newPayRequests: number; pendingReviews: number; lowStock: number }
      setCounts({
        pendingOrders: data.pendingOrders,
        newPayRequests: data.newPayRequests,
        lowStock: data.lowStock,
      })
      const newTotal = data.pendingOrders + data.newPayRequests
      if (newTotal > prevPending.current) {
        setFlash(true)
        setTimeout(() => setFlash(false), 2500)
      }
      prevPending.current = newTotal
    } catch {
      // keep showing previous counts
    }
  }, [])

  useEffect(() => {
    const id = setInterval(fetchCounts, 30_000)
    return () => clearInterval(id)
  }, [fetchCounts])

  const displayName = staffName ?? staffEmail ?? "Staff"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          {greeting}, {displayName.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Attention alerts */}
      {(counts.pendingOrders > 0 || counts.newPayRequests > 0 || counts.lowStock > 0) && (
        <div
          className={`border rounded p-4 transition-colors duration-700 ${
            flash ? "bg-[#B8965C]/15 border-[#B8965C]" : "bg-[#fffbf0] border-[#B8965C]/30"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C]">Needs Attention</p>
            {(counts.pendingOrders + counts.newPayRequests) > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#B8965C]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8965C] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8965C]" />
                </span>
                Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {counts.pendingOrders > 0 && (
              <Link href="/admin/orders?status=PENDING" className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors">
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold">
                  {counts.pendingOrders}
                </span>
                pending order{counts.pendingOrders !== 1 ? "s" : ""} to process
              </Link>
            )}
            {counts.newPayRequests > 0 && (
              <Link href="/admin/payment-requests?status=PAID" className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors">
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-[10px] font-bold">
                  {counts.newPayRequests}
                </span>
                new pay-for-me order{counts.newPayRequests !== 1 ? "s" : ""}
              </Link>
            )}
            {counts.lowStock > 0 && (
              <Link href="/admin/inventory?filter=low" className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors">
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-red-100 border border-red-300 text-red-800 text-[10px] font-bold">
                  {counts.lowStock}
                </span>
                low-stock product{counts.lowStock !== 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Today's in-store summary */}
      <div>
        <h2 className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C] mb-3">Today&apos;s In-Store</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Sales", value: String(initial.todaySales) },
            { label: "Items Sold", value: String(initial.todayItems) },
            { label: "Revenue", value: formatCurrency(initial.todayRevenue) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-[#e5e5e5] rounded p-5">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1">{label}</p>
              <p className="font-serif text-2xl font-medium text-[#111111]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/inventory/in-store", label: "Record Sale", desc: "Log a walk-in purchase" },
            { href: "/admin/orders", label: "Orders", desc: "View & update order status" },
            { href: "/admin/payment-requests", label: "Pay Requests", desc: "View payment link orders" },
            { href: "/admin/inventory", label: "Inventory", desc: "Check current stock levels" },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="group block bg-white border border-[#e5e5e5] p-4 rounded hover:border-[#B8965C] transition-colors"
            >
              <p className="text-sm font-medium text-[#111111] group-hover:text-[#B8965C] transition-colors mb-1">{label}</p>
              <p className="text-xs text-[#8C8C8C]">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors">
            View all →
          </Link>
        </div>
        {initial.recentOrders.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded p-8 text-center">
            <p className="text-sm text-[#8C8C8C]">No orders yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {initial.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8F5F2] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-[#111111] hover:text-[#B8965C] transition-colors">
                        #{order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-[#111111] truncate max-w-[140px]">{order.customerName}</p>
                      <p className="text-[11px] text-[#8C8C8C] truncate max-w-[140px]">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right font-medium text-[#111111]">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
