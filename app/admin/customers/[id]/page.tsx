/**
 * /admin/customers/[id] — Admin customer detail page
 *
 * Displays profile information, contact details, order history,
 * total spend, and order count for a specific customer.
 * Requirements: 23.2, 23.4, 23.5
 */

import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getAdminCustomerDetail } from "@/lib/customers"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Details",
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

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

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

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0ece4]">
        <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin/customers")
  }

  const { id } = await params
  const customer = await getAdminCustomerDetail(id)

  if (!customer) {
    notFound()
  }

  const initials = (customer.name ?? customer.email).charAt(0).toUpperCase()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors mb-4"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to customers
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-[#f5f0e8] border border-[#e5e5e5] flex items-center justify-center">
            {customer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customer.image}
                alt={customer.name ?? customer.email}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-[#8C8C8C]">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
              {customer.name ?? "Unnamed Customer"}
            </h1>
            <p className="text-sm text-[#8C8C8C] mt-0.5">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e5e5] rounded px-5 py-4">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
            Total Orders
          </p>
          <p className="font-serif text-2xl font-medium text-[#111111] mt-1">
            {customer._count.orders}
          </p>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded px-5 py-4">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
            Total Spend
          </p>
          <p className="font-serif text-2xl font-medium text-[#111111] mt-1">
            {formatCurrency(customer.totalSpend)}
          </p>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
            Avg. Order Value
          </p>
          <p className="font-serif text-2xl font-medium text-[#111111] mt-1">
            {customer._count.orders > 0
              ? formatCurrency(customer.totalSpend / customer._count.orders)
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile + contact */}
        <div className="space-y-6">
          {/* Profile information — Requirement 23.2 */}
          <Section title="Profile">
            <dl className="px-5 py-4 space-y-3">
              <div>
                <dt className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                  Full name
                </dt>
                <dd className="text-sm text-[#111111]">{customer.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                  Role
                </dt>
                <dd className="text-sm text-[#111111] capitalize">
                  {customer.role.toLowerCase()}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                  Member since
                </dt>
                <dd className="text-sm text-[#111111]">{formatDate(customer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                  Last updated
                </dt>
                <dd className="text-sm text-[#111111]">{formatDate(customer.updatedAt)}</dd>
              </div>
            </dl>
          </Section>

          {/* Contact information — Requirement 23.5 */}
          <Section title="Contact">
            <div className="px-5 py-4 space-y-3">
              {/* Email */}
              <div className="flex items-start gap-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8C8C8C"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                    Email
                  </p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm text-[#111111] hover:text-[#B8965C] transition-colors break-all"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8C8C8C"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div>
                  <p className="text-[10px] tracking-[0.12em] uppercase text-[#C4C4C4] font-medium mb-0.5">
                    Phone
                  </p>
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-sm text-[#111111] hover:text-[#B8965C] transition-colors"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-[#C4C4C4]">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: order history — Requirements 23.4 */}
        <div className="lg:col-span-2">
          <Section title={`Order history (${customer._count.orders})`}>
            {customer.orders.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-[#8C8C8C]">No orders yet.</p>
              </div>
            ) : (
              <ul aria-label="Customer order history">
                {customer.orders.map((order, index) => (
                  <li
                    key={order.id}
                    className={`px-5 py-4 ${
                      index < customer.orders.length - 1
                        ? "border-b border-[#f0ece4]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-[#111111] hover:text-[#B8965C] transition-colors"
                          >
                            #{order.orderNumber}
                          </Link>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-[#8C8C8C] mt-1">
                          {formatDate(order.createdAt)} ·{" "}
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                          item
                          {order.items.reduce((sum, i) => sum + i.quantity, 0) !== 1
                            ? "s"
                            : ""}
                        </p>

                        {/* Product thumbnails */}
                        {order.items.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {order.items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="w-8 h-9 rounded bg-[#f5f0e8] border border-[#e5e5e5] overflow-hidden shrink-0"
                                title={item.product.name}
                              >
                                {item.product.images[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#C4C4C4"
                                      strokeWidth="1.5"
                                      aria-hidden="true"
                                    >
                                      <rect x="3" y="3" width="18" height="18" rx="2" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <span className="text-[11px] text-[#8C8C8C]">
                                +{order.items.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-[#111111]">
                          {formatCurrency(order.total)}
                        </p>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors mt-1 inline-block"
                          aria-label={`View order ${order.orderNumber}`}
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}
