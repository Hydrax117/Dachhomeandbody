/**
 * /account — Customer dashboard overview
 *
 * Displays a welcome section and the customer's most recent orders.
 * Requirements: 5.1
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrders, getOrder } from "@/lib/orders"
import Link from "next/link"
import type { Metadata } from "next"

type OrderItem = NonNullable<Awaited<ReturnType<typeof getOrder>>>

export const metadata: Metadata = {
  title: "Overview",
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
// Quick link card
// ---------------------------------------------------------------------------
function QuickLink({
  href,
  label,
  description,
  icon,
}: {
  href: string
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 bg-white border border-[#e5e5e5] p-5 rounded hover:border-[#B8965C] transition-colors"
    >
      <span className="text-[#B8965C] mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium text-[#111111] group-hover:text-[#B8965C] transition-colors mb-0.5">
          {label}
        </p>
        <p className="text-xs text-[#8C8C8C]">{description}</p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AccountOverviewPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account")
  }

  // Fetch the 5 most recent orders for this user
  const { data: recentOrders } = await getUserOrders(session.user.id, { page: 1, pageSize: 5 })

  const firstName = session.user.name?.split(" ")[0] ?? "there"

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Hello, {firstName}
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Welcome to your account dashboard
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink
          href="/account/orders"
          label="My Orders"
          description="Track and view your order history"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
        />
        <QuickLink
          href="/account/wishlist"
          label="Wishlist"
          description="Products you've saved for later"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <QuickLink
          href="/account/profile"
          label="Profile"
          description="Manage your personal details"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-[0.12em] uppercase text-[#111111]">
            Recent Orders
          </h2>
          {recentOrders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors"
            >
              View all →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f5f0e8] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#111111] mb-1">No orders yet</p>
            <p className="text-xs text-[#8C8C8C] mb-5">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/shop"
              className="btn-primary text-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {(recentOrders as OrderItem[]).map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8F5F2] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-medium text-[#111111] hover:text-[#B8965C] transition-colors text-sm"
                      >
                        #{order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5 sm:hidden">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8C8C8C] hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#111111] text-sm">
                      {formatCurrency(order.total)}
                    </td>
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
