"use client"

import { useState } from "react"
import Link from "next/link"

interface PaymentLinkSuccessProps {
  payUrl: string
  email: string
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function PaymentLinkSuccess({ payUrl, email }: PaymentLinkSuccessProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(payUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Success checkmark */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-light text-[#111111] mb-2">
          Link created successfully
        </h2>
        <p className="text-sm text-[#8C8C8C] leading-relaxed">
          Share the link below with whoever will pay for your order.
          {email && (
            <>
              {" "}We&apos;ve also sent it to{" "}
              <span className="font-medium text-[#111111]">{email}</span>.
            </>
          )}
        </p>
      </div>

      {/* Link box */}
      <div className="border border-[#EBEBEB] rounded-sm overflow-hidden">
        <div className="bg-[#F8F5F2] px-4 py-2.5 border-b border-[#EBEBEB] flex items-center justify-between">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
            Your payment link
          </p>
          <span className="text-[10px] text-[#8C8C8C]">Valid for 48 hours</span>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs text-[#111111] break-all font-mono leading-relaxed select-all">
            {payUrl}
          </p>
        </div>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={[
          "w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-sm text-sm font-medium transition-all duration-300",
          copied
            ? "border-2 border-green-500 bg-green-50 text-green-700"
            : "bg-[#111111] text-[#F8F5F2] hover:bg-[#B8965C] hover:text-[#111111]",
        ].join(" ")}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied to clipboard!" : "Copy link"}
      </button>

      {/* Back to shop */}
      <Link
        href="/shop"
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border border-[#EBEBEB] rounded-sm text-sm text-[#111111] hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Back to shop
      </Link>

      {/* Manage requests link */}
      <p className="text-center text-xs text-[#8C8C8C]">
        View and manage your links in{" "}
        <Link href="/account/payment-requests" className="text-[#B8965C] hover:underline">
          Payment Requests
        </Link>
      </p>
    </div>
  )
}
