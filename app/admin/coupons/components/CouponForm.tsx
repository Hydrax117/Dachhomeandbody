"use client"

import { useActionState, useEffect, useRef } from "react"
import type { CouponFormState } from "../actions"

interface CouponFormProps {
  createAction: (prev: CouponFormState, formData: FormData) => Promise<CouponFormState>
  onSuccess: () => void
  onCancel: () => void
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return <p className="text-xs text-red-600 mt-1">{messages[0]}</p>
}

export default function CouponForm({ createAction, onSuccess, onCancel }: CouponFormProps) {
  const [state, formAction, isPending] = useActionState(createAction, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onSuccess()
    }
  }, [state.success, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {/* Global error */}
      {state.errors?._form && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.errors._form[0]}
        </p>
      )}

      {/* Code */}
      <div>
        <label htmlFor="coupon-code" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
          Coupon Code <span aria-hidden="true">*</span>
        </label>
        <input
          id="coupon-code"
          name="code"
          type="text"
          placeholder="e.g. SUMMER20"
          required
          className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors font-mono uppercase placeholder:normal-case placeholder:font-sans"
          aria-describedby={state.errors?.code ? "coupon-code-error" : undefined}
        />
        <FieldError messages={state.errors?.code} />
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="coupon-type" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
            Type <span aria-hidden="true">*</span>
          </label>
          <select
            id="coupon-type"
            name="discountType"
            required
            defaultValue="PERCENTAGE"
            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors text-[#111111]"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₦)</option>
          </select>
          <FieldError messages={state.errors?.discountType} />
        </div>

        <div>
          <label htmlFor="coupon-value" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
            Value <span aria-hidden="true">*</span>
          </label>
          <input
            id="coupon-value"
            name="discountValue"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 20"
            required
            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors"
          />
          <FieldError messages={state.errors?.discountValue} />
        </div>
      </div>

      {/* Min order value + max usage */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="coupon-min" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
            Min Order (₦)
          </label>
          <input
            id="coupon-min"
            name="minOrderValue"
            type="number"
            min="0"
            step="1"
            placeholder="No minimum"
            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors"
          />
          <FieldError messages={state.errors?.minOrderValue} />
        </div>

        <div>
          <label htmlFor="coupon-max-usage" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
            Max Uses
          </label>
          <input
            id="coupon-max-usage"
            name="maxUsageCount"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors"
          />
          <FieldError messages={state.errors?.maxUsageCount} />
        </div>
      </div>

      {/* Expiry date */}
      <div>
        <label htmlFor="coupon-expires" className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1.5">
          Expiry Date
        </label>
        <input
          id="coupon-expires"
          name="expiresAt"
          type="date"
          className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#C8A96B] transition-colors text-[#111111]"
        />
        <FieldError messages={state.errors?.expiresAt} />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="coupon-active"
          name="active"
          type="checkbox"
          defaultChecked
          value="true"
          className="w-4 h-4 accent-[#C8A96B]"
        />
        <label htmlFor="coupon-active" className="text-sm text-[#111111]">
          Active immediately
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs text-[#8b7355] hover:text-[#111111] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
