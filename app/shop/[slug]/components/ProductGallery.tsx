"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  // Touch swipe state
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const hasImages = images.length > 0
  const activeImage = hasImages ? images[activeIndex] : null

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomed) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPos({ x, y })
    },
    [zoomed]
  )

  const handlePrev = useCallback(
    () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  )
  const handleNext = useCallback(
    () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  )

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      // Only swipe if horizontal movement dominates and exceeds threshold
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && images.length > 1) {
        if (dx < 0) handleNext()
        else handlePrev()
      }
      touchStartX.current = null
      touchStartY.current = null
    },
    [images.length, handleNext, handlePrev]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative aspect-product overflow-hidden bg-[#f0ece4] cursor-zoom-in select-none"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={zoomed ? "Zoom active — move mouse to explore" : "Hover to zoom"}
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300"
            style={
              zoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: "scale(2)",
                    transition: "transform 0.1s ease-out",
                  }
                : { transform: "scale(1)", transition: "transform 0.3s ease-out" }
            }
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8e0d0] to-[#d4c9b0] flex items-center justify-center">
            <div
              className="w-20 h-32 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Zoom indicator */}
        {activeImage && !zoomed && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 pointer-events-none">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#4a4a4a]">Zoom</span>
          </div>
        )}

        {/* Prev / Next arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIndex}
              className={`relative shrink-0 w-16 h-20 overflow-hidden border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B] ${
                i === activeIndex
                  ? "border-[#C8A96B]"
                  : "border-transparent hover:border-[#C8A96B]/40"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
