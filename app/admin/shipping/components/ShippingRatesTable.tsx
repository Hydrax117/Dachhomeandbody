"use client"

import { useState, useTransition } from "react"
import { bulkUpdateShippingRatesAction } from "../actions"
import { nigerianStates } from "@/lib/nigeria-states"
import type { ShippingRateRow } from "@/lib/shipping"

interface ShippingRatesTableProps {
  rates: ShippingRateRow[]
}

export function ShippingRatesTable({ rates }: ShippingRatesTableProps) {
  // Build a map of state → fee for quick lookup; default to 0 for unconfigured states
  const rateMap = new Map(rates.map((r) => [r.state, r.fee]))

  // Local editable state — keyed by state name
  const [fees, setFees] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const s of nigerianStates) {
      initial[s.name] = String(rateMap.get(s.name) ?? 0)
    }
    return initial
  })

  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Track which rows have been edited
  const [dirty, setDirty] = useState<Set<string>>(new Set())

  function handleFeeChange(state: string, value: string) {
    setFees((prev) => ({ ...prev, [state]: value }))
    setDirty((prev) => new Set(prev).add(state))
    setSaveStatus("idle")
  }

  function handleSaveAll() {
    const parsed = nigerianStates.map((s) => ({
      state: s.name,
      fee: Math.max(0, Number(fees[s.name]) || 0),
    }))

    setSaveStatus("saving")
    setErrorMsg(null)

    startTransition(async () => {
      const result = await bulkUpdateShippingRatesAction(parsed)
      if (result.success) {
        setSaveStatus("saved")
        setDirty(new Set())
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
        setErrorMsg(result.error ?? "Failed to save")
      }
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#8C8C8C]">
          {dirty.size > 0
            ? `${dirty.size} unsaved change${dirty.size !== 1 ? "s" : ""}`
            : "All rates saved"}
        </p>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending || dirty.size === 0}
          className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      {/* Status messages */}
      {saveStatus === "saved" && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm">
          Shipping rates updated successfully.
        </div>
      )}
      {saveStatus === "error" && errorMsg && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="border border-[#EBEBEB] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#F8F5F2]">
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                State
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium w-48">
                Shipping Fee (₦)
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium w-24">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {nigerianStates.map((s, i) => {
              const isDirty = dirty.has(s.name)
              const hasRate = rateMap.has(s.name)
              return (
                <tr
                  key={s.code}
                  className={[
                    "border-b border-[#EBEBEB] last:border-0 transition-colors",
                    isDirty ? "bg-amber-50" : i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 font-medium text-[#111111]">
                    {s.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8C8C8C] text-xs">₦</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={fees[s.name]}
                        onChange={(e) => handleFeeChange(s.name, e.target.value)}
                        className="input py-1.5 text-sm w-32"
                        aria-label={`Shipping fee for ${s.name}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isDirty ? (
                      <span className="text-[10px] tracking-wide text-amber-600 font-medium uppercase">
                        Unsaved
                      </span>
                    ) : hasRate ? (
                      <span className="text-[10px] tracking-wide text-green-600 font-medium uppercase">
                        Set
                      </span>
                    ) : (
                      <span className="text-[10px] tracking-wide text-[#C4C4C4] font-medium uppercase">
                        Default
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[#8C8C8C]">
        Set fee to 0 for free shipping to a state. Changes apply immediately after saving.
      </p>
    </div>
  )
}
