"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { RestockState } from "@/app/admin/products/actions/restock"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1.5 bg-green-700 text-white text-xs rounded hover:bg-green-800 transition-colors disabled:opacity-50"
    >
      {pending ? "…" : "Add"}
    </button>
  )
}

interface RestockInlineProps {
  productId: string
  productName: string
  currentStock: number
  action: (prev: RestockState, formData: FormData) => Promise<RestockState>
}

export default function RestockInline({
  productName,
  currentStock,
  action,
}: RestockInlineProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(action, {})

  // Close on success
  if (state.success && open) setOpen(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2 py-1 border border-green-200 text-green-700 rounded hover:bg-green-50 transition-colors"
        aria-label={`Restock ${productName}`}
      >
        + Restock
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-56 bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-4 space-y-3">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C]">
            Restock · current: {currentStock}
          </p>

          {state.errors?._form && (
            <p className="text-xs text-red-600" role="alert">{state.errors._form[0]}</p>
          )}

          <form action={formAction} className="space-y-2">
            <input
              name="quantity"
              type="number"
              required
              min="1"
              placeholder="Qty to add"
              className="w-full px-2.5 py-1.5 border border-[#e5e5e5] text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C]"
            />
            <input
              name="notes"
              type="text"
              placeholder="Notes (optional)"
              maxLength={200}
              className="w-full px-2.5 py-1.5 border border-[#e5e5e5] text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C]"
            />
            <div className="flex gap-2">
              <SubmitBtn />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 border border-[#e5e5e5] text-xs text-[#6b6b6b] rounded hover:bg-[#F8F5F2] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
