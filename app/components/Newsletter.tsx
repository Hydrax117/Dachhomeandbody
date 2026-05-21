"use client"

import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A] text-white text-center px-6">
      <p className="text-[#B8965C] text-xs tracking-[0.3em] uppercase mb-4">Stay Connected</p>
      <h2 className="font-serif text-white text-3xl lg:text-5xl font-medium mb-4">
        Join the DACH experience.
      </h2>
      <p className="text-white/50 text-sm lg:text-base max-w-md mx-auto mb-10">
        Be the first to discover new arrivals, exclusive offers, and curated gift ideas for the luxury &amp; wellness lifestyle.
      </p>

      {submitted ? (
        <p className="text-[#B8965C] tracking-wide">Thank you for joining us.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            aria-label="Email address for newsletter"
            className="flex-1 bg-white/5 border border-white/20 px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#B8965C] transition-colors"
          />
          <button
            type="submit"
            className="bg-[#B8965C] text-[#111111] px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#A07840] transition-colors duration-300 whitespace-nowrap min-h-[52px]"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  )
}
