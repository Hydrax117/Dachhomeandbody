"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, type?: ToastType, duration?: number) => void
  dismiss: (id: string) => void
}

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, type, duration }])
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ── Individual Toast ───────────────────────────────────────────────────────

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
}

const styles: Record<ToastType, string> = {
  success: "border-l-[var(--color-success)] bg-[var(--color-warm-white)]",
  error:   "border-l-[var(--color-error)] bg-[var(--color-warm-white)]",
  warning: "border-l-[var(--color-champagne-gold)] bg-[var(--color-warm-white)]",
  info:    "border-l-[var(--color-matte-black)] bg-[var(--color-warm-white)]",
}

const iconStyles: Record<ToastType, string> = {
  success: "text-[var(--color-success)]",
  error:   "text-[var(--color-error)]",
  warning: "text-[var(--color-champagne-gold)]",
  info:    "text-[var(--color-matte-black)]",
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10)

    // Auto-dismiss
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setTimeout(() => dismiss(toast.id), 300)
      }, toast.duration)
    }

    return () => {
      clearTimeout(enterTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, dismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "flex items-start gap-3 px-4 py-3 rounded-sm shadow-md border-l-4",
        "min-w-[280px] max-w-[380px] transition-all duration-300",
        styles[toast.type],
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
      ].join(" ")}
    >
      <span className={["text-sm font-semibold mt-0.5 shrink-0", iconStyles[toast.type]].join(" ")}>
        {icons[toast.type]}
      </span>
      <p className="text-sm font-sans text-[var(--color-foreground)] flex-1 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => dismiss(toast.id), 300)
        }}
        aria-label="Dismiss notification"
        className="shrink-0 text-[var(--color-warm-gray)] hover:text-[var(--color-foreground)] transition-colors text-xs mt-0.5"
      >
        ✕
      </button>
    </div>
  )
}

// ── Container ──────────────────────────────────────────────────────────────

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}
