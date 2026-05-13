"use client"

import { useState, useTransition } from "react"

interface DeleteProductButtonProps {
  productId: string
  productName: string
  deleteAction: (id: string) => Promise<{ error?: string }>
}

export default function DeleteProductButton({
  productId,
  productName,
  deleteAction,
}: DeleteProductButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-[#8b7355]">Delete?</span>
        <button
          onClick={() => {
            setError(null)
            startTransition(async () => {
              const result = await deleteAction(productId)
              if (result.error) {
                setError(result.error)
                setConfirming(false)
              }
            })
          }}
          disabled={isPending}
          className="text-xs text-red-600 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label={`Confirm delete ${productName}`}
        >
          {isPending ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-[#8b7355] hover:text-[#111111] px-1.5 py-1 rounded hover:bg-[#f0ece4] transition-colors"
          aria-label="Cancel delete"
        >
          No
        </button>
        {error && (
          <span className="text-[11px] text-red-600 ml-1">{error}</span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#8b7355] hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
      aria-label={`Delete ${productName}`}
    >
      Delete
    </button>
  )
}
