"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

interface PayerCheckoutItem {
  productId: string; variantId: string | null; variantName: string | null
  quantity: number; price: number; name: string; image: string | null
}
interface PayerCheckoutAddress {
  name: string; phone: string; address: string; city: string
  state: string | null; postalCode: string; country: string
}
interface PayerCheckoutProps {
  token: string
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"
  requesterName: string | null
  requesterEmail: string
  items: PayerCheckoutItem[]
  shippingAddress: PayerCheckoutAddress
  subtotal: number; discount: number; shippingCost: number; total: number
  expiresAt: string; couponCode: string | null
}

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`
}

function InactiveState({ status, requesterName }: { status: "PAID" | "EXPIRED" | "CANCELLED"; requesterName: string | null }) {
  const cfg = {
    PAID: { color: "#16a34a", bg: "bg-green-50 border-green-200", title: "Already paid", desc: requesterName ? `This order for ${requesterName} has already been paid for.` : "This payment link has already been used." },
    EXPIRED: { color: "#d97706", bg: "bg-yellow-50 border-yellow-200", title: "Link expired", desc: "This payment link has expired. Ask the requester to create a new one." },
    CANCELLED: { color: "#dc2626", bg: "bg-red-50 border-red-200", title: "Link cancelled", desc: "This payment link has been cancelled." },
  }[status]
  return (
    <main className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-sm tracking-[0.22em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors block mb-10">Dachhomeandbody</Link>
        <div className={`w-16 h-16 rounded-full border-2 ${cfg.bg} flex items-center justify-center mx-auto mb-6`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.5" aria-hidden="true">
            {status === "PAID" ? <polyline points="20 6 9 17 4 12" /> : status === "EXPIRED" ? <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-light text-[#111111] mb-3">{cfg.title}</h1>
        <p className="text-sm text-[#8C8C8C] mb-8">{cfg.desc}</p>
        <Link href="/shop" className="btn-primary">Browse our collection</Link>
      </div>
    </main>
  )
}

export function PayerCheckout({ token, status, requesterName, requesterEmail, items, shippingAddress, subtotal, discount, shippingCost, total, expiresAt, couponCode }: PayerCheckoutProps) {
  const [payerEmail, setPayerEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (status !== "PENDING") return <InactiveState status={status} requesterName={requesterName} />

  async function handlePay() {
    setEmailError(null); setError(null)
    if (!payerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      setEmailError("Please enter a valid email address."); return
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/payment/initialize-pay-request", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, payerEmail }),
        })
        const data = await res.json() as { authorizationUrl?: string; error?: string }
        if (!res.ok || data.error) { setError(data.error ?? "Failed to initialize payment."); return }
        if (data.authorizationUrl) window.location.href = data.authorizationUrl
      } catch { setError("Something went wrong. Please try again.") }
    })
  }

  return (
    <main className="min-h-screen bg-[#F8F5F2] pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="py-6 border-b border-[#EBEBEB] mb-8 text-center">
          <Link href="/" className="font-serif text-sm tracking-[0.22em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors">Dachhomeandbody</Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs text-[#B8965C] bg-[#B8965C]/10 border border-[#B8965C]/20 px-3 py-1.5 rounded-full mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            Pay-for-me request
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-light text-[#111111] mb-2">
            {requesterName ? <>Pay for <span className="text-[#B8965C]">{requesterName}&apos;s</span> order</> : "Complete this order"}
          </h1>
          <p className="text-sm text-[#8C8C8C]">Review the items and complete payment. The order will be delivered to the requester.</p>
          <p className="mt-3 text-xs text-[#8C8C8C]">
            <span className="inline-flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {timeLeft(expiresAt)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            {/* Items */}
            <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4]">
                <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Items ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
              </div>
              <ul>
                {items.map((item, idx) => (
                  <li key={`${item.productId}-${item.variantId ?? "base"}`} className={`flex items-start gap-3 px-4 py-4 ${idx < items.length - 1 ? "border-b border-[#f0ece4]" : ""}`}>
                    <div className="w-12 h-14 shrink-0 rounded border border-[#e5e5e5] bg-[#f5f0e8] overflow-hidden">
                      {item.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] leading-snug">{item.name}</p>
                      {item.variantName && <p className="text-xs text-[#8C8C8C] mt-0.5">{item.variantName}</p>}
                      <p className="text-xs text-[#8C8C8C] mt-1">{fmt(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-[#111111] shrink-0">{fmt(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Delivery */}
            <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4]"><h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Delivering to</h2></div>
              <div className="px-5 py-4">
                <p className="text-sm font-medium text-[#111111]">{shippingAddress.name}</p>
                <p className="text-xs text-[#8C8C8C] mt-1">{shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ""} · {shippingAddress.country}</p>
                <p className="text-[11px] text-[#C4C4C4] mt-2">Full delivery address is kept private.</p>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            {/* Summary */}
            <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4]"><h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Order summary</h2></div>
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-[#8C8C8C]">Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#B8965C]">Discount{couponCode ? ` (${couponCode})` : ""}</span><span className="text-[#B8965C]">−{fmt(discount)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#8C8C8C]">Shipping</span><span className="text-[#8C8C8C]">{shippingCost === 0 ? "Free" : fmt(shippingCost)}</span></div>
                <div className="border-t border-[#f0ece4] pt-3 flex justify-between">
                  <span className="font-serif font-medium text-[#111111]">Total</span>
                  <span className="font-serif font-medium text-[#111111] text-base">{fmt(total)}</span>
                </div>
              </div>
            </section>

            {/* Pay form */}
            <section className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4]"><h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">Your email</h2></div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label htmlFor="payer-email" className="block text-xs text-[#8C8C8C] mb-1.5">We&apos;ll send your payment receipt to this address</label>
                  <input
                    id="payer-email" type="email" value={payerEmail} autoComplete="email"
                    onChange={(e) => { setPayerEmail(e.target.value); setEmailError(null) }}
                    placeholder="your@email.com"
                    className={`w-full px-3 py-2.5 text-sm border rounded-sm bg-white focus:outline-none focus:border-[#B8965C] transition-colors ${emailError ? "border-red-300" : "border-[#EBEBEB]"}`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>
                {error && <div role="alert" className="px-3 py-2.5 border border-red-200 bg-red-50 text-red-700 text-xs rounded-sm">{error}</div>}
                <button type="button" onClick={handlePay} disabled={isPending} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed" aria-busy={isPending}>
                  {isPending ? "Redirecting to payment…" : (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Pay {fmt(total)} Securely
                    </span>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#C4C4C4] tracking-wide">Secured by Paystack · One-time payment link</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
