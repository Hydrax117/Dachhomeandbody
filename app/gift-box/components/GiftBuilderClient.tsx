"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGiftBuilder } from "@/app/gift-box/context/GiftBuilderContext"
import BuilderProgress from "./BuilderProgress"
import GiftBoxCard from "./GiftBoxCard"
import BuilderProductCard from "./BuilderProductCard"
import LiveBoxPreview from "./LiveBoxPreview"
import CustomizationStep from "./CustomizationStep"
import SummaryStep from "./SummaryStep"
import type { GiftBoxTheme } from "@/lib/gift-boxes"

// ---------------------------------------------------------------------------
// Types (matching what the server passes down)
// ---------------------------------------------------------------------------

interface GiftBoxData {
  id: string
  title: string
  slug: string
  description: string
  image: string
  maxItems: number
  price: number
  theme: GiftBoxTheme
  active: boolean
  sortOrder: number
}

interface ProductData {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  moodTags: string[]
  category: { id: string; name: string; slug: string }
}

interface GiftBuilderClientProps {
  giftBoxes: GiftBoxData[]
  products: ProductData[]
  categories: { id: string; name: string; slug: string }[]
}

// ---------------------------------------------------------------------------
// Step 1: Select Box
// ---------------------------------------------------------------------------

function SelectBoxStep({ giftBoxes }: { giftBoxes: GiftBoxData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase mb-4">
          Step One
        </p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium text-[#111111] mb-4">
          Choose Your Box
        </h2>
        <p className="text-[#8C8C8C] text-sm max-w-md mx-auto leading-relaxed">
          Each box is a world of its own. Select the one that speaks to the
          occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {giftBoxes.map((box, i) => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <GiftBoxCard box={box} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Step 2: Build the Box
// ---------------------------------------------------------------------------

const CATEGORY_ALL = "__all__"

function BuildStep({ products, categories }: { products: ProductData[]; categories: { id: string; name: string; slug: string }[] }) {
  const { state, setStep, itemCount } = useGiftBuilder()
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL)

  const filtered =
    activeCategory === CATEGORY_ALL
      ? products
      : products.filter((p) => p.category.id === activeCategory)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-10">
        <p className="text-[#B8965C] text-[10px] tracking-[0.35em] uppercase mb-4">
          Step Two
        </p>
        <h2 className="font-serif text-3xl lg:text-5xl font-medium text-[#111111] mb-4">
          Curate Your Selection
        </h2>
        <p className="text-[#8C8C8C] text-sm max-w-md mx-auto leading-relaxed">
          Add up to{" "}
          <span className="text-[#111111] font-medium">
            {state.selectedBox?.maxItems} items
          </span>{" "}
          to your{" "}
          <span className="text-[#111111] font-medium">
            {state.selectedBox?.title}
          </span>
          .
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-12">
        {/* Products */}
        <div>
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-[#e5e5e5]">
            <button
              onClick={() => setActiveCategory(CATEGORY_ALL)}
              className={`px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-200 ${
                activeCategory === CATEGORY_ALL
                  ? "bg-[#111111] text-white"
                  : "border border-[#e5e5e5] text-[#8C8C8C] hover:border-[#C4C4C4] hover:text-[#111111]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#111111] text-white"
                    : "border border-[#e5e5e5] text-[#8C8C8C] hover:border-[#C4C4C4] hover:text-[#111111]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <BuilderProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#C4C4C4] text-sm">
                No products in this category yet.
              </p>
            </div>
          )}
        </div>

        {/* Sticky preview */}
        <div className="hidden lg:block">
          <LiveBoxPreview />
        </div>
      </div>

      {/* Mobile preview bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] px-4 py-3 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs font-medium text-[#111111]">
              {itemCount} of {state.selectedBox?.maxItems} items
            </p>
            <div className="w-24 h-0.5 bg-[#e5e5e5] mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-[#B8965C]"
                animate={{
                  width: `${Math.round((itemCount / (state.selectedBox?.maxItems ?? 1)) * 100)}%`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <button
            onClick={() => setStep("customize")}
            disabled={itemCount === 0}
            className="px-6 py-2.5 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Desktop continue */}
      <div className="hidden lg:flex justify-end mt-10 pt-6 border-t border-[#e5e5e5]">
        <button
          onClick={() => setStep("customize")}
          disabled={itemCount === 0}
          className="px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Personalise
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export default function GiftBuilderClient({
  giftBoxes,
  products,
  categories,
}: GiftBuilderClientProps) {
  const { state } = useGiftBuilder()

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      {/* Hero header */}
      <div className="bg-[#111111] text-white py-16 lg:py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[#B8965C] text-[10px] tracking-[0.4em] uppercase mb-5">
            Luxury Gift Atelier
          </p>
          <h1 className="font-serif text-4xl lg:text-6xl font-light leading-[1.08] mb-5">
            Build Your Own
            <br />
            <em className="not-italic text-[#B8965C]">Gift Box</em>
          </h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            Curate a fragrance experience as unique as the person receiving it.
          </p>
        </motion.div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#e5e5e5] py-6 px-6">
        <BuilderProgress />
      </div>

      {/* Step content */}
      <div className="px-6 lg:px-12 max-w-7xl mx-auto py-12 lg:py-16 pb-24 lg:pb-16">
        <AnimatePresence mode="wait">
          {state.step === "select-box" && (
            <motion.div
              key="select-box"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <SelectBoxStep giftBoxes={giftBoxes} />
            </motion.div>
          )}

          {state.step === "build" && (
            <motion.div
              key="build"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <BuildStep products={products} categories={categories} />
            </motion.div>
          )}

          {state.step === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <CustomizationStep />
            </motion.div>
          )}

          {state.step === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <SummaryStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
