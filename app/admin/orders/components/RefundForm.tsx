"use client"

import { useActionState, useEffect, useState } from "react"
import { processRefundAction, type RefundFormState } from "@/app/actions/orders"

interface RefundFormProps {
  orderId: string
  orderTotal: number
  currentStatus: string
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return <p className="text-xs text-red-600 mt-1">{messages[0]}</p>
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

export default function RefundForm({ orderId, orderTotal, currentStatus }: RefundFormProps) {
  const [open, setOpen] = useState(false)

  const boundAction = processRefundAction.bind(null, orderId)
  const [state, formAction, isPending] = useActionState(boundAction, {})

  // Close panel on success
  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state.success])

  // Can only refund orders that are not already refunded or cancelled
  const canRefund = currentStatus !== "REFUNDED" && currentStatus !== "CANCELLED"

  if (!canRefund) {
    return (
      <p className="text-xs text-[#8C8C8C]">
        {currentStatus === "REFUNDED"
          ? "This order has already been refunded."
          : "Cancelled orders cannot be refunded."}
      </p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-xs px-4 py-2.5 border border-red-200 text-red-700 rounded hover:bg-red-50 transition-colors"
      >
        Process Refund
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <p className="text-xs text-[#8C8C8C]">
        Order total: <span className="font-medium text-[#111111]">{formatCurrency(orderTotal)}</span>
      </p>

      {state.errors?._form && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.errors._form[0]}
        </p>
      )}

      <div>
        <label
          htmlFor="refund-amount"
          className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium mb-1.5"
        >
          Refund Amount (₦) <span aria-hidden="true">*</span>
        </label>
        <input
          id="refund-amount"
          name="refundAmount"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={orderTotal}
          required
          disabled={isPending}
          className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C] transition-colors disabled:opacity-60"
          aria-describedby={state.errors?.refundAmount ? "refund-amount-error" : undefined}
        />
        <FieldError messages={state.errors?.refundAmount} />
      </div>

      <div>
        <label
          htmlFor="refund-notes"
          className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium mb-1.5"
        >
          Notes
        </label>
        <textarea
          id="refund-notes"
          name="notes"
          rows={2}
          placeholder="Reason for refund…"
          disabled={isPending}
          className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#B8965C] transition-colors resize-none disabled:opacity-60 placeholder:text-[#aaa]"
        />
        <FieldError messages={state.errors?.notes} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 text-xs px-4 py-2.5 bg-red-700 text-white rounded hover:bg-red-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Processing…" : "Confirm Refund"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="text-xs text-[#8C8C8C] hover:text-[#111111] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
