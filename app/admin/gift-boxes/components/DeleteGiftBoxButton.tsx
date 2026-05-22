"use client"

import { useState, useTransition } from "react"
import { deleteGiftBoxAction } from "@/app/actions/gift-boxes"

interface DeleteGiftBoxButtonProps {
  id: string
  title: string
}

export default function DeleteGiftBoxButton({
  id,
  title,
}: DeleteGiftBoxButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteGiftBoxAction(id)
      if (!result.success) setError(result.error ?? "Failed to delete")
    })
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-[#8C8C8C] hover:text-[#B83232] transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
        aria-label={`Delete ${title}`}
      >
        {isPending ? "…" : "Delete"}
      </button>
      {error && (
        <span className="text-[11px] text-[#B83232]">{error}</span>
      )}
    </>
  )
}
