import Link from "next/link"
import Image from "next/image"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  stock: number
  fragranceType?: string | null
  averageRating?: number | null
  reviewCount: number
  category: { name: string; slug: string }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating.toFixed(1)} out of 5 stars, ${count} reviews`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill={i < Math.round(rating) ? "#C8A96B" : "none"}
            stroke="#C8A96B"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-[#8b7355]">({count})</span>
    </div>
  )
}

export function ProductCard({
  name,
  slug,
  price,
  compareAtPrice,
  images,
  stock,
  fragranceType,
  averageRating,
  reviewCount,
  category,
}: ProductCardProps) {
  const isOutOfStock = stock === 0
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const primaryImage = images[0]

  const fragranceTypeLabel: Record<string, string> = {
    PERFUME: "Perfume",
    EAU_DE_PARFUM: "Eau de Parfum",
    EAU_DE_TOILETTE: "Eau de Toilette",
    COLOGNE: "Cologne",
    BODY_MIST: "Body Mist",
  }

  return (
    <article className="group">
      <Link href={`/shop/${slug}`} className="block" aria-label={`View ${name}`}>
        {/* Image */}
        <div className="card-product__image relative mb-5">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#e8e0d0] to-[#d4c9b0] flex items-center justify-center">
              <div className="w-16 h-24 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30" aria-hidden="true" />
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-500" aria-hidden="true" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="badge badge-dark text-[9px]">Out of Stock</span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="badge badge-gold text-[9px]">Sale</span>
            )}
          </div>

          {/* Quick add — slides up on hover */}
          {!isOutOfStock && (
            <div className="card-product__quick-add" aria-hidden="true">
              Add to Cart
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-0.5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1">
            {fragranceType ? fragranceTypeLabel[fragranceType] ?? category.name : category.name}
          </p>
          <h3 className="font-serif text-base font-medium leading-snug mb-2 group-hover:text-[#8b7355] transition-colors duration-200">
            {name}
          </h3>

          {averageRating && reviewCount > 0 ? (
            <div className="mb-2">
              <StarRating rating={averageRating} count={reviewCount} />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span className={`font-serif text-base ${isOutOfStock ? "text-[#8b7355]" : "text-[#111111]"}`}>
              ₦{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#b8b0a8] line-through">
                ₦{compareAtPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
