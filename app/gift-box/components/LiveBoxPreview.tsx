"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useGiftBuilder } from "@/app/gift-box/context/GiftBuilderContext"
import { GIFT_BOX_THEME_META, type GiftBoxTheme } from "@/lib/gift-boxes"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

// Positions for items inside the box preview (up to 8)
const itemPositions = [
  { top: "18%", left: "12%", rotate: -8, scale: 0.85 },
  { top: "14%", left: "52%", rotate: 5, scale: 0.9 },
  { top: "42%", left: "28%", rotate: -4, scale: 0.8 },
  { top: "38%", left: "62%", rotate: 7, scale: 0.85 },
  { top: "62%", left: "10%", rotate: -6, scale: 0.75 },
  { top: "60%", left: "44%", rotate: 3, scale: 0.8 },
  { top: "22%", left: "78%", rotate: -5, scale: 0.75 },
  { top: "70%", left: "72%", rotate: 6, scale: 0.7 },
]

export default function LiveBoxPreview() {
  const { state, itemCount, remainingCapacity, isFull, total, removeItem, maxItems } = useGiftBuilder()
  const { selectedBox, selectedSizeTier, items } = state

  if (!selectedBox) {
    return (
      <div className="sticky top-8 flex flex-col items-center justify-center h-80 border border-dashed border-[#e5e5e5] bg-[#FAF7F4]">
        <div className="w-12 h-12 border border-[#e5e5e5] flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <p className="text-[#C4C4C4] text-xs tracking-[0.2em] uppercase">
          Select a box to begin
        </p>
      </div>
    )
  }

  const meta = GIFT_BOX_THEME_META[selectedBox.theme as GiftBoxTheme]
  const fillPercent = Math.round((itemCount / (maxItems || 1)) * 100)

  return (
    <div className="sticky top-8 space-y-4">
      {/* Box visual */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${meta.palette}`}
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Box background image */}
        <Image
          src={selectedBox.image}
          alt={selectedBox.title}
          fill
          className="object-cover opacity-60"
          sizes="400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Floating product thumbnails */}
        <AnimatePresence>
          {items.map((product, idx) => {
            const pos = itemPositions[idx % itemPositions.length]
            return (
              <motion.div
                key={`${product.id}-${idx}`}
                initial={{ opacity: 0, scale: 0, rotate: pos.rotate - 10 }}
                animate={{
                  opacity: 1,
                  scale: pos.scale,
                  rotate: pos.rotate,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: idx * 0.05,
                }}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  width: "22%",
                  aspectRatio: "3/4",
                }}
                className="overflow-hidden shadow-lg border border-white/20"
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#B8965C]/30 flex items-center justify-center">
                    <div className="w-4 h-8 rounded-full bg-[#B8965C]/50" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Box label overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p
            className={`font-serif text-sm font-medium ${
              selectedBox.theme === "NOIR_LUXURY"
                ? "text-[#F8F5F2]"
                : "text-[#111111]"
            }`}
          >
            {selectedBox.title}
          </p>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C]">
            {itemCount} of {maxItems} items
          </span>
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#B8965C]">
            {isFull
              ? "Box full"
              : itemCount === 0
              ? `Up to ${maxItems}`
              : `${remainingCapacity} more available`}
          </span>
        </div>
        <div className="h-0.5 bg-[#e5e5e5] overflow-hidden">
          <motion.div
            className="h-full bg-[#B8965C]"
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>

      {/* Item list */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {items.map((product, idx) => (
              <motion.div
                key={`list-${product.id}-${idx}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-3 py-2 border-b border-[#f0ece4] last:border-0 group"
              >
                <div className="w-8 h-10 relative overflow-hidden bg-[#F2EDE8] shrink-0">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#111111] truncate">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-[#8C8C8C]">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                {/* Remove button */}
                <button
                  onClick={() => removeItem(product.id)}
                  aria-label={`Remove ${product.name}`}
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-[#C4C4C4] hover:text-[#B83232] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-3 border-t border-[#e5e5e5] space-y-1.5"
        >
          <div className="flex justify-between text-xs text-[#8C8C8C]">
            <span>Products</span>
            <span>
              {formatCurrency(items.reduce((s, p) => s + p.price, 0))}
            </span>
          </div>
          <div className="flex justify-between text-xs text-[#8C8C8C]">
            <span>Box ({selectedSizeTier?.label ?? ""})</span>
            <span>
              {(selectedSizeTier?.price ?? 0) > 0
                ? formatCurrency(selectedSizeTier!.price)
                : "Complimentary"}
            </span>
          </div>
          <div className="flex justify-between font-serif text-sm font-medium text-[#111111] pt-1.5 border-t border-[#e5e5e5]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
