"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { sendCampaignAction, type CampaignState } from "../actions"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

interface CampaignFormProps {
  products: Product[]
  totalAudience: number
}

function SubmitButton({ mode }: { mode: "send" | "schedule" }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-[#B8965C] text-[#111111] text-xs tracking-[0.15em] uppercase px-8 py-3.5 font-semibold hover:bg-[#CBA96E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {mode === "schedule" ? "Scheduling…" : "Sending…"}
        </>
      ) : mode === "schedule" ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Schedule
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send Campaign
        </>
      )}
    </button>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
      {children}
    </label>
  )
}

function inputCls(error?: boolean) {
  return [
    "w-full px-3 py-2.5 border text-sm text-[#111111] bg-white rounded",
    "focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]",
    "placeholder-[#aaa] transition-colors",
    error ? "border-red-400" : "border-[#e5e5e5]",
  ].join(" ")
}

export default function CampaignForm({ products, totalAudience }: CampaignFormProps) {
  const [state, formAction] = useActionState<CampaignState, FormData>(sendCampaignAction, {})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [scheduleMode, setScheduleMode] = useState(false)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((p) => p.id)))
  }

  function clearAll() {
    setSelectedIds(new Set())
  }

  if (state.success) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#2E7D52]/10 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7D52" strokeWidth="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {state.scheduled ? (
          <>
            <p className="font-serif text-2xl font-light text-[#111111]">Campaign scheduled!</p>
            <p className="text-sm text-[#8C8C8C]">
              It will send automatically at the time you chose.
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl font-light text-[#111111]">Campaign sent!</p>
            <p className="text-sm text-[#8C8C8C]">
              Successfully sent to <strong className="text-[#111111]">{state.sentCount}</strong> recipient{state.sentCount !== 1 ? "s" : ""}.
            </p>
          </>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs tracking-[0.15em] uppercase text-[#B8965C] hover:text-[#A07840] transition-colors underline"
        >
          Send another campaign
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.errors?._form && (
        <div role="alert" className="px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
          {state.errors._form[0]}
        </div>
      )}

      {/* ── Recipients ──────────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="sendTo">Send to</Label>
        <div className="relative">
          <select
            id="sendTo"
            name="sendTo"
            defaultValue="all"
            className={inputCls() + " appearance-none"}
          >
            <option value="all">Everyone (newsletter subscribers + customers)</option>
            <option value="subscribers">Newsletter subscribers only</option>
            <option value="customers">Registered customers only</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </div>
      </div>

      {/* ── Email content ────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <Label htmlFor="subject">Email subject line</Label>
          <input
            id="subject" name="subject" type="text" required
            placeholder="e.g. New arrivals just dropped 🌿"
            className={inputCls(!!state.errors?.subject)}
          />
          {state.errors?.subject && (
            <p className="mt-1 text-xs text-red-600">{state.errors.subject[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="headline">Email headline</Label>
          <input
            id="headline" name="headline" type="text" required
            placeholder="e.g. Discover Our Latest Collection"
            className={inputCls(!!state.errors?.headline)}
          />
          {state.errors?.headline && (
            <p className="mt-1 text-xs text-red-600">{state.errors.headline[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bodyText">Short message (optional)</Label>
          <textarea
            id="bodyText" name="bodyText" rows={3}
            placeholder="Add a short message to go below the headline…"
            className={inputCls() + " resize-none"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ctaLabel">Button label</Label>
            <input
              id="ctaLabel" name="ctaLabel" type="text"
              defaultValue="Shop Now"
              className={inputCls()}
            />
          </div>
          <div>
            <Label htmlFor="ctaUrl">Button link</Label>
            <input
              id="ctaUrl" name="ctaUrl" type="text"
              defaultValue="/shop"
              placeholder="/shop or full URL"
              className={inputCls()}
            />
          </div>
        </div>
      </div>

      {/* ── Product selector ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="productSearch">
            Products to feature
            {selectedIds.size > 0 && (
              <span className="ml-2 normal-case text-[#B8965C]">({selectedIds.size} selected)</span>
            )}
          </Label>
          <div className="flex gap-3 text-[10px] tracking-[0.12em] uppercase">
            <button type="button" onClick={selectAll} className="text-[#8C8C8C] hover:text-[#B8965C] transition-colors">
              Select all
            </button>
            {selectedIds.size > 0 && (
              <button type="button" onClick={clearAll} className="text-[#8C8C8C] hover:text-red-600 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>

        <input
          id="productSearch"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className={inputCls() + " mb-3"}
        />

        {state.errors?.productIds && (
          <p className="mb-2 text-xs text-red-600">{state.errors.productIds[0]}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((product) => {
            const selected = selectedIds.has(product.id)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                aria-pressed={selected}
                className={[
                  "relative flex flex-col text-left border rounded transition-all duration-200 overflow-hidden",
                  selected
                    ? "border-[#B8965C] ring-1 ring-[#B8965C]"
                    : "border-[#e5e5e5] hover:border-[#B8965C]/50",
                ].join(" ")}
              >
                {/* Hidden input for form submission */}
                {selected && (
                  <input type="hidden" name="productIds" value={product.id} />
                )}

                {/* Checkmark */}
                <div className={[
                  "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-colors",
                  selected ? "border-[#B8965C] bg-[#B8965C]" : "border-white/70 bg-white/50",
                ].join(" ")}>
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Image */}
                <div className="aspect-[3/4] bg-[#F2EDE8] relative overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-12 rounded-full bg-[#B8965C]/10" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-[#111111] leading-snug line-clamp-2">{product.name}</p>
                  <p className="text-[10px] text-[#B8965C] font-semibold mt-1">₦{product.price.toLocaleString()}</p>
                </div>
              </button>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-[#8C8C8C]">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule or send ─────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
        {/* Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScheduleMode(false)}
            className={`text-xs tracking-[0.12em] uppercase px-4 py-2 rounded transition-colors ${
              !scheduleMode ? "bg-[#111111] text-white" : "bg-[#f5f5f5] text-[#8C8C8C] hover:text-[#111111]"
            }`}
          >
            Send Now
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode(true)}
            className={`text-xs tracking-[0.12em] uppercase px-4 py-2 rounded transition-colors ${
              scheduleMode ? "bg-[#111111] text-white" : "bg-[#f5f5f5] text-[#8C8C8C] hover:text-[#111111]"
            }`}
          >
            Schedule
          </button>
        </div>

        {scheduleMode && (
          <div>
            <Label htmlFor="scheduledAt">Send date &amp; time</Label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required={scheduleMode}
              min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
              className={inputCls(!!state.errors?.scheduledAt)}
            />
            {state.errors?.scheduledAt && (
              <p className="mt-1 text-xs text-red-600">{state.errors.scheduledAt[0]}</p>
            )}
            <p className="mt-1 text-[10px] text-[#8C8C8C]">
              Time is in your local timezone. Campaigns send within 1 hour of the scheduled time.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-[#8C8C8C]">
            {selectedIds.size === 0
              ? "Select products to feature in the email."
              : `${selectedIds.size} product${selectedIds.size !== 1 ? "s" : ""} · ${totalAudience.toLocaleString()} recipients`}
          </p>
          <SubmitButton mode={scheduleMode ? "schedule" : "send"} />
        </div>
      </div>
    </form>
  )
}
