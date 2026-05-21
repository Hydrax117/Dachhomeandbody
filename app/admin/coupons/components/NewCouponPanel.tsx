"use client"

import { useState } from "react"
import CouponForm from "./CouponForm"
import type { CouponFormState } from "../actions"

interface NewCouponPanelProps {
  createAction: (prev: CouponFormState, formData: FormData) => Promise<CouponFormState>
}

export default function NewCouponPanel({ createAction }: NewCouponPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Coupon
        </button>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded p-5 w-full max-w-lg">
          <h2 className="font-serif text-base font-medium text-[#111111] mb-4">
            New Coupon
          </h2>
          <CouponForm
            createAction={createAction}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
