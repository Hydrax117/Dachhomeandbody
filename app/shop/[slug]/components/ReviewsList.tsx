import { StarRating } from "@/app/components/ui/StarRating"

interface Review {
  id: string
  rating: number
  title?: string | null
  comment: string
  verifiedPurchase: boolean
  createdAt: Date
  user: {
    id: string
    name?: string | null
    image?: string | null
  }
}

interface ReviewsListProps {
  reviews: Review[]
  averageRating?: number | null
  reviewCount: number
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="card-review" aria-label={`Review by ${review.user.name ?? "Anonymous"}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <StarRating rating={review.rating} size={13} />
          {review.title && (
            <h4 className="font-serif text-base font-medium mt-2">{review.title}</h4>
          )}
        </div>
        {review.verifiedPurchase && (
          <span className="badge badge-gold text-[9px] shrink-0">Verified Purchase</span>
        )}
      </div>

      <p className="text-[#4a4a4a] text-sm leading-relaxed mb-4">{review.comment}</p>

      <div className="flex items-center gap-2 text-[11px] text-[#8b7355]">
        <span className="font-medium">{review.user.name ?? "Anonymous"}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={new Date(review.createdAt).toISOString()}>{date}</time>
      </div>
    </article>
  )
}

export function ReviewsList({ reviews, averageRating, reviewCount }: ReviewsListProps) {
  return (
    <section aria-label="Customer reviews">
      <div className="divider-gold mb-5" aria-hidden="true" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-medium">
          Customer Reviews
          {reviewCount > 0 && (
            <span className="text-[#8b7355] font-sans text-sm font-normal ml-2">
              ({reviewCount})
            </span>
          )}
        </h2>

        {averageRating && reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} size={14} />
            <span className="text-sm text-[#4a4a4a]">
              {averageRating.toFixed(1)} / 5
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-[#8b7355] text-sm py-6 text-center border border-dashed border-[#e8ddd0]">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}
