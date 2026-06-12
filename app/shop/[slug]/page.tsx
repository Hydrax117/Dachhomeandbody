import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getProduct, getProducts } from "@/lib/products"
import { ProductGallery } from "./components/ProductGallery"
import { FragranceProfile } from "./components/FragranceProfile"
import { ReviewsList } from "./components/ReviewsList"
import { AddToCartButton } from "./components/AddToCartButton"
import { VariantSelector } from "./components/VariantSelector"
import { ProductCard } from "@/app/shop/components/ProductCard"

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: "Product Not Found" }
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const fragranceTypeLabel: Record<string, string> = {
  PERFUME: "Perfume",
  EAU_DE_PARFUM: "Eau de Parfum",
  EAU_DE_TOILETTE: "Eau de Toilette",
  COLOGNE: "Cologne",
  BODY_MIST: "Body Mist",
}

const genderLabel: Record<string, string> = {
  UNISEX: "Unisex",
  MALE: "For Him",
  FEMALE: "For Her",
}

// ---------------------------------------------------------------------------
// "Best Enjoyed During" — derived from mood tags or fragrance type
// ---------------------------------------------------------------------------
function getBestEnjoyedDuring(moodTags: string[], fragranceType?: string | null): string[] {
  const moments: string[] = []
  const tags = moodTags.map((t) => t.toLowerCase())

  if (tags.some((t) => t.includes("evening") || t.includes("night") || t.includes("dark"))) {
    moments.push("Quiet evenings at home")
  }
  if (tags.some((t) => t.includes("morning") || t.includes("fresh") || t.includes("light"))) {
    moments.push("Slow mornings")
  }
  if (tags.some((t) => t.includes("romantic") || t.includes("intimate") || t.includes("sensual"))) {
    moments.push("Intimate occasions")
  }
  if (tags.some((t) => t.includes("relax") || t.includes("calm") || t.includes("spa"))) {
    moments.push("Bath and self-care rituals")
  }
  if (tags.some((t) => t.includes("work") || t.includes("focus") || t.includes("study"))) {
    moments.push("Focused work sessions")
  }
  if (fragranceType === "BODY_MIST") {
    moments.push("After a shower", "Layering with other scents")
  }

  // Defaults if nothing matched
  if (moments.length === 0) {
    moments.push("Everyday rituals", "Gifting someone you love", "Transforming your space")
  }

  return moments.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const isOutOfStock = product.stock === 0
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100
      )
    : 0

  const bestEnjoyedDuring = getBestEnjoyedDuring(product.moodTags ?? [], product.fragranceType)

  // Related products — same category, exclude current
  const relatedResult = await getProducts(
    { categoryId: product.category.id },
    "newest",
    { pageSize: 5 }
  )
  const related = relatedResult.data.filter((p) => p.slug !== slug).slice(0, 4)

  const typeLabel = product.fragranceType
    ? fragranceTypeLabel[product.fragranceType] ?? product.category.name
    : product.category.name

  return (
    <main>
      {/* ── Product hero area ── */}
      <div className="pt-20 sm:pt-24 lg:pt-28 bg-[#F8F5F2]">
        <div className="container-luxury pb-0">
          {/* Breadcrumb — scrollable on mobile */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-10 overflow-x-auto -mx-1 px-1">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-[10px] tracking-[0.12em] uppercase text-[#8C8C8C] whitespace-nowrap">
              <li>
                <Link href="/" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] inline-flex items-center">Home</Link>
              </li>
              <li aria-hidden="true" className="text-[#C4C4C4]">/</li>
              <li>
                <Link href="/shop" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] inline-flex items-center">Shop</Link>
              </li>
              <li aria-hidden="true" className="text-[#C4C4C4]">/</li>
              <li>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] inline-flex items-center"
                >
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#C4C4C4]">/</li>
              <li aria-current="page" className="text-[#111111] truncate max-w-[120px] sm:max-w-none">{product.name}</li>
            </ol>
          </nav>
        </div>

        {/* Product layout */}
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 pb-14 sm:pb-20">
            {/* Gallery — left */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product info — right */}
            <div className="flex flex-col gap-0 lg:py-4">
              {/* Category & type */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-5 h-px bg-[#B8965C]" aria-hidden="true" />
                <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">
                  {typeLabel}
                  {product.gender && ` · ${genderLabel[product.gender] ?? product.gender}`}
                </p>
              </div>

              {/* Name — dramatic serif */}
              <h1
                className="font-serif text-[#111111] font-light leading-[1.05] mb-4 sm:mb-5"
                style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              {product.averageRating && product.reviewCount > 0 && (
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={i < Math.round(product.averageRating!) ? "#B8965C" : "none"}
                        stroke="#B8965C"
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <a
                    href="#reviews"
                    className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors duration-200"
                  >
                    {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                    {product.reviewCount === 1 ? "review" : "reviews"})
                  </a>
                </div>
              )}

              {/* Sensory description — editorial mood copy */}
              <p className="text-[#4A4A4A] text-sm lg:text-base leading-[1.9] mb-8 font-light">
                {product.description}
              </p>

              {/* Scent notes preview — inline */}
              {(product.topNotes.length > 0 || product.baseNotes.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {[...product.topNotes, ...product.heartNotes, ...product.baseNotes]
                    .slice(0, 5)
                    .map((note) => (
                      <span
                        key={note}
                        className="px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase bg-[#F2EDE8] text-[#4A4A4A] border border-[#EBEBEB]"
                      >
                        {note}
                      </span>
                    ))}
                </div>
              )}

              {/* Price / Variant Selector / Add to cart */}
              {product.variants && product.variants.length > 0 ? (
                <VariantSelector
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    images: product.images,
                    basePrice: product.price,
                    baseCompareAtPrice: product.compareAtPrice ?? null,
                    baseStock: product.stock,
                  }}
                  variants={product.variants}
                />
              ) : (
                <>
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-3">
                    <span
                      className={`font-serif text-2xl lg:text-3xl font-light ${isOutOfStock ? "text-[#8C8C8C]" : "text-[#111111]"}`}
                      aria-label={`Price: ₦${product.price.toLocaleString()}`}
                    >
                      ₦{product.price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-sm text-[#C4C4C4] line-through">
                          ₦{product.compareAtPrice!.toLocaleString()}
                        </span>
                        <span className="badge badge-gold text-[9px]">−{discountPercent}%</span>
                      </>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="mb-8">
                    {isOutOfStock ? (
                      <p className="text-sm text-[#8C8C8C] flex items-center gap-2" role="status">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C] inline-block" aria-hidden="true" />
                        Out of Stock
                      </p>
                    ) : product.stock <= 5 ? (
                      <p className="text-sm text-[#B8965C] flex items-center gap-2" role="status">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8965C] inline-block" aria-hidden="true" />
                        Only {product.stock} left
                      </p>
                    ) : (
                      <p className="text-sm text-[#4A4A4A] flex items-center gap-2" role="status">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" aria-hidden="true" />
                        In Stock
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#EBEBEB] mb-8" aria-hidden="true" />

                  {/* Add to cart */}
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
                </>
              )}

              {/* Best enjoyed during */}
              {bestEnjoyedDuring.length > 0 && (
                <div className="mt-8 pt-8 border-t border-[#EBEBEB]">
                  <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-4">Best Enjoyed During</p>
                  <ul className="space-y-2.5">
                    {bestEnjoyedDuring.map((moment) => (
                      <li key={moment} className="flex items-center gap-3 text-sm text-[#4A4A4A]">
                        <span className="w-1 h-1 rounded-full bg-[#B8965C] shrink-0" aria-hidden="true" />
                        {moment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SKU */}
              <p className="text-[10px] text-[#C4C4C4] tracking-wide mt-6">
                SKU: {product.sku}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fragrance profile — dark editorial panel ── */}
      <div className="bg-[#111111] py-12 sm:py-16 lg:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgb(184 150 92 / 0.04) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="container-luxury relative z-10 max-w-3xl">
          <FragranceProfile
            topNotes={product.topNotes}
            heartNotes={product.heartNotes}
            baseNotes={product.baseNotes}
            longevity={product.longevity}
            strength={product.strength}
            moodTags={product.moodTags}
          />
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className="bg-[#FAF7F4] py-12 sm:py-16 lg:py-24">
        <div className="container-luxury max-w-3xl" id="reviews">
          <ReviewsList
            reviews={product.reviews}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
            productId={product.id}
          />
        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="bg-white py-12 sm:py-16 lg:py-24" aria-label="Related products">
          <div className="container-luxury">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-5 h-px bg-[#B8965C]" aria-hidden="true" />
                  <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase">You May Also Like</p>
                </div>
                <h2 className="font-serif text-[#111111] font-light" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
                  More from {product.category.name}
                </h2>
              </div>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="self-start sm:self-auto text-[10px] tracking-[0.25em] uppercase text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#B8965C] hover:border-[#B8965C] transition-colors duration-300 min-h-[44px] flex items-end"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  compareAtPrice={p.compareAtPrice}
                  images={p.images}
                  stock={p.stock}
                  averageRating={p.averageRating}
                  reviewCount={p.reviewCount}
                  category={p.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
