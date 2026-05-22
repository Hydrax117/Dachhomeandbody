"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useGiftBuilder, type BoxProduct } from "@/app/gift-box/context/GiftBuilderContext"

interface BuilderProductCardProps {
  product: BoxProduct
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

export default function BuilderProductCard({ product }: BuilderProductCardProps) {
  const { addItem, removeItem, canAddItem, state } = useGiftBuilder()

  const countInBox = state.items.filter((p) => p.id === product.id).length
  const isInBox = countInBox > 0
  const notes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes]
    .slice(0, 3)
    .join(" · ")

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col bg-white border border-[#e5e5e5] overflow-hidden hover:border-[#C4C4C4] hover:shadow-md transition-all duration-400"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2EDE8]">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-20 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/30" />
          </div>
        )}

        {/* Count badge */}
        <AnimatePresence>
          {isInBox && (
            <motion.div
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 w-7 h-7 bg-[#B8965C] flex items-center justify-center text-white text-xs font-medium"
            >
              {countInBox}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood tags */}
        {product.moodTags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {product.moodTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-black/60 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-serif text-sm font-medium text-[#111111] mb-1 leading-snug">
          {product.name}
        </h4>
        {notes && (
          <p className="text-[#8C8C8C] text-[11px] tracking-wide mb-3 flex-1">
            {notes}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-serif text-sm font-medium text-[#111111]">
            {formatCurrency(product.price)}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Remove button */}
            <AnimatePresence>
              {isInBox && (
                <motion.button
                  key="remove"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => removeItem(product.id)}
                  aria-label={`Remove ${product.name} from box`}
                  className="w-7 h-7 border border-[#e5e5e5] flex items-center justify-center text-[#8C8C8C] hover:border-[#111111] hover:text-[#111111] transition-colors duration-200"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Add button */}
            <button
              onClick={() => addItem(product)}
              disabled={!canAddItem}
              aria-label={`Add ${product.name} to box`}
              className={`px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-300 ${
                canAddItem
                  ? "bg-[#111111] text-white hover:bg-[#B8965C]"
                  : "bg-[#e5e5e5] text-[#aaa] cursor-not-allowed"
              }`}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
