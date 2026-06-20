"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { RestockState } from "@/app/admin/products/actions/restock"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-green-700 text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Restocking…" : "Add Stock"}
    </button>
  )
}

interface RestockFormProps {
  productId: string
  variantId?: string
  currentStock: number
  action: (prev: RestockState, formData: FormData) => Promise<RestockState>
}

export default function RestockForm({ currentStock, action }: RestockFormProps) {
  const [state, formAction] = useActionState(action, {})

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-5 space-y-4">
      <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C]">
        Restock (Add Units)
      </h3>

      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        Current stock: <strong>{currentStock}</strong>
      </div>

      {state.success && (
        <div role="status" className="border border-green-300 bg-green-50 text-green-800 px-4 py-3 rounded text-sm">
          Stock restocked successfully.
        </div>
      )}
      {state.errors?._form && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded text-sm">
          {state.errors._form[0]}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="restock-qty" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
            Quantity to Add <span className="text-red-500">*</span>
          </label>
          <input
            id="restock-qty"
            name="quantity"
            type="number"
            required
            min="1"
            step="1"
            placeholder="e.g. 50"
            className={`w-full max-w-[160px] px-3 py-2.5 border text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa] ${
              state.errors?.quantity ? "border-red-400" : "border-[#e5e5e5]"
            }`}
          />
          {state.errors?.quantity && (
            <p className="mt-1 text-xs text-red-600" role="alert">{state.errors.quantity[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="restock-notes" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
            Notes (optional)
          </label>
          <input
            id="restock-notes"
            name="notes"
            type="text"
            maxLength={500}
            placeholder="e.g. New shipment from supplier"
            className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
