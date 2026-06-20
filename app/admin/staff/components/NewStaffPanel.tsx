"use client"

import { useState } from "react"
import StaffForm from "./StaffForm"

export default function NewStaffPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-[#111111] text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Staff
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-label="Add staff member"
        >
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
              <h2 className="font-serif text-lg text-[#111111]">Add Staff Member</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[#8C8C8C] hover:text-[#111111] transition-colors"
                aria-label="Close panel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-[#8C8C8C] mb-5">
                Staff members can view orders, update order status, record in-store sales, and view inventory.
                They cannot manage products, coupons, shipping rates, or other settings.
              </p>
              <StaffForm onSuccess={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
