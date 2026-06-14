"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useChatContext } from "./ChatContext"
import ChatMessages from "./ChatMessages"

const SUGGESTED_PROMPTS = [
  "What scents do you have?",
  "Help me pick a gift",
  "Best sellers under ₦10,000",
  "What's good for sensitive skin?",
  "Where is my order?",
]

export default function ChatWidget() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, messages, isLoading, input, setInput, sendMessage } = useChatContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputTimeout, setInputTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null

  // Auto-scroll to bottom
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  // ── Debounced send: wait 400ms of no typing before allowing send ──────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (inputTimeout) clearTimeout(inputTimeout)
    // debounce state reset (just clears the timeout, sendMessage has its own guard)
    const t = setTimeout(() => setInputTimeout(null), 400)
    setInputTimeout(t)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputTimeout) return // still typing, wait for debounce
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasUserMessages = messages.some((m) => m.role === "user")

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-24 left-6 z-[55] w-[calc(100vw-3rem)] max-w-[400px] flex flex-col"
            style={{
              height: "min(580px, calc(100dvh - 7rem))",
              boxShadow:
                "0 16px 48px 0 rgb(17 17 17 / 0.20), 0 0 0 1px rgb(17 17 17 / 0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#111111] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/40 flex items-center justify-center shrink-0">
                  <span className="text-[#B8965C] text-xs font-serif">D</span>
                </div>
                <div>
                  <p className="text-white text-[13px] font-medium tracking-wide">
                    Dach Assistant
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <p className="text-white/40 text-[10px] tracking-widest uppercase">
                      Online
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#F8F5F2] px-4 py-4 space-y-3 scroll-smooth">
              <ChatMessages messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts — shown only before any user message */}
            {!hasUserMessages && !isLoading && (
              <div className="bg-[#F8F5F2] px-4 pb-3 flex flex-wrap gap-2 shrink-0">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-[10px] tracking-wider uppercase px-3 py-1.5 border border-[#B8965C]/40 text-[#8C6E3A] hover:bg-[#B8965C]/10 hover:border-[#B8965C] transition-all duration-200 whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 bg-white border-t border-[#EBEBEB] shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a product…"
                maxLength={1000}
                disabled={isLoading}
                aria-label="Chat message"
                className="flex-1 bg-transparent text-[13px] text-[#111111] placeholder:text-[#8C8C8C] outline-none font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="w-8 h-8 flex items-center justify-center bg-[#111111] hover:bg-[#B8965C] disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200 shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* Brand footer */}
            <div className="bg-white px-4 pb-3 flex items-center justify-center shrink-0">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#C4C4C4]">
                DACH Home &amp; Body · Abuja, Nigeria
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
        className="fixed bottom-6 left-6 z-[55] w-14 h-14 bg-[#111111] hover:bg-[#1A1A1A] flex items-center justify-center shadow-[0_8px_32px_0_rgb(17_17_17/0.25)] hover:shadow-[0_8px_40px_0_rgb(184_150_92/0.3)] transition-all duration-500"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8965C"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8965C"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
