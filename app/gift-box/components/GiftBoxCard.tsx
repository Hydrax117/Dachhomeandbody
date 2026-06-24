"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useGiftBuilder, type SelectedGiftBox } from "@/app/gift-box/context/GiftBuilderContext"
import { GIFT_BOX_THEME_META, type GiftBoxTheme } from "@/lib/gift-boxes"

interface GiftBoxCardProps {
  box: SelectedGiftBox & { theme: GiftBoxTheme }
}

const themeTextColor: Record<GiftBoxTheme, string> = {
  SIGNATURE_CREAM: "text-[#111111]",
  NOIR_LUXURY: "text-[#F8F5F2]",
  ROMANTIC_BLUSH: "text-[#111111]",
}

const themeBorderColor: Record<GiftBoxTheme, string> = {
  SIGNATURE_CREAM: "border-[#C4A882]",
  NOIR_LUXURY: "border-[#B8965C]",
  ROMANTIC_BLUSH: "border-[#D4A0A0]",
}

const themeButtonStyle: Record<GiftBoxTheme, string> = {
  SIGNATURE_CREAM:
    "bg-[#111111] text-[#F8F5F2] hover:bg-[#B8965C] hover:text-[#111111]",
  NOIR_LUXURY:
    "bg-[#B8965C] text-[#111111] hover:bg-[#CBA96E]",
  ROMANTIC_BLUSH:
    "bg-[#111111] text-[#F8F5F2] hover:bg-[#B8965C] hover:text-[#111111]",
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

export default function GiftBoxCard({ box }: GiftBoxCardProps) {
  const { selectBox, state } = useGiftBuilder()
  const meta = GIFT_BOX_THEME_META[box.theme]
  const isSelected = state.selectedBox?.id === box.id
  const textColor = themeTextColor[box.theme]
  const borderColor = themeBorderColor[box.theme]
  const buttonStyle = themeButtonStyle[box.theme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col h-full overflow-hidden border transition-all duration-500 ${
        isSelected
          ? `${borderColor} shadow-[0_8px_40px_0_rgb(184_150_92/0.18)]`
          : "border-[#e5e5e5] hover:border-[#C4C4C4] shadow-sm hover:shadow-lg"
      }`}
    >
      {/* Image */}
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${meta.palette}`}
      >
        <Image
          src={box.image}
          alt={box.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Capacity badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
            Up to {box.maxItems} items
          </span>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 w-7 h-7 bg-[#B8965C] flex items-center justify-center"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col flex-1 p-6 bg-gradient-to-br ${meta.palette}`}
      >
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2 font-medium">
          {meta.label}
        </p>
        <h3
          className={`font-serif text-xl font-medium mb-3 leading-snug ${textColor}`}
        >
          {box.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-5 flex-1 ${
            box.theme === "NOIR_LUXURY"
              ? "text-[#F8F5F2]/60"
              : "text-[#8C8C8C]"
          }`}
        >
          {box.description}
        </p>

        <div className="flex items-center justify-between mb-5">
          <span
            className={`font-serif text-lg font-medium ${textColor}`}
          >
            {box.price > 0 ? formatCurrency(box.price) : "Complimentary"}
          </span>
          <span
            className={`text-[10px] tracking-[0.15em] uppercase ${
              box.theme === "NOIR_LUXURY"
                ? "text-[#F8F5F2]/40"
                : "text-[#8C8C8C]"
            }`}
          >
            Box price
          </span>
        </div>

        <button
          onClick={() => selectBox(box)}
          className={`w-full py-3.5 text-[10px] tracking-[0.25em] uppercase font-medium transition-all duration-300 ${buttonStyle}`}
        >
          {isSelected ? "Selected ✓" : "Select This Box"}
        </button>
      </div>
    </motion.div>
  )
}
