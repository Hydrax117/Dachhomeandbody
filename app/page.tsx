import { connection } from "next/server"
import Link from "next/link"
import Image from "next/image"
import { getFeaturedProducts, getBestSellers } from "@/lib/products"
import { getCategories } from "@/lib/categories"
import { Newsletter } from "@/app/components/Newsletter"

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <Image
        src="/homepage-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B8965C 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-20">
        <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase mb-8 font-medium">
          Luxury Home Fragrance &amp; Natural Skincare
        </p>
        <h1
          className="font-serif text-white font-light leading-[1.08] mb-7"
          style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
        >
          Personal, elegant,<br />
          <em className="not-italic text-[#B8965C]">memorable</em>.
        </h1>
        <p className="text-white/55 text-sm lg:text-base max-w-md mx-auto mb-12 leading-[1.8] font-light tracking-wide">
          Luxury home fragrance, natural skincare, and curated gift services — crafted for the wellness lifestyle in Abuja and beyond.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="px-9 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#A07840] transition-colors duration-300 min-w-[190px] text-center"
          >
            Shop Collection
          </Link>
          <Link
            href="/gift-box"
            className="px-9 py-4 border border-white/25 text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-w-[190px] text-center"
          >
            Build a Gift Box
          </Link>
        </div>
      </div>

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
// Featured Collections — real categories from DB
// ---------------------------------------------------------------------------
// Map category slugs to local images; fallback gradient for unmatched ones
const categoryImages: Record<string, string> = {
  oud: "/oud-image.png",
  floral: "/floral-image.png",
  night: "/night-image.png",
  "body-mist": "/body-mist-image.png",
  "body-mists": "/body-mist-image.png",
}

const categoryGradients = [
  "from-[#2d1f0e] to-[#1a1208]",
  "from-[#2a1a1a] to-[#1a1010]",
  "from-[#0d0d1a] to-[#080810]",
  "from-[#1a1a0d] to-[#101008]",
  "from-[#0d1a1a] to-[#081010]",
  "from-[#1a0d1a] to-[#100810]",
]

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

function FeaturedCollections({ categories }: { categories: Category[] }) {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-3">Explore</p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium">Our Collections</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {categories.map((cat, i) => {
          const image = categoryImages[cat.slug]
          return (
            <Link
              key={cat.id}
              href={`/shop?categoryId=${cat.id}`}
              className={`group relative overflow-hidden ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className={`relative aspect-[4/5] flex flex-col justify-end bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                {image && (
                  <Image
                    src={image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                {/* Dark overlay so text stays readable over the photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
                <div className="relative z-10 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-[#B8965C] text-[10px] tracking-[0.25em] uppercase mb-2">
                    {cat._count.products} {cat._count.products === 1 ? "product" : "products"}
                  </p>
                  <h3 className="font-serif text-white text-xl lg:text-2xl font-medium mb-4">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-white/50 text-xs mb-3 line-clamp-2">{cat.description}</p>
                  )}
                  <span className="text-white/50 text-xs tracking-[0.15em] uppercase border-b border-white/20 pb-0.5 group-hover:text-white/80 group-hover:border-white/50 transition-colors duration-300">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Best Sellers — real products from DB
// ---------------------------------------------------------------------------
type Product = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  averageRating: number | null
  reviewCount: number
}

function ProductCard({ product }: { product: Product }) {
  const notes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes]
    .slice(0, 3)
    .join(" · ")

  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="relative overflow-hidden bg-[#EBEBEB] aspect-[3/4] mb-5">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#EBEBEB] to-[#C4C4C4] flex items-center justify-center">
            <div className="w-16 h-24 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-[#111111] py-3 text-center">
          <span className="text-white text-[10px] tracking-[0.2em] uppercase">View Product</span>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-base font-medium mb-1">{product.name}</h3>
        {notes && <p className="text-[#8C8C8C] text-xs tracking-wide mb-2">{notes}</p>}
        <p className="text-sm font-medium">₦{product.price.toLocaleString()}</p>
      </div>
    </Link>
  )
}

function BestSellers({ products }: { products: Product[] }) {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-3">Most Loved</p>
            <h2 className="font-serif text-3xl lg:text-5xl font-medium">Best Sellers</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:block text-xs tracking-[0.15em] uppercase border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-200"
          >
            View All
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-[#B8965C] text-sm text-center py-12">No products available yet.</p>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Featured Products (replaces static "Featured" section)
// ---------------------------------------------------------------------------
function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-3">Curated</p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium">Featured</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
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
        <div className="relative">
          <div className="aspect-[4/5] bg-gradient-to-br from-[#2d2318] to-[#1a1208] overflow-hidden relative">
            <Image
              src="/story-image.png"
              alt="Our story — the art of fragrance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#B8965C]/10 border border-[#B8965C]/20" aria-hidden="true" />
        </div>

        <div className="lg:pl-8">
          <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-6">Our Story</p>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium leading-[1.15] mb-8">
            Scent is more than fragrance — it is{" "}
            <em className="not-italic text-[#B8965C]">feeling</em>.
          </h2>
          <p className="text-[#8C8C8C] leading-relaxed mb-6">
            DACH Home &amp; Body was born from a love of luxury, wellness, and the art of gifting. Based in Abuja, we curate home fragrances, natural skincare, and bespoke gift services for those who appreciate the finer details.
          </p>
          <p className="text-[#8C8C8C] leading-relaxed mb-10">
            Every product is chosen to make you feel something — personal, elegant, and memorable. Whether it is a scent that transforms your space or a gift that says exactly the right thing, we are here for the moments that matter.
          </p>
          <Link
            href="/about"
            className="inline-block text-xs tracking-[0.2em] uppercase border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-200"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Customer Reviews
// ---------------------------------------------------------------------------
const reviews = [
  { name: "Amara O.", rating: 5, text: "The home fragrance collection is absolutely divine. My living room has never smelled this good — I receive compliments every time someone visits." },
  { name: "Chisom E.", rating: 5, text: "I ordered a gift set for my mum and she was blown away. The packaging feels so luxurious and the skincare products are genuinely amazing. Worth every naira." },
  { name: "Tunde A.", rating: 5, text: "DACH Home & Body is my go-to for gifts now. Everything feels personal and thoughtful. The delivery to Abuja was same day — couldn't ask for more." },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < count ? "#B8965C" : "none"} stroke="#B8965C" strokeWidth="1.5">
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
        <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-3">Testimonials</p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium">What Our Clients Say</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        {reviews.map((r) => (
          <div key={r.name} className="bg-white p-8 border border-[#EBEBEB]">
            <StarRating count={r.rating} />
            <p className="text-[#4A4A4A] leading-relaxed mt-5 mb-6 text-sm">&ldquo;{r.text}&rdquo;</p>
            <p className="text-xs tracking-[0.15em] uppercase font-medium text-[#111111]">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Social Grid
// ---------------------------------------------------------------------------
function SocialGrid() {
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
          <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-3">Follow Along</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-medium mb-2">@dachhomeandbody</h2>
          <p className="text-[#8C8C8C] text-sm">Join our luxury &amp; wellness community</p>
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
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-[#111111] text-white/60 py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <p className="font-serif text-white text-lg tracking-[0.15em] uppercase mb-4">DACH Home &amp; Body</p>
            <p className="text-sm leading-relaxed text-white/40 max-w-xs mb-4">
              Luxury home fragrance, natural skincare, and curated gift services. Based in Abuja, FCT.
            </p>
            <div className="space-y-2 text-xs text-white/40">
              <p>
                <a href="tel:07064313141" className="hover:text-white/70 transition-colors duration-200">
                  07064313141
                </a>
              </p>
              <p>
                <a href="mailto:adachadzarma@gmail.com" className="hover:text-white/70 transition-colors duration-200">
                  adachadzarma@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Shop</p>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home Fragrance", href: "/shop?category=home-fragrance" },
                { label: "Natural Skincare", href: "/shop?category=natural-skincare" },
                { label: "Gift Services", href: "/shop?category=gift-sets" },
                { label: "Best Sellers", href: "/shop?sort=bestsellers" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
              ].map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Company</p>
            <ul className="space-y-3 text-sm">
              {["About Us", "Contact", "Careers", "Press"].map((l) => (
                <li key={l}><Link href={`/${l.toLowerCase().replace(" ", "-")}`} className="hover:text-white transition-colors duration-200">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-5">Help</p>
            <ul className="space-y-3 text-sm">
              {["Shipping & Returns", "FAQ", "Privacy Policy", "Terms of Service"].map((l) => (
                <li key={l}><Link href="#" className="hover:text-white transition-colors duration-200">{l}</Link></li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white text-[10px] tracking-[0.25em] uppercase mb-3">Delivery</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Abuja: Same day<br />
                <span className="text-white/25">(except custom orders)</span><br />
                Nationwide: 3–5 business days
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} DACH Home &amp; Body. All rights reserved.</p>

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

          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/30 uppercase">
            <span>Visa</span><span>·</span><span>Mastercard</span><span>·</span><span>Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Page — server component, fetches real data
// ---------------------------------------------------------------------------
export default async function HomePage() {
  await connection()

  const [categories, bestSellers, featuredProducts] = await Promise.all([
    getCategories(),
    getBestSellers(4),
    getFeaturedProducts(4),
  ])

  return (
    <>
      <main>
        <Hero />
        <FeaturedCollections categories={categories} />
        <BestSellers products={bestSellers} />
        <FeaturedProducts products={featuredProducts} />
        <BrandStory />
        <CustomerReviews />
        <SocialGrid />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
