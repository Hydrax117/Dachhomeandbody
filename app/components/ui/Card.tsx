import Image from "next/image"
import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"

// ── Base Card ──────────────────────────────────────────────
interface CardProps extends ComponentPropsWithoutRef<"div"> {
  hover?: boolean
}

export function Card({ hover = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={["card", hover ? "hover:shadow-lg" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Product Card ───────────────────────────────────────────
interface ProductCardProps {
  name: string
  subtitle?: string
  price: string
  imageSrc?: string
  imageAlt?: string
  href?: string
  badge?: string
  onAddToCart?: () => void
}

export function ProductCard({
  name,
  subtitle,
  price,
  imageSrc,
  imageAlt,
  href = "/shop",
  badge,
  onAddToCart,
}: ProductCardProps) {
  const inner = (
    <div className="card-product group">
      {/* Image */}
      <div className="card-product__image">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          /* Placeholder when no image provided */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #EBEBEB 0%, #C4C4C4 100%)",
            }}
            aria-hidden="true"
          >
            <div className="w-14 h-20 rounded-full border border-[#B8965C]/30 bg-[#B8965C]/10" />
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 badge badge-gold z-10">{badge}</span>
        )}

        {/* Quick add overlay */}
        <button
          className="card-product__quick-add"
          onClick={(e) => {
            e.preventDefault()
            onAddToCart?.()
          }}
          aria-label={`Add ${name} to cart`}
        >
          Add to Cart
        </button>
      </div>

      {/* Body */}
      <div className="card-product__body">
        <h3 className="font-serif text-base font-normal leading-snug mb-1 text-[#111111]">
          {name}
        </h3>
        {subtitle && (
          <p className="text-caption mb-2">{subtitle}</p>
        )}
        <p className="text-price text-sm">{price}</p>
      </div>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

// ── Collection Card ────────────────────────────────────────
interface CollectionCardProps {
  name: string
  subtitle?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  /** Fallback gradient when no image */
  gradient?: string
}

export function CollectionCard({
  name,
  subtitle,
  href = "/collections",
  imageSrc,
  imageAlt,
  gradient = "linear-gradient(135deg, #2d1f0e 0%, #0A0A0A 100%)",
}: CollectionCardProps) {
  return (
    <Link href={href} className="card-collection block aspect-[4/5]">
      <div className="card-collection__inner w-full h-full relative">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} aria-hidden="true" />
        )}
        <div className="card-collection__overlay" aria-hidden="true" />
      </div>

      <div className="card-collection__content">
        {subtitle && (
          <p className="text-eyebrow mb-2">{subtitle}</p>
        )}
        <h3 className="font-serif text-white text-xl font-normal mb-3">{name}</h3>
        <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase border-b border-white/20 pb-0.5 group-hover:text-white/80 group-hover:border-white/50 transition-colors duration-300">
          Explore →
        </span>
      </div>
    </Link>
  )
}

// ── Review Card ────────────────────────────────────────────
interface ReviewCardProps {
  author: string
  rating: number
  text: string
  verified?: boolean
}

export function ReviewCard({ author, rating, text, verified }: ReviewCardProps) {
  return (
    <div className="card-review">
      <div className="flex items-center gap-0.5 mb-4" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={i < rating ? "#B8965C" : "none"}
            stroke="#B8965C"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <p className="text-body text-sm mb-5">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-2">
        <p className="text-nav text-[10px] text-[#111111]">{author}</p>
        {verified && (
          <span className="badge badge-gold text-[9px] py-0.5 px-2">Verified</span>
        )}
      </div>
    </div>
  )
}
