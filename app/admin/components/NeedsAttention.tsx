"use client"

/**
 * NeedsAttention — auto-refreshing alert panel for the admin dashboard.
 * Polls /api/admin/counts every 30 s and updates the counts in-place.
 * When new unprocessed orders arrive the panel flashes gold to grab attention.
 */

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"

interface Counts {
  pendingOrders: number
  newPayRequests: number
  pendingReviews: number
  lowStock: number
}

interface NeedsAttentionProps {
  /** Initial server-rendered counts so there's no flash on first load */
  initial: Counts
}

export default function NeedsAttention({ initial }: NeedsAttentionProps) {
  const [counts, setCounts] = useState<Counts>(initial)
  const [flash, setFlash] = useState(false)
  const prevTotal = useRef(initial.pendingOrders + initial.newPayRequests)

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/counts", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json() as Counts
      setCounts(data)

      const newTotal = data.pendingOrders + data.newPayRequests
      if (newTotal > prevTotal.current) {
        // New order came in — flash the panel
        setFlash(true)
        setTimeout(() => setFlash(false), 2500)
      }
      prevTotal.current = newTotal
    } catch {
      // Network error — keep showing previous counts
    }
  }, [])

  useEffect(() => {
    const id = setInterval(fetchCounts, 30_000)
    return () => clearInterval(id)
  }, [fetchCounts])

  const hasItems =
    counts.pendingOrders > 0 ||
    counts.newPayRequests > 0 ||
    counts.pendingReviews > 0 ||
    counts.lowStock > 0

  if (!hasItems) return null

  return (
    <div
      className={`border rounded p-4 transition-colors duration-700 ${
        flash
          ? "bg-[#B8965C]/15 border-[#B8965C]"
          : "bg-[#fffbf0] border-[#B8965C]/30"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Items needing attention"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C]">
          Needs Attention
        </p>
        {/* Pulsing dot when there are new unactioned orders */}
        {(counts.pendingOrders + counts.newPayRequests) > 0 && (
          <span className="flex items-center gap-1.5 text-[10px] text-[#B8965C]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8965C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8965C]" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {counts.pendingOrders > 0 && (
          <Link
            href="/admin/orders?status=PENDING"
            className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors"
          >
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold">
              {counts.pendingOrders}
            </span>
            pending order{counts.pendingOrders !== 1 ? "s" : ""} to process
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}

        {counts.newPayRequests > 0 && (
          <Link
            href="/admin/payment-requests?status=PAID"
            className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors"
          >
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-[10px] font-bold">
              {counts.newPayRequests}
            </span>
            new pay-for-me order{counts.newPayRequests !== 1 ? "s" : ""}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}

        {counts.pendingReviews > 0 && (
          <Link
            href="/admin/reviews"
            className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors"
          >
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-[10px] font-bold">
              {counts.pendingReviews}
            </span>
            review{counts.pendingReviews !== 1 ? "s" : ""} to moderate
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}

        {counts.lowStock > 0 && (
          <Link
            href="/admin/products?stock=low"
            className="group flex items-center gap-2 text-sm text-[#111111] hover:text-[#B8965C] transition-colors"
          >
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-red-100 border border-red-300 text-red-800 text-[10px] font-bold">
              {counts.lowStock}
            </span>
            low-stock product{counts.lowStock !== 1 ? "s" : ""}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
