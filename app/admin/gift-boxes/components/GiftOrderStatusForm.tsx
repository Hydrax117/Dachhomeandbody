"use client"

import { useState, useTransition } from "react"
import { updateGiftOrderStatusAction } from "@/app/actions/gift-boxes"
import type { GiftOrderStatus } from "@/lib/gift-boxes"

const STATUSES: GiftOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

interface GiftOrderStatusFormProps {
  orderId: string
  currentStatus: GiftOrderStatus
}

export default function GiftOrderStatusForm({
  orderId,
  currentStatus,
}: GiftOrderStatusFormProps) {
  const [status, setStatus] = useState<GiftOrderStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleUpdate = () => {
    if (status === currentStatus) return
    setMessage(null)
    startTransition(async () => {
      const result = await updateGiftOrderStatusAction(orderId, status)
      if (result.success) {
        setMessage({ type: "success", text: "Status updated." })
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to update." })
      }
    })
  }

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as GiftOrderStatus)}
        className="input text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        className="w-full py-2.5 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Updating…" : "Update Status"}
      </button>

      {message && (
        <p
          className={`text-xs ${
            message.type === "success" ? "text-[#2E7D52]" : "text-[#B83232]"
          }`}
          role="alert"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
