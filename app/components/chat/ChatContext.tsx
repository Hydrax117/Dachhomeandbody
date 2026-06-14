"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProductCard {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  products?: ProductCard[]
  createdAt: number // timestamp for JSON serialisation
}

interface GeminiTurn {
  role: "user" | "model"
  parts: [{ text: string }]
}

interface ChatContextValue {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  input: string
  sessionId: string
  setInput: (v: string) => void
  setIsOpen: (v: boolean) => void
  sendMessage: (text: string) => void
}

// ── Storage key ────────────────────────────────────────────────────────────

const STORAGE_KEY = "dach_chat_messages"
const SESSION_KEY = "dach_chat_session"
const MAX_STORED = 40 // keep last 40 messages in localStorage

// ── Context ────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null)

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider")
  return ctx
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [hydrated, setHydrated] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasGreeted = useRef(false)

  // ── Hydrate from localStorage ──────────────────────────────────────────

  useEffect(() => {
    // Session ID
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, sid)
    }
    setSessionId(sid)

    // Messages
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          hasGreeted.current = true
        }
      }
    } catch {
      // Corrupted storage — start fresh
    }
    setHydrated(true)
  }, [])

  // ── Persist to localStorage when messages change ───────────────────────

  useEffect(() => {
    if (!hydrated) return
    const toStore = messages.slice(-MAX_STORED)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  }, [messages, hydrated])

  // ── Greeting on first open ─────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !hasGreeted.current && hydrated) {
      hasGreeted.current = true
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          text: "Hello! I'm Dach, your personal shopping assistant. Whether you're looking for the perfect scent, skincare, or a gift — I'm here to help. What can I find for you today?",
          createdAt: Date.now(),
        },
      ])
    }
  }, [isOpen, hydrated])

  // ── Convert messages to Gemini history format ──────────────────────────

  const toGeminiHistory = useCallback((msgs: ChatMessage[]): GeminiTurn[] =>
    msgs.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })), [])

  // ── Send message with debounce guard ───────────────────────────────────

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    // Debounce: ignore if called again within 300ms (accidental double send)
    if (debounceRef.current) return
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
    }, 300)

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Capture history before adding the new user message
    setMessages((prev) => {
      const historyForApi = toGeminiHistory(prev.slice(0, -1)) // exclude the userMsg we just added

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          sessionId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error)
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: data.reply,
            products: data.products,
            createdAt: Date.now(),
          }
          setMessages((cur) => [...cur, assistantMsg])
        })
        .catch(() => {
          setMessages((cur) => [
            ...cur,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              text: "Sorry, I ran into an issue. Please try again or contact us at 07064313141.",
              createdAt: Date.now(),
            },
          ])
        })
        .finally(() => setIsLoading(false))

      return prev // no state change here — just side-effect
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, sessionId, toGeminiHistory])

  return (
    <ChatContext.Provider
      value={{ isOpen, messages, isLoading, input, sessionId, setInput, setIsOpen, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  )
}
