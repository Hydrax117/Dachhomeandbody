"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { logout } from "@/app/actions/auth"
import { useFormStatus } from "react-dom"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NavLink {
  label: string
  href: string
}

interface MegaMenuColumn {
  heading: string
  links: NavLink[]
}

// ---------------------------------------------------------------------------
// Mega menu data
// ---------------------------------------------------------------------------
const shopMegaMenu: MegaMenuColumn[] = [
  {
    heading: "Fragrances",
    links: [
      { label: "All Fragrances", href: "/shop" },
      { label: "Eau de Parfum", href: "/shop?type=EAU_DE_PARFUM" },
      { label: "Eau de Toilette", href: "/shop?type=EAU_DE_TOILETTE" },
      { label: "Cologne", href: "/shop?type=COLOGNE" },
      { label: "Body Mist", href: "/shop?type=BODY_MIST" },
    ],
  },
  {
    heading: "Collections",
    links: [
      { label: "Oud Collection", href: "/collections/oud" },
      { label: "Floral Collection", href: "/collections/floral" },
      { label: "Night Collection", href: "/collections/night" },
      { label: "Home Fragrance", href: "/collections/home" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Best Sellers", href: "/shop?sort=bestsellers" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Gift Sets", href: "/shop?category=gift-sets" },
      { label: "Under ₦20,000", href: "/shop?priceMax=20000" },
    ],
  },
]

const primaryLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

// ---------------------------------------------------------------------------
// Logout button (needs useFormStatus so must be a child of <form>)
// ---------------------------------------------------------------------------
function LogoutSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-left px-4 py-2.5 text-xs tracking-[0.12em] uppercase hover:text-[#C8A96B] transition-colors disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Sign Out"}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Cart icon with badge
// ---------------------------------------------------------------------------
function CartIcon({ count, color }: { count: number; color: string }) {
  return (
    <Link href="/cart" aria-label={`Cart, ${count} item${count !== 1 ? "s" : ""}`} className="relative hover:text-[#C8A96B] transition-colors" style={{ color }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#C8A96B] text-[#111111] text-[9px] font-semibold flex items-center justify-center leading-none"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Account dropdown
// ---------------------------------------------------------------------------
function AccountDropdown({ color }: { color: string }) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  if (status === "loading") {
    return (
      <div className="w-[18px] h-[18px] rounded-full bg-current opacity-20 animate-pulse" style={{ color }} />
    )
  }

  if (!session) {
    return (
      <Link
        href="/auth/login"
        aria-label="Sign in"
        className="hidden lg:block hover:text-[#C8A96B] transition-colors"
        style={{ color }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    )
  }

  const isAdmin = session.user.role === "ADMIN"

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="hover:text-[#C8A96B] transition-colors"
        style={{ color }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-52 bg-[#FAF8F5] border border-[#e5e5e5] shadow-lg py-2 z-50"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#e5e5e5]">
            <p className="text-xs font-medium truncate">{session.user.name ?? session.user.email}</p>
            {session.user.name && (
              <p className="text-[10px] text-[#8b7355] truncate mt-0.5">{session.user.email}</p>
            )}
          </div>

          {/* Links */}
          <nav aria-label="Account navigation">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs tracking-[0.12em] uppercase hover:text-[#C8A96B] transition-colors"
            >
              My Account
            </Link>
            <Link
              href="/account/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs tracking-[0.12em] uppercase hover:text-[#C8A96B] transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/account/wishlist"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs tracking-[0.12em] uppercase hover:text-[#C8A96B] transition-colors"
            >
              Wishlist
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-xs tracking-[0.12em] uppercase text-[#C8A96B] hover:text-[#b8965a] transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="border-t border-[#e5e5e5] mt-1">
            <form action={logout}>
              <LogoutSubmitButton />
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop mega menu panel
// ---------------------------------------------------------------------------
function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute left-0 right-0 top-full bg-[#FAF8F5] border-t border-[#e5e5e5] shadow-lg z-40"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-3 gap-10">
        {shopMegaMenu.map((col) => (
          <div key={col.heading}>
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#8b7355] mb-5 font-medium">
              {col.heading}
            </p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="text-sm text-[#111111] hover:text-[#C8A96B] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------
function MobileMenu({
  open,
  onClose,
  session,
}: {
  open: boolean
  onClose: () => void
  session: ReturnType<typeof useSession>["data"]
}) {
  const [shopExpanded, setShopExpanded] = useState(false)

  // Reset sub-menu when drawer closes
  useEffect(() => {
    if (!open) setShopExpanded(false)
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-[min(320px,85vw)] bg-[#FAF8F5] z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#e5e5e5] shrink-0">
          <span className="font-serif text-sm tracking-[0.18em] uppercase">Menu</span>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="hover:text-[#C8A96B] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-6">
          <ul className="px-6 space-y-1">
            {/* Home */}
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="block py-3 text-xs tracking-[0.18em] uppercase font-medium hover:text-[#C8A96B] transition-colors border-b border-[#f0ece4]"
              >
                Home
              </Link>
            </li>

            {/* Shop — expandable */}
            <li>
              <button
                aria-expanded={shopExpanded}
                onClick={() => setShopExpanded((v) => !v)}
                className="w-full flex items-center justify-between py-3 text-xs tracking-[0.18em] uppercase font-medium hover:text-[#C8A96B] transition-colors border-b border-[#f0ece4]"
              >
                <span>Shop</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${shopExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Sub-links */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  shopExpanded ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                {shopMegaMenu.map((col) => (
                  <div key={col.heading} className="pl-4 pt-3 pb-1">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-2">{col.heading}</p>
                    <ul className="space-y-2 mb-3">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className="text-sm text-[#4a4a4a] hover:text-[#C8A96B] transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>

            {/* Other primary links */}
            {primaryLinks.slice(1).map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-3 text-xs tracking-[0.18em] uppercase font-medium hover:text-[#C8A96B] transition-colors border-b border-[#f0ece4]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account section */}
          <div className="px-6 mt-6 pt-6 border-t border-[#e5e5e5]">
            {session ? (
              <>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-4">Account</p>
                <ul className="space-y-1">
                  <li>
                    <Link href="/account" onClick={onClose} className="block py-2.5 text-xs tracking-[0.15em] uppercase hover:text-[#C8A96B] transition-colors">
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/orders" onClick={onClose} className="block py-2.5 text-xs tracking-[0.15em] uppercase hover:text-[#C8A96B] transition-colors">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/wishlist" onClick={onClose} className="block py-2.5 text-xs tracking-[0.15em] uppercase hover:text-[#C8A96B] transition-colors">
                      Wishlist
                    </Link>
                  </li>
                  {session.user.role === "ADMIN" && (
                    <li>
                      <Link href="/admin" onClick={onClose} className="block py-2.5 text-xs tracking-[0.15em] uppercase text-[#C8A96B] hover:text-[#b8965a] transition-colors">
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="pt-2">
                    <form action={logout}>
                      <LogoutSubmitButton />
                    </form>
                  </li>
                </ul>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="block text-center py-3 bg-[#111111] text-white text-xs tracking-[0.2em] uppercase hover:bg-[#C8A96B] hover:text-[#111111] transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={onClose}
                  className="block text-center py-3 border border-[#e5e5e5] text-xs tracking-[0.2em] uppercase hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors duration-300"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Navbar
// ---------------------------------------------------------------------------
export default function Navbar({ transparentHero = false }: { transparentHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopHovered, setShopHovered] = useState(false)
  const { data: session } = useSession()

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // On pages without a dark hero, always use dark text regardless of scroll position
  const useDarkText = !transparentHero || scrolled
  const iconColor = useDarkText ? "#111111" : "rgba(255,255,255,0.85)"
  const textColor = useDarkText ? "#111111" : "rgba(255,255,255,0.85)"

  // Cart count — placeholder (will be wired to cart context in task 6)
  const cartCount = 0

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          useDarkText ? "bg-[#FAF8F5]/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-base lg:text-lg tracking-[0.22em] uppercase font-normal transition-colors duration-300 shrink-0"
            style={{ color: useDarkText ? "#111111" : "#ffffff" }}
            aria-label="Dachhomeandbody — Home"
          >
            Dachhomeandbody
          </Link>

          {/* Desktop nav links */}
          <ul
            className="hidden lg:flex items-center gap-10 text-[10px] tracking-[0.18em] uppercase font-medium transition-colors duration-300"
            style={{ color: textColor }}
            role="list"
          >
            {/* Home */}
            <li>
              <Link href="/" className="hover:text-[#C8A96B] transition-colors duration-200">
                Home
              </Link>
            </li>

            {/* Shop — with mega menu */}
            <li
              className="relative"
              onMouseEnter={() => setShopHovered(true)}
              onMouseLeave={() => setShopHovered(false)}
            >
              <button
                aria-haspopup="true"
                aria-expanded={shopHovered}
                className="flex items-center gap-1 hover:text-[#C8A96B] transition-colors duration-200"
                style={{ color: textColor }}
              >
                Shop
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${shopHovered ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {shopHovered && <MegaMenu onClose={() => setShopHovered(false)} />}
            </li>

            {/* Other links */}
            {primaryLinks.slice(1).map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="hover:text-[#C8A96B] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right icons */}
          <div className="flex items-center gap-5" style={{ color: iconColor }}>
            {/* Search — desktop only */}
            <button
              aria-label="Search"
              className="hidden lg:block hover:text-[#C8A96B] transition-colors"
              style={{ color: iconColor }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist — desktop only */}
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="hidden lg:block hover:text-[#C8A96B] transition-colors"
              style={{ color: iconColor }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            {/* Cart */}
            <CartIcon count={cartCount} color={iconColor} />

            {/* Account dropdown — desktop */}
            <AccountDropdown color={iconColor} />

            {/* Mobile hamburger */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="lg:hidden hover:text-[#C8A96B] transition-colors"
              style={{ color: iconColor }}
              onClick={() => setMobileOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        session={session}
      />
    </>
  )
}
