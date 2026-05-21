"use client"

import { useState, useTransition } from "react"
import type { AdminCouponRow } from "@/lib/coupons"

interface CouponRowProps {
  coupon: AdminCouponRow
  toggleAction: (id: string, active: boolean) => Promise<{ error?: string }>
  deleteAction: (id: string) => Promise<{ error?: string }>
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

function isExpired(expiresAt: Date | null): boolean {
  return expiresAt != null && expiresAt < new Date()
}

function computedStatus(coupon: AdminCouponRow): "active" | "inactive" | "expired" | "exhausted" {
  if (isExpired(coupon.expiresAt)) return "expired"
  if (coupon.maxUsageCount != null && coupon.usageCount >= coupon.maxUsageCount) return "exhausted"
  if (!coupon.active) return "inactive"
  return "active"
}

const statusStyles = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  exhausted: "bg-yellow-50 text-yellow-700 border-yellow-200",
}

export default function CouponRow({ coupon, toggleAction, deleteAction }: CouponRowProps) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const status = computedStatus(coupon)
  const canToggle = status !== "expired" && status !== "exhausted"

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = await toggleAction(coupon.id, !coupon.active)
      if (result.error) setError(result.error)
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAction(coupon.id)
      if (result.error) {
        setError(result.error)
        setConfirming(false)
      }
    })
  }

  const discountLabel =
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}% off`
      : `${formatCurrency(coupon.discountValue)} off`

  const usageLabel =
    coupon.maxUsageCount != null
      ? `${coupon.usageCount} / ${coupon.maxUsageCount}`
      : `${coupon.usageCount} uses`

  return (
    <tr className="hover:bg-[#F8F5F2] transition-colors">
      {/* Code */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-medium text-[#111111]">{coupon.code}</span>
      </td>

      {/* Discount */}
      <td className="px-4 py-3">
        <span className="text-sm text-[#111111]">{discountLabel}</span>
        {coupon.minOrderValue != null && (
          <p className="text-[11px] text-[#8C8C8C] mt-0.5">
            Min: {formatCurrency(coupon.minOrderValue)}
          </p>
        )}
      </td>

      {/* Usage */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm text-[#111111]">{usageLabel}</span>
      </td>

      {/* Expiry */}
      <td className="px-4 py-3 hidden md:table-cell">
        {coupon.expiresAt ? (
          <span className={`text-xs ${isExpired(coupon.expiresAt) ? "text-red-600" : "text-[#8C8C8C]"}`}>
            {new Date(coupon.expiresAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-xs text-[#aaa]">No expiry</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span
          className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${statusStyles[status]}`}
        >
          {status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {error && (
            <span className="text-[11px] text-red-600 max-w-[140px] text-right">{error}</span>
          )}

          {confirming ? (
            <>
              <span className="text-[11px] text-[#8C8C8C]">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-red-600 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                aria-label={`Confirm delete coupon ${coupon.code}`}
              >
                {isPending ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="text-xs text-[#8C8C8C] hover:text-[#111111] px-1.5 py-1 rounded hover:bg-[#f0ece4] transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              {canToggle && (
                <button
                  onClick={handleToggle}
                  disabled={isPending}
                  className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                    coupon.active
                      ? "text-[#8C8C8C] hover:text-red-600 hover:bg-red-50"
                      : "text-[#8C8C8C] hover:text-green-700 hover:bg-green-50"
                  }`}
                  aria-label={coupon.active ? `Deactivate coupon ${coupon.code}` : `Activate coupon ${coupon.code}`}
                >
                  {isPending ? "…" : coupon.active ? "Deactivate" : "Activate"}
                </button>
              )}
              <button
                onClick={() => setConfirming(true)}
                disabled={isPending}
                className="text-xs text-[#8C8C8C] hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                aria-label={`Delete coupon ${coupon.code}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
