"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { useFormStatus } from "react-dom"
import { useState, useEffect } from "react"

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
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
    </svg>
  )
}

function WishlistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

// ---------------------------------------------------------------------------
// Logout button
// ---------------------------------------------------------------------------
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
// Nav items
// ---------------------------------------------------------------------------
const navItems = [
  { label: "Overview", href: "/account", icon: <OverviewIcon />, exact: true },
  { label: "Orders", href: "/account/orders", icon: <OrdersIcon />, exact: false },
  { label: "Wishlist", href: "/account/wishlist", icon: <WishlistIcon />, exact: false },
  { label: "Profile", href: "/account/profile", icon: <ProfileIcon />, exact: false },
]

function NavItem({ label, href, icon, exact }: { label: string; href: string; icon: React.ReactNode; exact: boolean }) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
          isActive
            ? "bg-[#0A0A0A] text-[#B8965C] font-medium"
            : "text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#111111]"
        }`}
      >
        {icon}
        {label}
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Sidebar inner content (shared between desktop and mobile drawer)
// ---------------------------------------------------------------------------
function SidebarContent({
  userName,
  onClose,
}: {
  userName?: string | null
  onClose?: () => void
}) {
  return (
    <>
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#e5e5e5] shrink-0">
        <Link
          href="/"
          className="font-serif text-sm tracking-[0.18em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors"
          onClick={onClose}
        >
          Dachhomeandbody
        </Link>
        {onClose && (
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="lg:hidden hover:text-[#B8965C] transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* User greeting */}
      {userName && (
        <div className="px-5 py-4 border-b border-[#e5e5e5]">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C]">Welcome back</p>
          <p className="text-sm font-medium text-[#111111] mt-0.5 truncate">{userName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#e5e5e5] px-3 py-4 space-y-1">
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#6b6b6b] hover:bg-[#f5f0e8] hover:text-[#111111] transition-colors"
        >
          <StoreIcon />
          Continue Shopping
        </Link>
        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export default function AccountSidebar({ userName }: { userName?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside
        className="hidden lg:flex w-56 shrink-0 bg-[#F8F5F2] border-r border-[#e5e5e5] flex-col h-full"
        aria-label="Account navigation"
      >
        <SidebarContent userName={userName} />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#F8F5F2] border-b border-[#e5e5e5] flex items-center justify-between px-4">
        <Link
          href="/"
          className="font-serif text-sm tracking-[0.18em] uppercase text-[#111111]"
        >
          Dachhomeandbody
        </Link>
        <button
          aria-label="Open account menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:text-[#B8965C] transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account navigation"
        className={`fixed top-0 left-0 h-full w-[min(280px,85vw)] bg-[#F8F5F2] z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent userName={userName} onClose={() => setMobileOpen(false)} />
      </div>
    </>
  )
}
