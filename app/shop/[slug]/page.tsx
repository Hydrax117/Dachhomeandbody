import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getProduct, getProducts } from "@/lib/products"
import { ProductGallery } from "./components/ProductGallery"
import { FragranceProfile } from "./components/FragranceProfile"
import { ReviewsList } from "./components/ReviewsList"
import { AddToCartButton } from "./components/AddToCartButton"
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

  // Related products — same category, exclude current
  const relatedResult = await getProducts(
    { categoryId: product.category.id },
    "newest",
    { pageSize: 5 }
  )
  const related = relatedResult.data.filter((p) => p.slug !== slug).slice(0, 4)

  return (
    <main className="pt-24 lg:pt-28 pb-20">
      <div className="container-luxury">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 overflow-x-auto">
          <ol className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#8b7355] whitespace-nowrap min-w-0">
            <li>
              <Link href="/" className="hover:text-[#C8A96B] transition-colors duration-200">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-[#C8A96B] transition-colors duration-200">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-[#C8A96B] transition-colors duration-200"
              >
                {product.category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[#111111]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Gallery — left column */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product info — right column */}
          <div className="flex flex-col gap-6">
            {/* Category & type eyebrow */}
            <p className="text-eyebrow">
              {product.fragranceType
                ? fragranceTypeLabel[product.fragranceType] ?? product.category.name
                : product.category.name}
              {product.gender && ` · ${genderLabel[product.gender] ?? product.gender}`}
            </p>

            {/* Name */}
            <h1 className="font-serif text-3xl lg:text-4xl font-medium leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            {product.averageRating && product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={i < Math.round(product.averageRating!) ? "#C8A96B" : "none"}
                      stroke="#C8A96B"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <a
                  href="#reviews"
                  className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors duration-200"
                  aria-label={`${product.averageRating.toFixed(1)} stars, ${product.reviewCount} reviews — jump to reviews`}
                >
                  {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                  {product.reviewCount === 1 ? "review" : "reviews"})
                </a>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className={`font-serif text-2xl ${isOutOfStock ? "text-[#8b7355]" : "text-[#111111]"}`}
                aria-label={`Price: ₦${product.price.toLocaleString()}`}
              >
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-[#b8b0a8] line-through" aria-label={`Original price: ₦${product.compareAtPrice!.toLocaleString()}`}>
                    ₦{product.compareAtPrice!.toLocaleString()}
                  </span>
                  <span className="badge badge-gold text-[9px]" aria-label={`${discountPercent}% off`}>
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div>
              {isOutOfStock ? (
                <p className="text-sm text-[#8b7355] flex items-center gap-2" role="status">
                  <span className="w-2 h-2 rounded-full bg-[#8b7355] inline-block" aria-hidden="true" />
                  Out of Stock
                </p>
              ) : product.stock <= 5 ? (
                <p className="text-sm text-[#C8A96B] flex items-center gap-2" role="status">
                  <span className="w-2 h-2 rounded-full bg-[#C8A96B] inline-block" aria-hidden="true" />
                  Low Stock — Only {product.stock} left
                </p>
              ) : (
                <p className="text-sm text-[#27ae60] flex items-center gap-2" role="status">
                  <span className="w-2 h-2 rounded-full bg-[#27ae60] inline-block" aria-hidden="true" />
                  In Stock
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-body leading-relaxed">{product.description}</p>

            {/* Divider */}
            <div className="divider" aria-hidden="true" />

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

            {/* SKU */}
            <p className="text-[11px] text-[#b8b0a8] tracking-wide">
              SKU: {product.sku}
            </p>
          </div>
        </div>

        {/* Fragrance profile (Req 2.8) */}
        <div className="max-w-2xl mb-16">
          <FragranceProfile
            topNotes={product.topNotes}
            heartNotes={product.heartNotes}
            baseNotes={product.baseNotes}
            longevity={product.longevity}
            strength={product.strength}
            moodTags={product.moodTags}
          />
        </div>

        {/* Reviews (Req 6.4, 6.1) */}
        <div id="reviews" className="max-w-2xl mb-20">
          <ReviewsList
            reviews={product.reviews}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
            productId={product.id}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section aria-label="Related products">
            <div className="section-header--left mb-10">
              <p className="text-eyebrow mb-2">You May Also Like</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-medium">
                More from {product.category.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
                  fragranceType={p.fragranceType}
                  averageRating={p.averageRating}
                  reviewCount={p.reviewCount}
                  category={p.category}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
