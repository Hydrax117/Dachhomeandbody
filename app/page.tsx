import { connection } from "next/server"
import Link from "next/link"
import Image from "next/image"
import { getBestSellers, getNewArrivals } from "@/lib/products"
import { Newsletter } from "@/app/components/Newsletter"
import { AddToCartButton } from "@/app/components/ui/AddToCartButton"

// ---------------------------------------------------------------------------
// Hero — split layout: content left, product image right
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#0A0A0A]">

      {/* ── LEFT — content panel ── */}
      <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24
                      pt-28 pb-12 lg:pt-0 lg:pb-0
                      w-full lg:w-[52%] xl:w-[48%]
                      min-h-[55vh] lg:min-h-screen">

        {/* Subtle gold radial behind text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 0% 60%, rgb(184 150 92 / 0.07) 0%, transparent 65%)" }}
          aria-hidden="true"
        />

        <div className="relative max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-7 h-px bg-[#B8965C]" aria-hidden="true" />
            <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
              Abuja&apos;s Premium Home &amp; Body Brand
            </p>
          </div>

          {/* Headline — controlled size, always fits in viewport */}
          <h1 className="font-serif text-white font-light leading-[1.08] mb-6">
            <span className="block" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)" }}>
              Luxury fragrance.
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)",
                background: "linear-gradient(90deg, #CBA96E 0%, #B8965C 50%, #9A7A48 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Natural skincare.
            </span>
            <span className="block text-white/70" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", marginTop: "0.35em" }}>
              Crafted for your space.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-white/45 text-sm lg:text-[0.9375rem] leading-[1.85] mb-8 max-w-sm font-light">
            Home fragrance, natural skincare, and curated gift boxes —
            same-day delivery across Abuja.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/shop?sort=bestsellers"
              className="inline-flex items-center justify-center px-8 py-[14px] bg-[#B8965C] text-[#0A0A0A] text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-[#CBA96E] transition-colors duration-300 min-h-[52px] min-w-[190px]"
            >
              Shop Best Sellers
            </Link>
            <Link
              href="/gift-box"
              className="inline-flex items-center justify-center px-8 py-[14px] border border-white/20 text-white/70 text-[10px] tracking-[0.28em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-h-[52px] min-w-[190px]"
            >
              Build a Gift Box
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {[
              { icon: "★", text: "5.0 · Loved in Abuja" },
              { icon: "✦", text: "100% Natural" },
              { icon: "◎", text: "Same-Day Delivery" },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-white/35 text-[10px] tracking-wide">
                <span className="text-[#B8965C] text-[9px]" aria-hidden="true">{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator — bottom of left panel */}
        <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 xl:left-24 flex items-center gap-3 hidden lg:flex">
          <div className="w-7 h-px bg-white/15 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-[#B8965C]/60 animate-scroll-dot" />
          </div>
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/25">Scroll</span>
        </div>
      </div>

      {/* ── RIGHT — product image panel ── */}
      <div className="relative w-full lg:w-[48%] xl:w-[52%] min-h-[45vh] lg:min-h-screen overflow-hidden">
        {/* Main image */}
        <Image
          src="/homepage-image.jpeg"
          alt="DACH Home & Body — luxury fragrance and skincare"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 52vw"
        />

        {/* Left-edge fade — blends into the dark left panel on desktop */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ background: "linear-gradient(to right, #0A0A0A 0%, transparent 30%)" }}
          aria-hidden="true"
        />
        {/* Top fade — blends into navbar on mobile */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: "linear-gradient(to bottom, #0A0A0A 0%, transparent 25%, transparent 75%, #0A0A0A 100%)" }}
          aria-hidden="true"
        />
        {/* Subtle overall darkening so image doesn't overpower */}
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

        {/* Floating product badge — bottom-left of image */}
        <div className="absolute bottom-8 left-6 lg:bottom-12 lg:left-10 z-10 hidden sm:block">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-5 py-3.5">
            <p className="text-[#B8965C] text-[9px] tracking-[0.3em] uppercase mb-1">Featured</p>
            <p className="text-white font-serif text-base font-light">Oud Noir Collection</p>
            <Link
              href="/shop?category=home-fragrance"
              className="text-white/40 text-[10px] tracking-[0.2em] uppercase hover:text-[#B8965C] transition-colors duration-300 mt-1 inline-block"
            >
              Explore →
            </Link>
          </div>
        </div>

        <div className="grain-overlay" aria-hidden="true" />
      </div>
    </section>
  )
}


// ---------------------------------------------------------------------------
// Trust Bar — quick conversion signals below hero
// ---------------------------------------------------------------------------
function TrustBar() {
  const items = [
    { icon: "🚚", label: "Same-Day Delivery", sub: "Abuja, FCT" },
    { icon: "✦", label: "100% Natural", sub: "Ingredients" },
    { icon: "★", label: "5-Star Rated", sub: "By our customers" },
    { icon: "◈", label: "Premium Packaging", sub: "Gift-ready always" },
  ]
  return (
    <div className="bg-[#F8F5F2] border-b border-[#EBEBEB]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#EBEBEB]">
          {items.map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-4 px-4 sm:px-6">
              <span className="text-[#B8965C] text-lg shrink-0" aria-hidden="true">{icon}</span>
              <div>
                <p className="text-[#111111] text-[11px] font-medium tracking-wide">{label}</p>
                <p className="text-[#8C8C8C] text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Brand Marquee
// ---------------------------------------------------------------------------
function BrandMarquee() {
  const items = [
    "Handcrafted Fragrance",
    "Natural Skincare",
    "Curated Gift Experiences",
    "Same-Day Delivery Abuja",
    "Artisanal Rituals",
    "Warm Interiors",
    "Sensory Luxury",
    "Premium Gift Boxes",
  ]
  const doubled = [...items, ...items]
  return (
    <div className="py-5 bg-[#111111] overflow-hidden border-y border-white/5">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-[10px] tracking-[0.3em] uppercase text-white/40 whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-[#B8965C] shrink-0" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product types
// ---------------------------------------------------------------------------
type Product = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  averageRating: number | null
  reviewCount: number
  stock: number
  featured: boolean
}

// ---------------------------------------------------------------------------
// Product Card — conversion-optimized with visible Add to Cart
// ---------------------------------------------------------------------------
function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const notes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes]
    .slice(0, 3)
    .join(" · ")
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <div className="group flex flex-col h-full">
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] bg-[#F2EDE8]">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#F2EDE8] to-[#E8E0D8] flex items-center justify-center">
            <div className="w-16 h-24 rounded-full bg-[#B8965C]/15 border border-[#B8965C]/25" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {badge && (
            <span className="bg-[#111111] text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium">
              {badge}
            </span>
          )}
          {discount && (
            <span className="bg-[#B8965C] text-[#111111] text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 font-semibold">
              -{discount}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-[#B83232] text-white text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Rating */}
        {product.averageRating && product.reviewCount > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 flex items-center gap-1.5 z-10">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#B8965C" stroke="none" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-white text-[9px] tracking-wide">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="pt-4 pb-1 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`} className="block mb-1">
          <h3 className="font-serif text-[#111111] text-base font-normal leading-snug hover:text-[#B8965C] transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        {notes && (
          <p className="text-[#8C8C8C] text-[11px] tracking-wide mb-2 leading-relaxed line-clamp-2">{notes}</p>
        )}
        <div className="mt-auto pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="font-serif text-[#111111] text-base">₦{product.price.toLocaleString()}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-[#8C8C8C] text-sm line-through">₦{product.compareAtPrice.toLocaleString()}</p>
            )}
          </div>
          {/* Always-visible Add to Cart */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Best Sellers — high priority, right after hero
// ---------------------------------------------------------------------------
function BestSellers({ products }: { products: Product[] }) {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#FAF7F4]">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">Most Loved</p>
            </div>
            <h2 className="font-serif text-[#111111] font-light leading-[1.1]" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
              Best Sellers
            </h2>
            <p className="text-[#8C8C8C] text-sm mt-2">The ones our customers keep coming back for.</p>
          </div>
          <Link
            href="/shop?sort=bestsellers"
            className="self-start lg:self-auto inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-300 min-h-[44px] items-end"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} badge={i < 2 ? "Best Seller" : undefined} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#B8965C] text-sm tracking-wide">New arrivals coming soon.</p>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center lg:hidden">
          <Link
            href="/shop?sort=bestsellers"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#111111] text-white text-[10px] tracking-[0.3em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 min-h-[52px]"
          >
            Shop All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Gift Box — primary revenue driver, high visibility
// ---------------------------------------------------------------------------
function GiftBoxSection() {
  return (
    <section className="relative overflow-hidden bg-[#111111] py-16 sm:py-20 lg:py-28">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 60% 50%, rgb(184 150 92 / 0.08) 0%, transparent 60%)" }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.4em] uppercase">Gift Experiences</p>
            </div>
            <h2 className="font-serif text-white font-light leading-[1.1] mb-5" style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}>
              Build Your<br />
              <em className="not-italic text-[#B8965C]">Gift Box</em>
            </h2>
            <p className="text-white/50 text-sm lg:text-base leading-[1.9] mb-8 max-w-md">
              Curate premium gifts for any occasion in minutes. Choose the scents, the textures, 
              the mood — we wrap it with care and deliver same day across Abuja.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                { icon: "✦", title: "Curated Selection", desc: "Hand-picked for every taste" },
                { icon: "◈", title: "Personal Touch", desc: "Custom note + premium wrap" },
                { icon: "◎", title: "Same Day", desc: "Delivery across Abuja" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-[#B8965C] text-base shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="text-white text-[11px] tracking-[0.12em] uppercase font-medium mb-0.5">{title}</p>
                    <p className="text-white/35 text-[11px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/gift-box"
              className="inline-flex items-center justify-center gap-4 px-10 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-[#CBA96E] transition-all duration-300 min-h-[52px]"
            >
              Build Your Gift Box
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 border border-[#B8965C]/20 rotate-6" aria-hidden="true" />
              <div className="absolute inset-4 border border-[#B8965C]/10 -rotate-3" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="0.8" aria-hidden="true">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgb(184 150 92 / 0.12) 0%, transparent 70%)" }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Collections Grid — buyable, clear CTAs
// ---------------------------------------------------------------------------
const categoryImages: Record<string, string> = {
  oud: "/oud-image.png",
  floral: "/floral-image.png",
  night: "/night-image.png",
  "body-mist": "/body-mist-image.png",
  "body-mists": "/body-mist-image.png",
}

const categoryGradients = [
  "from-[#2d1f0e] to-[#0d0905]",
  "from-[#1a1010] to-[#0d0808]",
  "from-[#0d0d1a] to-[#060610]",
  "from-[#1a1a0d] to-[#0d0d06]",
  "from-[#0d1a1a] to-[#060d0d]",
  "from-[#1a0d1a] to-[#0d060d]",
]

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

function CollectionsGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F8F5F2]">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">Collections</p>
            </div>
            <h2 className="font-serif text-[#111111] font-light leading-[1.1]" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
              Shop by Collection
            </h2>
          </div>
          <Link
            href="/shop"
            className="self-start lg:self-auto inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-300 min-h-[44px] items-end"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((cat, i) => (
            <Link
              key={cat.id}
              href={`/shop?categoryId=${cat.id}`}
              className="group relative overflow-hidden aspect-square"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`} />
              {categoryImages[cat.slug] && (
                <Image
                  src={categoryImages[cat.slug]}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="font-serif text-white font-light text-base sm:text-lg leading-snug mb-1">
                  {cat.name}
                </h3>
                <span className="text-[#B8965C] text-[10px] tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-300">
                  Shop {cat._count.products} products →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// New Arrivals
// ---------------------------------------------------------------------------
function NewArrivals({ products }: { products: Product[] }) {
  if (products.length === 0) return null
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-white">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">Just Dropped</p>
            </div>
            <h2 className="font-serif text-[#111111] font-light leading-[1.1]" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="self-start lg:self-auto inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-300 min-h-[44px] items-end"
          >
            View All New
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} badge="New" />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Social Proof — reviews
// ---------------------------------------------------------------------------
const staticReviews = [
  {
    name: "Amara O.",
    location: "Abuja, FCT",
    rating: 5,
    text: "The home fragrance collection is absolutely divine. My living room has never smelled this good — I receive compliments every time someone visits.",
  },
  {
    name: "Chisom E.",
    location: "Lagos",
    rating: 5,
    text: "I ordered a gift set for my mum and she was blown away. The packaging feels so luxurious and the skincare products are genuinely amazing. Worth every naira.",
  },
  {
    name: "Tunde A.",
    location: "Abuja, FCT",
    rating: 5,
    text: "DACH Home & Body is my go-to for gifts now. Everything feels personal and thoughtful. The delivery to Abuja was same day — couldn't ask for more.",
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < count ? "#B8965C" : "none"} stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function SocialProof() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#FAF7F4]">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
            <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">Customer Reviews</p>
            <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-[#111111] font-light" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
            Loved by customers in Nigeria
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#B8965C" stroke="none" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[#4A4A4A] text-sm">5.0 average rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {staticReviews.map((r) => (
            <div key={r.name} className="bg-white p-6 sm:p-8 border border-[#EBEBEB] hover:border-[#B8965C]/30 transition-colors duration-500">
              <StarRating count={r.rating} />
              <p className="text-[#4A4A4A] leading-[1.9] mt-4 mb-6 text-sm">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#EBEBEB]">
                <div className="w-8 h-8 rounded-full bg-[#B8965C]/15 flex items-center justify-center shrink-0">
                  <span className="text-[#B8965C] text-xs font-medium">{r.name[0]}</span>
                </div>
                <div>
                  <p className="text-[#111111] text-xs tracking-[0.12em] uppercase font-medium">{r.name}</p>
                  <p className="text-[#8C8C8C] text-[10px] tracking-wide mt-0.5">{r.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#111111] text-white text-[10px] tracking-[0.3em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 min-h-[52px]"
          >
            Shop Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Brand Story — condensed, conversion-focused
// ---------------------------------------------------------------------------
function BrandTrust() {
  return (
    <section className="py-14 sm:py-20 bg-[#F8F5F2]">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative min-h-[300px] sm:min-h-[400px] overflow-hidden">
            <Image
              src="/homepage-image.jpeg"
              alt="DACH Home & Body — crafted with intention"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">Why DACH</p>
            </div>
            <h2 className="font-serif text-[#111111] font-light leading-[1.1] mb-5" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
              Premium quality.<br />
              <em className="not-italic text-[#B8965C]">Personal service</em>.
            </h2>
            <p className="text-[#4A4A4A] leading-[1.9] mb-6 text-sm lg:text-base">
              Based in Abuja, DACH Home &amp; Body curates luxury home fragrances, natural skincare, 
              and bespoke gift experiences. Every product is chosen to make you feel something — 
              personal, elegant, and memorable.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-[#EBEBEB]">
              {[
                { value: "100%", label: "Natural Ingredients" },
                { value: "ABJ", label: "Same Day Delivery" },
                { value: "5★", label: "Customer Rating" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-serif text-[#111111] text-xl sm:text-2xl font-light mb-1">{value}</p>
                  <p className="text-[#8C8C8C] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#111111] text-white text-[10px] tracking-[0.3em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 min-h-[52px]"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#EBEBEB] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-h-[52px]"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white/50 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgb(184 150 92 / 0.3), transparent)" }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 pb-12 border-b border-white/5">
          <div className="lg:col-span-4">
            <p className="font-serif text-white text-lg sm:text-xl tracking-[0.12em] mb-2">DACH Home &amp; Body</p>
            <div className="w-8 h-px bg-[#B8965C] mb-5" aria-hidden="true" />
            <p className="text-sm leading-[1.9] text-white/35 max-w-xs mb-6">
              Luxury home fragrance, natural skincare, and curated gift services. 
              Crafted for intentional living. Based in Abuja, FCT.
            </p>
            <div className="space-y-2.5 text-xs text-white/30">
              <p><a href="tel:07064313141" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center">07064313141</a></p>
              <p><a href="mailto:adachadzarma@gmail.com" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center">adachadzarma@gmail.com</a></p>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Shop</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Best Sellers", href: "/shop?sort=bestsellers" },
                  { label: "New Arrivals", href: "/shop?sort=newest" },
                  { label: "Home Fragrance", href: "/shop?category=home-fragrance" },
                  { label: "Natural Skincare", href: "/shop?category=natural-skincare" },
                  { label: "Gift Boxes", href: "/gift-box" },
                ].map((l) => (
                  <li key={l.label}><Link href={l.href} className="hover:text-white transition-colors duration-200 leading-relaxed">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Company</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                ].map((l) => (
                  <li key={l.label}><Link href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Help</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Shipping & Returns", href: "#" },
                  { label: "FAQ", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ].map((l) => (
                  <li key={l.label}><Link href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Delivery</p>
              <div className="space-y-4 text-xs text-white/30 leading-relaxed">
                <div>
                  <p className="text-white/50 mb-1">Abuja, FCT</p>
                  <p>Same day delivery</p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Nationwide</p>
                  <p>3–5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-[10px] text-white/20 tracking-wide text-center sm:text-left">
            © {new Date().getFullYear()} DACH Home &amp; Body. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Instagram", href: "https://instagram.com/dachhomeandbody", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 2h20v20H2z" },
              { label: "TikTok", href: "#", path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
            ].map(({ label, href, path }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#B8965C] transition-colors duration-200 w-10 h-10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/20 uppercase">
            <span>Visa</span><span className="text-white/10">·</span>
            <span>Mastercard</span><span className="text-white/10">·</span>
            <span>Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Page — server component, optimized section order for conversion
// ---------------------------------------------------------------------------
export default async function HomePage() {
  await connection()

  const [bestSellers, newArrivals] = await Promise.all([
    getBestSellers(8),
    getNewArrivals(4),
  ])

  return (
    <>
      <main>
        {/* 1. Hero — immediate selling, strong CTAs */}
        <Hero />
        {/* 2. Trust bar — quick conversion signals */}
        <TrustBar />
        {/* 3. Brand marquee */}
        <BrandMarquee />
        {/* 4. Best Sellers — highest conversion products first */}
        <BestSellers products={bestSellers} />
        {/* 5. New Arrivals */}
        <NewArrivals products={newArrivals} />
        {/* 6. Gift Box — primary revenue driver */}
        <GiftBoxSection />
        {/* 7. Social Proof — reviews + CTA */}
        <SocialProof />
        {/* 9. Brand Trust — condensed story + stats */}
        <BrandTrust />
        {/* 10. Newsletter */}
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
