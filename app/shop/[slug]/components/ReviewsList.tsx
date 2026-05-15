import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StarRating } from "@/app/components/ui/StarRating"
import { ReviewForm } from "./ReviewForm"

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
  productId: string
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

export async function ReviewsList({
  reviews,
  averageRating,
  reviewCount,
  productId,
}: ReviewsListProps) {
  const session = await auth()
  const userId = session?.user?.id

  // Check if the logged-in user has a delivered order for this product
  // and hasn't already reviewed it
  let canReview = false
  let hasReviewed = false
  if (userId) {
    const [deliveredOrder, existingReview] = await Promise.all([
      prisma.orderItem.findFirst({
        where: {
          productId,
          order: { userId, status: "DELIVERED" },
        },
        select: { id: true },
      }),
      prisma.review.findFirst({
        where: { productId, userId },
        select: { id: true },
      }),
    ])
    hasReviewed = existingReview !== null
    canReview = deliveredOrder !== null && !hasReviewed
  }

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
        <div className="space-y-4 mb-10">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Review submission form */}
      <div className="mt-8">
        <div className="divider mb-6" aria-hidden="true" />
        <h3 className="font-serif text-base font-medium mb-4">Write a Review</h3>

        {!userId ? (
          <p className="text-sm text-[#8b7355]">
            Please{" "}
            <a
              href="/auth/login"
              className="text-[#C8A96B] underline underline-offset-2 hover:text-[#111111] transition-colors duration-200"
            >
              sign in
            </a>{" "}
            to leave a review.
          </p>
        ) : hasReviewed ? (
          <p className="text-sm text-[#8b7355]">
            You have already reviewed this product. Thank you for your feedback!
          </p>
        ) : canReview ? (
          <ReviewForm productId={productId} />
        ) : (
          <p className="text-sm text-[#8b7355]">
            Only customers who have received this product can leave a review.
          </p>
        )}
      </div>
    </section>
  )
}
