"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PopupData {
  id: string
  title: string
  description: string
  ctaLabel: string
  ctaUrl: string
  imageUrl: string | null
  productName: string | null
  originalPrice: number | null
  discountPercent: number | null
  delaySeconds: number
}

interface PromotionalPopupProps {
  config: PopupData | null
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "dach_popup_dismissed"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PromotionalPopup({ config }: PromotionalPopupProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (!config) return

    // Check if already dismissed this session
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY)
      if (dismissed === config.id) return
    } catch {
      // sessionStorage unavailable — show anyway
    }

    const delay = Math.max(0, config.delaySeconds) * 1000
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [config])

  function dismiss() {
    setVisible(false)
    try {
      if (config) sessionStorage.setItem(STORAGE_KEY, config.id)
    } catch {
      // ignore
    }
  }

  // Don't render anything server-side or if no config
  if (!mounted || !config) return null

  const discountedPrice =
    config.originalPrice && config.discountPercent
      ? config.originalPrice - (config.originalPrice * config.discountPercent) / 100
      : null

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={dismiss}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={config.title}
        className={`fixed z-[61] inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none`}
      >
        <div
          className={`
            relative bg-[#FAF7F4] w-full max-w-[680px] shadow-[0_24px_64px_0_rgb(17_17_17/0.18)]
            flex flex-col sm:flex-row overflow-hidden pointer-events-auto
            transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
          `}
        >
          {/* ── LEFT — Image ── */}
          <div className="relative w-full sm:w-[42%] aspect-[4/3] sm:aspect-auto sm:min-h-[360px] bg-[#F2EDE8] shrink-0 overflow-hidden">
            {config.imageUrl ? (
              <Image
                src={config.imageUrl}
                alt={config.productName ?? config.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            ) : (
              /* Decorative placeholder */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F2EDE8] to-[#E8E0D8]">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-36 rounded-full bg-[#B8965C]/10 border border-[#B8965C]/20" />
                  <div className="absolute w-16 h-24 rounded-full bg-[#B8965C]/15 border border-[#B8965C]/30" />
                  <svg
                    className="absolute"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B8965C"
                    strokeWidth="1"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 12s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
              </div>
            )}

            {/* Discount badge — overlaid on image */}
            {config.discountPercent && (
              <div className="absolute top-4 left-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.22em] uppercase font-bold px-3 py-1.5 shadow-md">
                {config.discountPercent}% OFF
              </div>
            )}
          </div>

          {/* ── RIGHT — Content ── */}
          <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-8 flex-1">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-5 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[9px] tracking-[0.38em] uppercase font-medium">
                Exclusive Offer
              </p>
            </div>

            {/* Title */}
            <h2 className="font-serif text-[#111111] font-light leading-[1.15] mb-3" style={{ fontSize: "clamp(1.25rem, 3vw, 1.625rem)" }}>
              {config.title}
            </h2>

            {/* Description */}
            {config.description && (
              <p className="text-[#8C8C8C] text-sm leading-[1.8] mb-5">
                {config.description}
              </p>
            )}

            {/* Product name */}
            {config.productName && (
              <p className="text-[#4A4A4A] text-[11px] tracking-[0.12em] uppercase font-medium mb-4">
                {config.productName}
              </p>
            )}

            {/* Pricing */}
            {(config.originalPrice || discountedPrice) && (
              <div className="flex items-baseline gap-3 mb-6">
                {discountedPrice !== null && (
                  <span className="font-serif text-[#111111] text-xl font-medium">
                    ₦{discountedPrice.toLocaleString()}
                  </span>
                )}
                {config.originalPrice && (
                  <span className="text-[#8C8C8C] text-sm line-through">
                    ₦{config.originalPrice.toLocaleString()}
                  </span>
                )}
                {config.discountPercent && discountedPrice !== null && (
                  <span className="text-[#2E7D52] text-[11px] tracking-wide font-medium">
                    Save ₦{(config.originalPrice! - discountedPrice).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <Link
              href={config.ctaUrl}
              onClick={dismiss}
              className="inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 self-start min-h-[48px]"
            >
              {config.ctaLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Dismiss link */}
            <button
              onClick={dismiss}
              className="mt-4 text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] hover:text-[#111111] transition-colors self-start"
            >
              No thanks
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close popup"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#8C8C8C] hover:text-[#111111] hover:bg-[#e5e5e5] rounded transition-colors z-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
