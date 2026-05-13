"use client"

import { useActionState, useState } from "react"
import { submitReview, type ReviewFormState } from "@/app/actions/reviews"
import { Input, Label, FieldError } from "@/app/components/ui/Input"
import { Button } from "@/app/components/ui/Button"

// ---------------------------------------------------------------------------
// Star selector
// ---------------------------------------------------------------------------

interface StarSelectorProps {
  value: number
  onChange: (rating: number) => void
  error?: boolean
}

function StarSelector({ value, onChange, error }: StarSelectorProps) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label="Rating"
      aria-required="true"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={[
            "transition-transform duration-100 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B] rounded-sm",
            error ? "ring-1 ring-red-400 rounded" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={star <= active ? "#C8A96B" : "none"}
            stroke="#C8A96B"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review form
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  productId: string
}

const initialState: ReviewFormState = {}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [state, formAction, isPending] = useActionState(submitReview, initialState)

  if (state.success) {
    return (
      <div
        className="border border-[#e8ddd0] rounded p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="font-serif text-base text-[#111111] mb-1">
          Thank you for your review!
        </p>
        <p className="text-sm text-[#8b7355]">
          Your review has been submitted and is pending approval.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate aria-label="Write a review">
      {/* Hidden fields */}
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-5">
        {/* Star rating */}
        <div>
          <Label htmlFor="rating-group">Your Rating</Label>
          <div className="mt-2" id="rating-group">
            <StarSelector
              value={rating}
              onChange={setRating}
              error={!!state.errors?.rating}
            />
          </div>
          {state.errors?.rating && (
            <FieldError message={state.errors.rating[0]} />
          )}
        </div>

        {/* Title (optional) */}
        <div>
          <Label htmlFor="review-title">
            Review Title{" "}
            <span className="text-[#b8b0a8] font-normal">(optional)</span>
          </Label>
          <Input
            id="review-title"
            name="title"
            type="text"
            placeholder="Summarise your experience"
            maxLength={100}
            error={!!state.errors?.title}
            aria-describedby={state.errors?.title ? "title-error" : undefined}
            className="mt-1.5"
          />
          {state.errors?.title && (
            <FieldError id="title-error" message={state.errors.title[0]} />
          )}
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="review-comment">Your Review</Label>
          <textarea
            id="review-comment"
            name="comment"
            rows={4}
            placeholder="Share your thoughts about this product…"
            minLength={10}
            maxLength={1000}
            required
            aria-required="true"
            aria-describedby={state.errors?.comment ? "comment-error" : undefined}
            className={[
              "input mt-1.5 w-full resize-none",
              state.errors?.comment ? "input--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          {state.errors?.comment && (
            <FieldError id="comment-error" message={state.errors.comment[0]} />
          )}
        </div>

        {/* Form-level error */}
        {state.errors?._form && (
          <p className="field-error" role="alert">
            {state.errors._form[0]}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isPending || rating === 0}
          aria-disabled={isPending || rating === 0}
          className="w-full sm:w-auto"
        >
          {isPending ? "Submitting…" : "Submit Review"}
        </Button>
      </div>
    </form>
  )
}
