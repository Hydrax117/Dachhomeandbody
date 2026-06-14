"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { useFormStatus } from "react-dom"
import { useEffect, useState, useCallback } from "react"

// ---------------------------------------------------------------------------
// Live counts type
// ---------------------------------------------------------------------------
interface AdminCounts {
  pendingOrders: number
  newPayRequests: number
  pendingReviews: number
  lowStock: number
}

// ---------------------------------------------------------------------------
// Badge component
// ---------------------------------------------------------------------------
function Badge({ count, pulse = false }: { count: number; pulse?: boolean }) {
  if (count === 0) return null
  return (
    <span className="relative ml-auto shrink-0 flex items-center">
      {pulse && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#B8965C] opacity-75 animate-ping" />
      )}
      <span className="relative min-w-[18px] h-[18px] px-1 rounded-full bg-[#B8965C] text-[#111111] text-[9px] font-bold flex items-center justify-center leading-none">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Nav item definition
// ---------------------------------------------------------------------------
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badgeKey?: keyof AdminCounts
}

function LogoutButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#111111] transition-colors disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {pending ? "Signing out…" : "Sign Out"}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function CustomersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CouponsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function GiftBoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}

function PayRequestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ReviewsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CategoriesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function StoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ShippingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function PopupIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="5" x2="9" y2="9" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Nav groups
// ---------------------------------------------------------------------------
const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: <ProductsIcon /> },
      { label: "Categories", href: "/admin/categories", icon: <CategoriesIcon /> },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: <OrdersIcon />, badgeKey: "pendingOrders" as const },
      { label: "Gift Boxes", href: "/admin/gift-boxes", icon: <GiftBoxIcon /> },
      { label: "Pay Requests", href: "/admin/payment-requests", icon: <PayRequestIcon />, badgeKey: "newPayRequests" as const },
      { label: "Coupons", href: "/admin/coupons", icon: <CouponsIcon /> },
      { label: "Shipping Rates", href: "/admin/shipping", icon: <ShippingIcon /> },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Customers", href: "/admin/customers", icon: <CustomersIcon /> },
      { label: "Reviews", href: "/admin/reviews", icon: <ReviewsIcon />, badgeKey: "pendingReviews" as const },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Popup", href: "/admin/popup", icon: <PopupIcon /> },
      { label: "Chat", href: "/admin/chat", icon: <ChatIcon /> },
    ],
  },
]

// ---------------------------------------------------------------------------
// Sidebar nav item
// ---------------------------------------------------------------------------
function NavItem({ item, counts }: { item: NavItem; counts: AdminCounts | null }) {
  const pathname = usePathname()
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)

  const badgeCount = item.badgeKey && counts ? counts[item.badgeKey] : 0
  // Pulse animation only when not on that page (new arrivals)
  const shouldPulse = badgeCount > 0 && !isActive

  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
          isActive
            ? "bg-[#0A0A0A] text-[#B8965C] font-medium"
            : "text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#111111]"
        }`}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        {badgeCount > 0 && <Badge count={badgeCount} pulse={shouldPulse} />}
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export default function AdminSidebar() {
  const [counts, setCounts] = useState<AdminCounts | null>(null)

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/counts", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json() as AdminCounts
        setCounts(data)
      }
    } catch {
      // Silently ignore network errors — badges just won't show
    }
  }, [])

  useEffect(() => {
    // Fetch immediately on mount
    fetchCounts()
    // Then refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30_000)
    return () => clearInterval(interval)
  }, [fetchCounts])

  return (
    <aside
      className="w-60 shrink-0 bg-[#F8F5F2] border-r border-[#e5e5e5] flex flex-col h-full"
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-[#e5e5e5] shrink-0">
        <Link
          href="/admin"
          className="font-serif text-sm tracking-[0.18em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors"
        >
          Dachhomeandbody
        </Link>
        <span className="ml-2 text-[9px] tracking-[0.15em] uppercase text-[#B8965C] bg-[#B8965C]/10 px-1.5 py-0.5 rounded">
          Admin
        </span>
        {/* Total unprocessed badge on brand — visible from anywhere */}
        {counts && (counts.pendingOrders + counts.newPayRequests) > 0 && (
          <span className="ml-auto">
            <Badge count={counts.pendingOrders + counts.newPayRequests} pulse />
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#aaa] mb-2 px-3">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} counts={counts} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — store link + logout */}
      <div className="shrink-0 border-t border-[#e5e5e5] px-3 py-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#111111] transition-colors"
        >
          <StoreIcon />
          View Store
        </Link>
        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </aside>
  )
}
