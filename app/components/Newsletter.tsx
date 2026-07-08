"use client"

import { useActionState } from "react"
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter"

const initialState: NewsletterState = {}

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState)

  return (
    <section className="relative overflow-hidden bg-[#111111] py-20 sm:py-28 lg:py-40">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgb(184 150 92 / 0.07) 0%, transparent 60%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgb(184 150 92 / 0.25), transparent)" }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 px-5 sm:px-8 lg:px-16 max-w-2xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-8 h-px bg-[#B8965C]/40" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.4em] uppercase">Stay Connected</p>
          <div className="w-8 h-px bg-[#B8965C]/40" aria-hidden="true" />
        </div>

        {/* Headline */}
        <h2
          className="font-serif text-white font-light leading-[1.1] mb-5 sm:mb-6"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
        >
          Join the<br />
          <em className="not-italic" style={{
            background: "linear-gradient(90deg, #CBA96E 0%, #B8965C 50%, #8C6E3A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>DACH experience</em>.
        </h2>

        <p className="text-white/35 text-sm lg:text-base leading-[1.9] max-w-md mx-auto mb-10 sm:mb-12 font-light">
          Be the first to discover new arrivals, exclusive offers, and curated rituals
          for the luxury &amp; wellness lifestyle.
        </p>

        {state.success ? (
          <div className="py-8">
            <div className="w-10 h-10 rounded-full border border-[#B8965C]/30 flex items-center justify-center mx-auto mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="1.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[#B8965C] text-sm tracking-[0.15em]">Thank you for joining us.</p>
            <p className="text-white/25 text-xs mt-2 tracking-wide">Expect something beautiful in your inbox.</p>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              required
              aria-label="Email address for newsletter"
              aria-describedby={state.error ? "newsletter-error" : undefined}
              className="flex-1 bg-white/5 border border-white/10 px-5 sm:px-6 py-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#B8965C] transition-colors duration-300 min-h-[52px]"
            />
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="bg-[#B8965C] text-[#111111] px-7 sm:px-8 py-4 text-[10px] tracking-[0.3em] uppercase font-medium hover:bg-[#CBA96E] transition-colors duration-300 whitespace-nowrap min-h-[52px] disabled:opacity-60"
            >
              {pending ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        {state.error && (
          <p id="newsletter-error" role="alert" className="text-red-400 text-xs mt-3 tracking-wide">
            {state.error}
          </p>
        )}

        {!state.success && (
          <p className="text-white/15 text-[10px] tracking-wide mt-4 sm:mt-5">
            No spam. Unsubscribe at any time.
          </p>
        )}
      </div>
    </section>
  )
}
