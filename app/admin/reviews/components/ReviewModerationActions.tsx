"use client"

import { useState, useTransition } from "react"
import { approveReviewAction, rejectReviewAction } from "@/app/actions/reviews"

interface ReviewModerationActionsProps {
  reviewId: string
  currentStatus: string
}

export default function ReviewModerationActions({
  reviewId,
  currentStatus,
}: ReviewModerationActionsProps) {
  const [status, setStatus] = useState(currentStatus)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveReviewAction(reviewId)
      if (result.success) {
        setStatus("APPROVED")
      } else {
        setError(result.error)
      }
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectReviewAction(reviewId)
      if (result.success) {
        setStatus("REJECTED")
      } else {
        setError(result.error)
      }
    })
  }

  if (status === "APPROVED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
          approved
        </span>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="text-xs text-[#8C8C8C] hover:text-red-600 transition-colors disabled:opacity-50"
          aria-label="Reject review"
        >
          Reject
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
          rejected
        </span>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="text-xs text-[#8C8C8C] hover:text-green-700 transition-colors disabled:opacity-50"
          aria-label="Approve review"
        >
          Approve
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  // PENDING
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="text-xs px-3 py-1.5 bg-green-700 text-white rounded hover:bg-green-800 transition-colors disabled:opacity-50"
        aria-label="Approve review"
      >
        {isPending ? "…" : "Approve"}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="text-xs px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label="Reject review"
      >
        {isPending ? "…" : "Reject"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
