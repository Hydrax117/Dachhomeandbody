"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FAF8F5]/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-base lg:text-lg tracking-[0.22em] uppercase font-normal transition-colors duration-300"
          style={{ color: scrolled ? "#111111" : "#ffffff" }}
        >
          Dachhomeandbody
        </Link>

        {/* Desktop nav links */}
        <ul
          className="hidden lg:flex items-center gap-10 text-[10px] tracking-[0.18em] uppercase font-medium transition-colors duration-300"
          style={{ color: scrolled ? "#111111" : "rgba(255,255,255,0.85)" }}
        >
          {["Home", "Shop", "Collections", "About", "Contact"].map((item) => (
            <li key={item}>
              <Link
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="hover:text-[#C8A96B] transition-colors duration-200"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div
          className="flex items-center gap-5 transition-colors duration-300"
          style={{ color: scrolled ? "#111111" : "rgba(255,255,255,0.85)" }}
        >
          {/* Search */}
          <button aria-label="Search" className="hidden lg:block hover:text-[#C8A96B] transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          {/* Wishlist */}
          <button aria-label="Wishlist" className="hidden lg:block hover:text-[#C8A96B] transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {/* Cart */}
          <button aria-label="Cart" className="hover:text-[#C8A96B] transition-colors relative">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
          {/* Account */}
          <Link href="/auth/login" aria-label="Account" className="hidden lg:block hover:text-[#C8A96B] transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          {/* Mobile hamburger */}
          <button
            aria-label="Menu"
            className="lg:hidden hover:text-[#C8A96B] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#FAF8F5] ${
          menuOpen ? "max-h-80 border-t border-[#e5e5e5]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-6 gap-5 text-xs tracking-[0.15em] uppercase font-medium">
          {["Home", "Shop", "Collections", "About", "Contact"].map((item) => (
            <li key={item}>
              <Link
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#8b7355] transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
          <li><Link href="/auth/login" onClick={() => setMenuOpen(false)} className="hover:text-[#8b7355] transition-colors">Account</Link></li>
        </ul>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/homepage-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      {/* Base dark overlay */}
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      {/* Stronger vignette at top so navbar area is clearly dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" aria-hidden="true" />
      {/* Warm amber glow — centred behind headline */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8A96B 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Content — padded top to clear fixed navbar */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-20">
        <p className="text-[#C8A96B] text-[10px] tracking-[0.35em] uppercase mb-8 font-medium">
          Luxury Fragrance House
        </p>
        <h1 className="font-serif text-white font-light leading-[1.08] mb-7"
          style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}>
          Crafted scents for<br />
          <em className="not-italic text-[#C8A96B]">unforgettable</em> presence.
        </h1>
        <p className="text-white/55 text-sm lg:text-base max-w-md mx-auto mb-12 leading-[1.8] font-light tracking-wide">
          Luxury fragrances designed to leave a lasting impression — on every room you enter, every memory you leave behind.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="px-9 py-4 bg-[#C8A96B] text-[#111111] text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#b8965a] transition-colors duration-300 min-w-[190px] text-center"
          >
            Shop Collection
          </Link>
          <Link
            href="/collections"
            className="px-9 py-4 border border-white/25 text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:border-white/60 hover:bg-white/5 transition-all duration-300 min-w-[190px] text-center"
          >
            Discover Signature Scents
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/60 animate-[scrollDot_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Featured Collections
// ---------------------------------------------------------------------------
const collections = [
  { name: "Oud Collection", subtitle: "Deep & Resinous", bg: "from-[#2d1f0e] to-[#1a1208]" },
  { name: "Floral Collection", subtitle: "Soft & Romantic", bg: "from-[#2a1a1a] to-[#1a1010]" },
  { name: "Night Collection", subtitle: "Dark & Mysterious", bg: "from-[#0d0d1a] to-[#080810]" },
  { name: "Home Fragrance", subtitle: "Warm & Inviting", bg: "from-[#1a1a0d] to-[#101008]" },
  { name: "Body Mists", subtitle: "Light & Fresh", bg: "from-[#0d1a1a] to-[#081010]" },
]

function FeaturedCollections() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[#8b7355] text-xs tracking-[0.3em] uppercase mb-3">Explore</p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium">Our Collections</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {collections.map((col, i) => (
          <Link
            key={col.name}
            href="/collections"
            className={`group relative overflow-hidden ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
          >
            <div
              className={`bg-gradient-to-br ${col.bg} aspect-[4/5] flex flex-col justify-end p-8 transition-transform duration-700 group-hover:scale-[1.02]`}
            >
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[#c9a96e] text-[10px] tracking-[0.25em] uppercase mb-2">{col.subtitle}</p>
                <h3 className="font-serif text-white text-xl lg:text-2xl font-medium mb-4">{col.name}</h3>
                <span className="text-white/50 text-xs tracking-[0.15em] uppercase border-b border-white/20 pb-0.5 group-hover:text-white/80 group-hover:border-white/50 transition-colors duration-300">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Best Sellers
// ---------------------------------------------------------------------------
const bestSellers = [
  { name: "Noir Absolu", desc: "Oud · Amber · Sandalwood", price: "₦28,500" },
  { name: "Rose Éternelle", desc: "Rose · Jasmine · Musk", price: "₦24,000" },
  { name: "Bois Sacré", desc: "Cedar · Vetiver · Vanilla", price: "₦31,000" },
  { name: "Lumière Dorée", desc: "Bergamot · Neroli · Amber", price: "₦22,500" },
]

function ProductCard({ name, desc, price }: { name: string; desc: string; price: string }) {
  return (
    <div className="group">
      {/* Image placeholder */}
      <div className="relative overflow-hidden bg-[#f0ece4] aspect-[3/4] mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8e0d0] to-[#d4c9b0] flex items-center justify-center">
          <div className="w-16 h-24 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/30" />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-[#1a1a1a] py-3 text-center">
          <span className="text-white text-[10px] tracking-[0.2em] uppercase">Add to Cart</span>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-base font-medium mb-1">{name}</h3>
        <p className="text-[#8b7355] text-xs tracking-wide mb-2">{desc}</p>
        <p className="text-sm font-medium">{price}</p>
      </div>
    </div>
  )
}

function BestSellers() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[#8b7355] text-xs tracking-[0.3em] uppercase mb-3">Most Loved</p>
            <h2 className="font-serif text-3xl lg:text-5xl font-medium">Best Sellers</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:block text-xs tracking-[0.15em] uppercase border-b border-[#1a1a1a] pb-0.5 hover:text-[#8b7355] hover:border-[#8b7355] transition-colors duration-200"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {bestSellers.map((p) => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Brand Story
// ---------------------------------------------------------------------------
function BrandStory() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/5] bg-gradient-to-br from-[#2d2318] to-[#1a1208] overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at 30% 60%, #c9a96e 0%, transparent 60%)" }}
            />
          </div>
          {/* Offset accent block */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#c9a96e]/10 border border-[#c9a96e]/20" aria-hidden="true" />
        </div>

        {/* Text */}
        <div className="lg:pl-8">
          <p className="text-[#8b7355] text-xs tracking-[0.3em] uppercase mb-6">Our Story</p>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium leading-[1.15] mb-8">
            Fragrance is more than scent — it is{" "}
            <em className="not-italic text-[#8b7355]">identity</em>.
          </h2>
          <p className="text-[#6b6b6b] leading-relaxed mb-6">
            At Dachhomeandbody, fragrance is more than scent — it is identity, emotion, and memory. Every bottle is crafted to inspire confidence, presence, and timeless elegance.
          </p>
          <p className="text-[#6b6b6b] leading-relaxed mb-10">
            We source the finest raw materials from around the world, working with master perfumers to create compositions that transcend the ordinary and become part of who you are.
          </p>
          <Link
            href="/about"
            className="inline-block text-xs tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-0.5 hover:text-[#8b7355] hover:border-[#8b7355] transition-colors duration-200"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Signature Fragrance Showcase
// ---------------------------------------------------------------------------
function SignatureShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-[#1a1208] text-white overflow-hidden">
      <div className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A96B] text-xs tracking-[0.3em] uppercase mb-3">Featured</p>
          <h2 className="font-serif text-white text-3xl lg:text-5xl font-medium">Signature Fragrance</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Bottle visual */}
          <div className="flex justify-center">
            <div className="relative w-48 lg:w-64">
              <div className="aspect-[1/2] bg-gradient-to-b from-[#c9a96e]/30 to-[#c9a96e]/5 border border-[#c9a96e]/20 rounded-sm flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/40" />
              </div>
              {/* Glow */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20"
                style={{ background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)" }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="font-serif text-white text-2xl lg:text-4xl font-medium mb-2">Noir Absolu</h3>
            <p className="text-[#c9a96e] text-xs tracking-[0.2em] uppercase mb-8">Eau de Parfum · 50ml</p>

            {/* Notes */}
            <div className="space-y-5 mb-10">
              {[
                { label: "Top Notes", notes: "Bergamot · Citrus · Black Pepper" },
                { label: "Heart Notes", notes: "Rose · Jasmine · Iris" },
                { label: "Base Notes", notes: "Vanilla · Musk · Oud" },
              ].map(({ label, notes }) => (
                <div key={label} className="flex gap-6 items-start">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-white/80 text-sm">{notes}</span>
                </div>
              ))}
            </div>

            {/* Mood & longevity */}
            <div className="flex gap-8 mb-10">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1">Mood</p>
                <p className="text-sm text-white/80">Confident · Mysterious</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1">Longevity</p>
                <p className="text-sm text-white/80">12+ Hours</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="font-serif text-2xl text-[#c9a96e]">₦28,500</span>
              <Link
                href="/shop"
                className="px-8 py-3 bg-[#c9a96e] text-[#1a1a1a] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#b8965a] transition-colors duration-300"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Customer Reviews
// ---------------------------------------------------------------------------
const reviews = [
  { name: "Amara O.", rating: 5, text: "Absolutely divine. Noir Absolu is the most sophisticated scent I've ever worn. I receive compliments every single time." },
  { name: "Chisom E.", rating: 5, text: "The packaging alone feels like a luxury gift. The fragrance lasts all day and into the evening. Worth every naira." },
  { name: "Tunde A.", rating: 5, text: "Rose Éternelle is everything. Feminine, warm, and completely unique. I've never smelled anything quite like it." },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < count ? "#c9a96e" : "none"} stroke="#c9a96e" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function CustomerReviews() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[#8b7355] text-xs tracking-[0.3em] uppercase mb-3">Testimonials</p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium">What Our Clients Say</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        {reviews.map((r) => (
          <div key={r.name} className="bg-white p-8 border border-[#e5e5e5]">
            <StarRating count={r.rating} />
            <p className="text-[#4a4a4a] leading-relaxed mt-5 mb-6 text-sm">&ldquo;{r.text}&rdquo;</p>
            <p className="text-xs tracking-[0.15em] uppercase font-medium text-[#1a1a1a]">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Instagram / Social Grid
// ---------------------------------------------------------------------------
function SocialGrid() {
  // Placeholder grid items with editorial gradient tones
  const tones = [
    "from-[#2d2318] to-[#1a1208]",
    "from-[#1a1a0d] to-[#101008]",
    "from-[#2a1a1a] to-[#1a1010]",
    "from-[#0d1a1a] to-[#081010]",
    "from-[#1a1208] to-[#2d2318]",
    "from-[#0d0d1a] to-[#080810]",
  ]

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#8b7355] text-xs tracking-[0.3em] uppercase mb-3">Follow Along</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-medium mb-2">@dachhomeandbody</h2>
          <p className="text-[#6b6b6b] text-sm">Join our fragrance community</p>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5">
          {tones.map((tone, i) => (
            <div
              key={i}
              className={`aspect-square bg-gradient-to-br ${tone} cursor-pointer group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <svg className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------
function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="py-24 lg:py-32 bg-[#1a1208] text-white text-center px-6">
      <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-4">Stay Connected</p>
      <h2 className="font-serif text-white text-3xl lg:text-5xl font-medium mb-4">
        Join the fragrance experience.
      </h2>
      <p className="text-white/50 text-sm lg:text-base max-w-md mx-auto mb-10">
        Be the first to discover new scents and exclusive releases.
      </p>

      {submitted ? (
        <p className="text-[#c9a96e] tracking-wide">Thank you for joining us.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            aria-label="Email address for newsletter"
            className="flex-1 bg-white/5 border border-white/20 px-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e] transition-colors"
          />
          <button
            type="submit"
            className="bg-[#c9a96e] text-[#1a1a1a] px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#b8965a] transition-colors duration-300 whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-[#0d0b08] text-white/60 py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <p className="font-serif text-white text-lg tracking-[0.15em] uppercase mb-4">Dachhomeandbody</p>
            <p className="text-sm leading-relaxed text-white/40 max-w-xs">
              Luxury fragrances crafted for those who understand the power of scent.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Shop</p>
            <ul className="space-y-3 text-sm">
              {["All Fragrances", "Collections", "Best Sellers", "New Arrivals", "Gift Sets"].map((l) => (
                <li key={l}><Link href="/shop" className="hover:text-white transition-colors duration-200">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Company</p>
            <ul className="space-y-3 text-sm">
              {["About Us", "Contact", "Careers", "Press"].map((l) => (
                <li key={l}><Link href={`/${l.toLowerCase().replace(" ", "-")}`} className="hover:text-white transition-colors duration-200">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Help</p>
            <ul className="space-y-3 text-sm">
              {["Shipping & Returns", "FAQ", "Privacy Policy", "Terms of Service"].map((l) => (
                <li key={l}><Link href="#" className="hover:text-white transition-colors duration-200">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Dachhomeandbody. All rights reserved.</p>

          {/* Social */}
          <div className="flex items-center gap-5">
            {[
              { label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 2h20v20H2z" },
              { label: "TikTok", path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
              { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
            ].map(({ label, path }) => (
              <a key={label} href="#" aria-label={label} className="hover:text-white transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Payment icons placeholder */}
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/30 uppercase">
            <span>Visa</span><span>·</span><span>Mastercard</span><span>·</span><span>Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Page composition
// ---------------------------------------------------------------------------
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <SignatureShowcase />
        <CustomerReviews />
        <SocialGrid />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
