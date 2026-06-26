"use client"

import { motion } from "framer-motion"
import { useGiftBuilder } from "@/app/gift-box/context/GiftBuilderContext"
import {
  GIFT_CARD_STYLE_META,
  GIFT_RIBBON_STYLE_META,
  GIFT_RIBBON_COLOR_META,
  type GiftCardStyle,
  type GiftRibbonStyle,
  type GiftRibbonColor,
} from "@/lib/gift-boxes"

const cardStyles = Object.entries(GIFT_CARD_STYLE_META) as [
  GiftCardStyle,
  { label: string }
][]

const ribbonStyles = Object.entries(GIFT_RIBBON_STYLE_META) as [
  GiftRibbonStyle,
  { label: string; description: string }
][]

const ribbonColors = Object.entries(GIFT_RIBBON_COLOR_META) as [
  GiftRibbonColor,
  { label: string; hex: string }
][]

// Texture illustrations for each ribbon style
const RibbonTexture = ({ style, active }: { style: GiftRibbonStyle; active: boolean }) => {
  const color = active ? "white" : "#C4C4C4"
  if (style === "SATIN") {
    // Smooth wavy lines = glossy satin
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
        <path d="M2 10 Q8 4 16 10 Q24 16 30 10" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M2 14 Q8 8 16 14 Q24 20 30 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
    )
  }
  if (style === "GROSGRAIN") {
    // Horizontal ribs = grosgrain weave
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
        {[4, 8, 12, 16].map((y) => (
          <line key={y} x1="4" y1={y} x2="28" y2={y} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </svg>
    )
  }
  // VELVET — soft dense strokes
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
      {[6, 10, 14, 18, 22, 26].map((x) => (
        <line key={x} x1={x} y1="3" x2={x} y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity={x % 8 === 0 ? "1" : "0.6"} />
      ))}
    </svg>
  )
}

export default function CustomizationStep() {
  const { state, setCustomization, setStep } = useGiftBuilder()
  const { customization } = state

  const charCount = customization.message.length
  const maxChars = 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-2xl mx-auto space-y-10"
    >
      {/* Gift Message */}
      <section>
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">01</p>
        <h3 className="font-serif text-2xl font-medium text-[#111111] mb-6">
          Your Gift Message
        </h3>
        <div className="relative">
          <textarea
            value={customization.message}
            onChange={(e) =>
              setCustomization({ message: e.target.value.slice(0, maxChars) })
            }
            placeholder="Write something personal and heartfelt…"
            rows={4}
            className="w-full px-5 py-4 bg-white border border-[#e5e5e5] text-[#111111] text-sm leading-relaxed resize-none focus:outline-none focus:border-[#B8965C] focus:shadow-[0_0_0_3px_rgb(184_150_92/0.12)] transition-all duration-300 placeholder:text-[#C4C4C4] font-sans"
          />
          <div className="absolute bottom-3 right-4 text-[11px] text-[#C4C4C4]">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer group">
          <div
            onClick={() =>
              setCustomization({ anonymous: !customization.anonymous })
            }
            className={`w-10 h-5 relative transition-colors duration-300 ${
              customization.anonymous ? "bg-[#111111]" : "bg-[#e5e5e5]"
            }`}
          >
            <motion.div
              animate={{ x: customization.anonymous ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 bg-white shadow-sm"
            />
          </div>
          <span className="text-xs text-[#8C8C8C] tracking-wide group-hover:text-[#111111] transition-colors duration-200">
            Send anonymously
          </span>
        </label>
      </section>

      {/* Card Style */}
      <section>
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">02</p>
        <h3 className="font-serif text-2xl font-medium text-[#111111] mb-6">
          Card Design
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cardStyles.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCustomization({ cardStyle: key })}
              className={`relative py-5 px-3 border text-center transition-all duration-300 ${
                customization.cardStyle === key
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#e5e5e5] bg-white text-[#8C8C8C] hover:border-[#C4C4C4] hover:text-[#111111]"
              }`}
            >
              <div
                className={`w-8 h-10 mx-auto mb-3 border ${
                  customization.cardStyle === key ? "border-white/30" : "border-[#e5e5e5]"
                } flex items-center justify-center`}
              >
                {key === "LUXURY_GOLD" && (
                  <div className="w-4 h-0.5 bg-[#B8965C]" />
                )}
                {key === "ROMANTIC" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={customization.cardStyle === key ? "white" : "#C4C4C4"}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                {key === "BIRTHDAY" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={customization.cardStyle === key ? "white" : "#C4C4C4"} strokeWidth="1.5">
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] tracking-[0.15em] uppercase font-medium">
                {meta.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ribbon Style */}
      <section>
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">03</p>
        <h3 className="font-serif text-2xl font-medium text-[#111111] mb-2">
          Ribbon Style
        </h3>
        <p className="text-[#8C8C8C] text-xs mb-6 leading-relaxed">
          Choose the texture and weave of your ribbon.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ribbonStyles.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCustomization({ ribbonStyle: key })}
              className={`relative py-5 px-3 border text-center transition-all duration-300 group ${
                customization.ribbonStyle === key
                  ? "border-[#111111] bg-[#111111]"
                  : "border-[#e5e5e5] bg-white hover:border-[#B8965C]"
              }`}
            >
              {/* Texture icon */}
              <div className="flex items-center justify-center mb-3 h-5">
                <RibbonTexture style={key} active={customization.ribbonStyle === key} />
              </div>
              <span className={`block text-[10px] tracking-[0.18em] uppercase font-medium mb-1 ${
                customization.ribbonStyle === key ? "text-white" : "text-[#111111]"
              }`}>
                {meta.label}
              </span>
              <span className={`block text-[10px] leading-snug ${
                customization.ribbonStyle === key ? "text-white/50" : "text-[#8C8C8C]"
              }`}>
                {meta.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ribbon Color */}
      <section>
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">04</p>
        <h3 className="font-serif text-2xl font-medium text-[#111111] mb-2">
          Ribbon Color
        </h3>
        <p className="text-[#8C8C8C] text-xs mb-6 leading-relaxed">
          Pick the colour to complement your chosen box style.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ribbonColors.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCustomization({ ribbonColor: key })}
              className={`relative py-5 px-3 border text-center transition-all duration-300 ${
                customization.ribbonColor === key
                  ? "border-[#111111]"
                  : "border-[#e5e5e5] hover:border-[#C4C4C4]"
              }`}
            >
              {/* Color swatch */}
              <div className="flex items-center justify-center mb-3">
                <div
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    customization.ribbonColor === key
                      ? "border-[#111111] scale-110 shadow-[0_0_0_3px_rgb(0_0_0/0.08)]"
                      : "border-[#e5e5e5]"
                  }`}
                  style={{ backgroundColor: meta.hex }}
                />
              </div>
              <span className={`text-[10px] tracking-[0.18em] uppercase font-medium ${
                customization.ribbonColor === key ? "text-[#111111]" : "text-[#8C8C8C]"
              }`}>
                {meta.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Delivery Date */}
      <section>
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">05</p>
        <h3 className="font-serif text-2xl font-medium text-[#111111] mb-6">
          Delivery Date
        </h3>
        <div className="max-w-xs">
          <input
            type="date"
            value={customization.deliveryDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCustomization({ deliveryDate: e.target.value })}
            className="w-full px-5 py-4 bg-white border border-[#e5e5e5] text-[#111111] text-sm focus:outline-none focus:border-[#B8965C] focus:shadow-[0_0_0_3px_rgb(184_150_92/0.12)] transition-all duration-300 font-sans"
          />
          <p className="text-[11px] text-[#8C8C8C] mt-2 tracking-wide">
            Leave blank for standard delivery
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
        <button
          onClick={() => setStep("build")}
          className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C] hover:text-[#111111] transition-colors duration-200 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button
          onClick={() => setStep("summary")}
          className="px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
        >
          Review Order
        </button>
      </div>
    </motion.div>
  )
}
