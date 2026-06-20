"use client"

import { useState, useTransition } from "react"
import { deactivateStaffAction, reactivateStaffAction } from "../actions"

interface StaffActionsProps {
  staffId: string
  staffName: string | null
  isActive: boolean
}

export default function StaffActions({ staffId, staffName, isActive }: StaffActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = isActive
        ? await deactivateStaffAction(staffId)
        : await reactivateStaffAction(staffId)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
          isActive
            ? "border-red-200 text-red-600 hover:bg-red-50"
            : "border-green-200 text-green-700 hover:bg-green-50"
        }`}
        aria-label={isActive ? `Deactivate ${staffName ?? "staff"}` : `Reactivate ${staffName ?? "staff"}`}
      >
        {isPending ? "…" : isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  )
}
