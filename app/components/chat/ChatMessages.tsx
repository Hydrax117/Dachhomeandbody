"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { ChatMessage, ProductCard } from "./ChatContext"

interface Props {
  messages: ChatMessage[]
  isLoading: boolean
}

// ── Inline text renderer ───────────────────────────────────────────────────
// Handles **bold**, /path links

function renderText(text: string) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-[#111111]">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return (
        <span key={j}>
          {part.split(/(\/[a-z][a-z0-9/-]+)/).map((chunk, k) => {
            if (/^\/[a-z][a-z0-9/-]+$/.test(chunk)) {
              return (
                <a
                  key={k}
                  href={chunk}
                  className="text-[#B8965C] underline underline-offset-2 hover:text-[#8C6E3A] transition-colors"
                >
                  {chunk}
                </a>
              )
            }
            return chunk
          })}
        </span>
      )
    })
    return (
      <span key={i}>
        {rendered}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

// ── Product card ───────────────────────────────────────────────────────────

function ChatProductCard({ product }: { product: ProductCard }) {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(product.price)

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="flex items-center gap-3 p-2.5 bg-[#F8F5F2] border border-[#EBEBEB] hover:border-[#B8965C]/50 hover:bg-[#B8965C]/5 transition-all duration-200 group"
    >
      {/* Image */}
      <div className="w-14 h-14 bg-[#EBEBEB] shrink-0 overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="56px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#C4C4C4] text-lg font-serif">D</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#111111] truncate leading-snug">
          {product.name}
        </p>
        <p className="text-[10px] text-[#8C8C8C] tracking-wider uppercase mt-0.5">
          {product.category}
        </p>
        <p className="text-[12px] text-[#B8965C] font-medium mt-1">{formatted}</p>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#B8965C"
        strokeWidth="2"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  )
}

// ── Bubbles ────────────────────────────────────────────────────────────────

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] px-4 py-2.5 bg-[#111111] text-white text-[13px] leading-relaxed font-sans">
        {message.text}
      </div>
    </motion.div>
  )
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start gap-2.5"
    >
      {/* Avatar */}
      <div className="w-6 h-6 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/40 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#B8965C] text-[9px] font-serif">D</span>
      </div>

      <div className="max-w-[82%] flex flex-col gap-2">
        {/* Text bubble */}
        <div className="px-4 py-2.5 bg-white border border-[#EBEBEB] text-[#111111] text-[13px] leading-relaxed font-sans shadow-[0_1px_4px_0_rgb(17_17_17/0.06)]">
          {renderText(message.text)}
        </div>

        {/* Product cards */}
        {message.products && message.products.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {message.products.map((product) => (
              <ChatProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start gap-2.5"
    >
      <div className="w-6 h-6 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/40 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#B8965C] text-[9px] font-serif">D</span>
      </div>
      <div className="px-4 py-3 bg-white border border-[#EBEBEB] shadow-[0_1px_4px_0_rgb(17_17_17/0.06)]">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#B8965C]/60"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

export default function ChatMessages({ messages, isLoading }: Props) {
  if (messages.length === 0 && !isLoading) return null

  return (
    <div className="space-y-3">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <UserBubble key={msg.id} message={msg} />
        ) : (
          <AssistantBubble key={msg.id} message={msg} />
        )
      )}
      {isLoading && <TypingIndicator />}
    </div>
  )
}
