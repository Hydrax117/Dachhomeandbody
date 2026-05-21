"use client"

import { useState, useTransition } from "react"
import { updateOrderStatusAction } from "@/app/actions/orders"

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
] as const

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
}

interface OrderStatusFormProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const [selected, setSelected] = useState(currentStatus)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected === currentStatus) return

    setMessage(null)
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selected)
      if (result.success) {
        setMessage({ type: "success", text: "Order status updated." })
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong." })
        setSelected(currentStatus)
      }
    })
  }

  const effectiveStatus = message?.type === "success" ? selected : currentStatus

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="order-status"
          className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium mb-2"
        >
          Order Status
        </label>
        <select
          id="order-status"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value)
            setMessage(null)
          }}
          disabled={isPending}
          className={`w-full text-xs px-3 py-2 border rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] disabled:opacity-60 ${
            statusStyles[selected] ?? "border-[#e5e5e5]"
          }`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p
          className={`text-xs ${
            message.type === "success" ? "text-green-700" : "text-red-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || selected === effectiveStatus}
        className="w-full text-xs px-4 py-2.5 bg-[#111111] text-white rounded hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Updating…" : "Update Status"}
      </button>
    </form>
  )
}
