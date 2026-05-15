"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { UpdateStockState } from "../actions"

// ── Types ──────────────────────────────────────────────────────────────────

interface StockHistoryEntry {
  id: string
  previousStock: number
  newStock: number
  change: number
  reason: string
  notes: string | null
  createdAt: Date
  user: { id: string; name: string | null; email: string } | null
}

interface StockManagerProps {
  productId: string
  currentStock: number
  stockHistory: StockHistoryEntry[]
  updateAction: (prev: UpdateStockState, formData: FormData) => Promise<UpdateStockState>
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) {
    return <span className="text-[#8b7355] text-xs">±0</span>
  }
  if (change > 0) {
    return (
      <span className="text-green-700 text-xs font-medium">+{change}</span>
    )
  }
  return (
    <span className="text-red-600 text-xs font-medium">{change}</span>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
        Out of Stock
      </span>
    )
  }
  if (stock <= 5) {
    return (
      <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
        Low Stock
      </span>
    )
  }
  return (
    <span className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
      In Stock
    </span>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Updating…" : "Update Stock"}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StockManager({
  productId: _productId,
  currentStock,
  stockHistory,
  updateAction,
}: StockManagerProps) {
  const [state, formAction] = useActionState(updateAction, {})

  return (
    <div className="space-y-6">
      {/* Current stock summary */}
      <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] border border-[#e5e5e5] rounded-lg">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1">
            Current Stock
          </p>
          <p className="text-3xl font-serif font-medium text-[#111111]">
            {currentStock}
          </p>
        </div>
        <div className="ml-2">
          <StockBadge stock={currentStock} />
        </div>
      </div>

      {/* Adjustment form */}
      <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
        <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-4">
          Adjust Stock
        </h3>

        {state.success && (
          <div
            role="status"
            className="mb-4 border border-green-300 bg-green-50 text-green-800 px-4 py-3 rounded text-sm"
          >
            Stock updated successfully.
          </div>
        )}

        {state.errors?._form && (
          <div
            role="alert"
            className="mb-4 border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded text-sm"
          >
            {state.errors._form[0]}
          </div>
        )}

        <form action={formAction} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="newStock"
              className="block text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1.5"
            >
              New Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="newStock"
              name="newStock"
              type="number"
              required
              min="0"
              step="1"
              defaultValue={currentStock}
              aria-describedby={state.errors?.newStock ? "newStock-error" : undefined}
              className={[
                "w-full max-w-[200px] px-3 py-2.5 border text-sm text-[#111111] bg-white rounded",
                "focus:outline-none focus:ring-1 focus:ring-[#C8A96B] focus:border-[#C8A96B]",
                "placeholder-[#aaa] transition-colors",
                state.errors?.newStock ? "border-red-400" : "border-[#e5e5e5]",
              ].join(" ")}
            />
            {state.errors?.newStock && (
              <p id="newStock-error" className="mt-1 text-xs text-red-600" role="alert">
                {state.errors.newStock[0]}
              </p>
            )}
            <p className="mt-1 text-[10px] text-[#aaa]">Must be 0 or greater</p>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1.5"
            >
              Notes (optional)
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              maxLength={500}
              placeholder="e.g. New shipment received, stock count correction…"
              className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#C8A96B] focus:border-[#C8A96B] placeholder-[#aaa] transition-colors"
            />
          </div>

          <SubmitButton />
        </form>
      </div>

      {/* Stock history */}
      <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#FAF8F5]">
          <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355]">
            Stock History
          </h3>
        </div>

        {stockHistory.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#8b7355]">No stock adjustments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Change
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Before → After
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden md:table-cell">
                    Reason
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    By
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {stockHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#8b7355] whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ChangeIndicator change={entry.change} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-[#8b7355]">
                        {entry.previousStock}
                      </span>
                      <span className="text-xs text-[#aaa] mx-1.5">→</span>
                      <span className="text-xs font-medium text-[#111111]">
                        {entry.newStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[#8b7355]">{entry.reason}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#8b7355]">
                        {entry.user?.name ?? entry.user?.email ?? "System"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#aaa]">
                        {entry.notes ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
