"use client"

import { motion } from "framer-motion"
import type { Message } from "./ChatWidget"

interface Props {
  messages: Message[]
  isLoading: boolean
}

// Very simple markdown-like renderer: bolds **text** and turns /links into anchors
function renderText(text: string) {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-semibold text-[#111111]">{part.slice(2, -2)}</strong>
      }
      // Turn /shop/... links into anchor tags
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
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

function UserBubble({ message }: { message: Message }) {
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

function AssistantBubble({ message }: { message: Message }) {
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
      <div className="max-w-[82%] px-4 py-2.5 bg-white border border-[#EBEBEB] text-[#111111] text-[13px] leading-relaxed font-sans shadow-[0_1px_4px_0_rgb(17_17_17/0.06)]">
        {renderText(message.text)}
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
