"use client"

import { useActionState, useEffect, useRef, useState, useMemo } from "react"
import Image from "next/image"
import type { PopupFormState } from "../actions"
import type { PopupConfig } from "@prisma/client"
import { useToast } from "@/app/components/ui/Toast"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductOption {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

interface PopupConfigFormProps {
  config: (PopupConfig & { product: ProductOption | null }) | null
  products: ProductOption[]
  updateAction: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-[#B83232] text-[11px] mt-1">{errors[0]}</p>
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium mb-1.5"
    >
      {children}
    </label>
  )
}

function Input({
  id,
  name,
  type = "text",
  value,
  defaultValue,
  onChange,
  placeholder,
  step,
  min,
  max,
  readOnly,
}: {
  id: string
  name: string
  type?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  step?: string
  min?: string
  max?: string
  readOnly?: boolean
}) {
  const props = value !== undefined
    ? { value, onChange: onChange ?? (() => {}) }
    : { defaultValue: defaultValue ?? "" }

  return (
    <input
      id={id}
      name={name}
      type={type}
      {...props}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      readOnly={readOnly}
      className={`w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors ${readOnly ? "bg-[#FAF7F4] cursor-default" : ""}`}
    />
  )
}

// ---------------------------------------------------------------------------
// Product Picker
// ---------------------------------------------------------------------------

function ProductPicker({
  products,
  selectedId,
  onSelect,
}: {
  products: ProductOption[]
  selectedId: string
  onSelect: (product: ProductOption | null) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  const selected = products.find((p) => p.id === selectedId) ?? null

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-left hover:border-[#B8965C] transition-colors focus:outline-none focus:border-[#B8965C]"
      >
        {selected ? (
          <>
            {selected.images[0] && (
              <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-[#F2EDE8]">
                <Image
                  src={selected.images[0]}
                  alt={selected.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="flex-1 truncate text-[#111111]">{selected.name}</span>
            <span className="text-[#8C8C8C] text-xs shrink-0">₦{selected.price.toLocaleString()}</span>
          </>
        ) : (
          <span className="text-[#C4C4C4] flex-1">Select a product…</span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-[#8C8C8C] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#f0ece4]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              autoFocus
              className="w-full px-3 py-2 text-sm bg-[#FAF7F4] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#B8965C] placeholder:text-[#C4C4C4]"
            />
          </div>

          {/* Clear option */}
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); setQuery("") }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8C8C8C] hover:bg-[#FAF7F4] transition-colors border-b border-[#f0ece4]"
          >
            <span className="w-8 h-8 flex items-center justify-center shrink-0 text-[#C4C4C4]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
            No product (manual entry)
          </button>

          {/* Product list */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#8C8C8C]">No products found.</li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(p); setOpen(false); setQuery("") }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[#FAF7F4] transition-colors ${p.id === selectedId ? "bg-[#FAF7F4]" : ""}`}
                  >
                    {p.images[0] ? (
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-[#F2EDE8]">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#F2EDE8] shrink-0" />
                    )}
                    <span className="flex-1 truncate text-[#111111]">{p.name}</span>
                    <span className="text-[#8C8C8C] text-xs shrink-0">₦{p.price.toLocaleString()}</span>
                    {p.id === selectedId && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8965C" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function PopupConfigForm({ config, products, updateAction }: PopupConfigFormProps) {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(updateAction, {})

  // ── Controlled state ──
  const [enabled, setEnabled] = useState(config?.enabled ?? false)
  const [selectedProductId, setSelectedProductId] = useState(config?.productId ?? "")
  const [productName, setProductName] = useState(config?.productName ?? "")
  const [imageUrl, setImageUrl] = useState(config?.imageUrl ?? "")
  const [originalPrice, setOriginalPrice] = useState(
    config?.originalPrice != null ? String(config.originalPrice) : ""
  )
  const [discountPercent, setDiscountPercent] = useState(
    config?.discountPercent != null ? String(config.discountPercent) : ""
  )
  const [ctaUrl, setCtaUrl] = useState(config?.ctaUrl ?? "/shop")

  // Derived discounted price preview
  const discountedPrice = useMemo(() => {
    const price = parseFloat(originalPrice)
    const pct = parseFloat(discountPercent)
    if (!isNaN(price) && !isNaN(pct) && price > 0 && pct > 0) {
      return price - (price * pct) / 100
    }
    return null
  }, [originalPrice, discountPercent])

  // When a product is selected from the picker, auto-fill fields
  function handleProductSelect(product: ProductOption | null) {
    if (!product) {
      setSelectedProductId("")
      return
    }
    setSelectedProductId(product.id)
    setProductName(product.name)
    if (product.images[0]) setImageUrl(product.images[0])
    setOriginalPrice(String(product.price))
    setCtaUrl(`/shop/${product.slug}`)
  }

  useEffect(() => {
    if (state.success) toast("Popup configuration saved.", "success")
    if (state.errors?._form) toast(state.errors._form[0], "error")
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden fields for controlled values */}
      <input type="hidden" name="enabled" value={enabled ? "true" : "false"} />
      <input type="hidden" name="productId" value={selectedProductId} />
      <input type="hidden" name="productName" value={productName} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="originalPrice" value={originalPrice} />
      <input type="hidden" name="ctaUrl" value={ctaUrl} />

      {/* ── Status ── */}
      <section className="bg-white border border-[#e5e5e5] rounded p-5 space-y-4">
        <h2 className="font-serif text-base font-medium text-[#111111]">Status</h2>

        {/* Toggle — fully controlled, no checkbox ambiguity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8965C]"
            style={{ backgroundColor: enabled ? "#B8965C" : "#e5e5e5" }}
          >
            <span
              className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
          <span className="text-sm text-[#111111] select-none">
            {enabled ? "Popup is live" : "Popup is disabled"}
          </span>
          <span
            className={`ml-1 inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase font-medium px-2 py-0.5 rounded-full ${
              enabled ? "bg-[#2E7D52]/10 text-[#2E7D52]" : "bg-[#e5e5e5] text-[#8C8C8C]"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-[#2E7D52]" : "bg-[#C4C4C4]"}`} aria-hidden="true" />
            {enabled ? "Live" : "Off"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date (optional)</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              defaultValue={
                config?.startDate ? new Date(config.startDate).toISOString().slice(0, 16) : ""
              }
            />
            <FieldError errors={state.errors?.startDate} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date (optional)</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={
                config?.endDate ? new Date(config.endDate).toISOString().slice(0, 16) : ""
              }
            />
            <FieldError errors={state.errors?.endDate} />
          </div>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="delaySeconds">Trigger delay (seconds)</Label>
          <Input
            id="delaySeconds"
            name="delaySeconds"
            type="number"
            min="0"
            max="30"
            defaultValue={config?.delaySeconds ?? 4}
          />
          <p className="text-[11px] text-[#8C8C8C] mt-1">
            Seconds after page load before the popup appears.
          </p>
          <FieldError errors={state.errors?.delaySeconds} />
        </div>
      </section>

      {/* ── Product ── */}
      <section className="bg-white border border-[#e5e5e5] rounded p-5 space-y-4">
        <div>
          <h2 className="font-serif text-base font-medium text-[#111111]">Featured Product</h2>
          <p className="text-[11px] text-[#8C8C8C] mt-0.5">
            Selecting a product auto-fills the name, image, price, and CTA link. You can still edit them below.
          </p>
        </div>

        <div>
          <Label htmlFor="productPicker">Product</Label>
          <ProductPicker
            products={products}
            selectedId={selectedProductId}
            onSelect={handleProductSelect}
          />
        </div>

        {/* Product name — editable after auto-fill */}
        <div>
          <Label htmlFor="productNameDisplay">Product Name</Label>
          <input
            id="productNameDisplay"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Oud Noir Eau de Parfum"
            className="w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors"
          />
        </div>

        {/* Image URL — editable after auto-fill */}
        <div>
          <Label htmlFor="imageUrlDisplay">Product Image URL</Label>
          <div className="flex gap-3 items-start">
            <input
              id="imageUrlDisplay"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/…"
              className="flex-1 bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors"
            />
            {imageUrl && (
              <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-[#F2EDE8] border border-[#e5e5e5]">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#8C8C8C] mt-1">
            Leave blank to show a decorative placeholder.
          </p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="originalPriceDisplay">Original Price (₦)</Label>
            <input
              id="originalPriceDisplay"
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="25000"
              className="w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors"
            />
          </div>
          <div>
            <Label htmlFor="discountPercentDisplay">Discount (%)</Label>
            <input
              id="discountPercentDisplay"
              name="discountPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="20"
              className="w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors"
            />
          </div>
        </div>

        {/* Calculated price preview */}
        {discountedPrice !== null && (
          <div className="bg-[#FAF7F4] border border-[#e5e5e5] rounded px-4 py-3 flex flex-wrap items-center gap-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C]">Discounted price:</span>
            <span className="text-[#8C8C8C] text-sm line-through">₦{parseFloat(originalPrice).toLocaleString()}</span>
            <span className="text-[#B8965C] font-serif text-base font-medium">
              ₦{discountedPrice.toLocaleString()}
            </span>
            <span className="ml-auto bg-[#B8965C] text-[#111111] text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 font-semibold">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </section>

      {/* ── Content ── */}
      <section className="bg-white border border-[#e5e5e5] rounded p-5 space-y-4">
        <h2 className="font-serif text-base font-medium text-[#111111]">Copy</h2>

        <div>
          <Label htmlFor="title">Popup Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={config?.title ?? ""}
            placeholder="Get 20% Off Our Best Seller"
          />
          <FieldError errors={state.errors?.title} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={config?.description ?? ""}
            placeholder="Indulge in our most-loved fragrance at an exclusive price. Limited time offer."
            rows={3}
            className="w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors resize-none"
          />
          <FieldError errors={state.errors?.description} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white border border-[#e5e5e5] rounded p-5 space-y-4">
        <h2 className="font-serif text-base font-medium text-[#111111]">Call to Action</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ctaLabel">Button Text</Label>
            <Input
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={config?.ctaLabel ?? "Shop Now"}
              placeholder="Shop Now"
            />
            <FieldError errors={state.errors?.ctaLabel} />
          </div>
          <div>
            <Label htmlFor="ctaUrlDisplay">Button URL</Label>
            <input
              id="ctaUrlDisplay"
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="/shop or /shop/product-slug"
              className="w-full bg-white border border-[#e5e5e5] rounded px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#C4C4C4] focus:outline-none focus:border-[#B8965C] transition-colors"
            />
            <p className="text-[11px] text-[#8C8C8C] mt-1">Auto-filled when a product is selected.</p>
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      {state.errors?._form && (
        <p className="text-[#B83232] text-sm">{state.errors._form[0]}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-6 py-3 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Saving…
            </>
          ) : (
            "Save Configuration"
          )}
        </button>

        {state.success && (
          <span className="text-[#2E7D52] text-xs tracking-wide flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </span>
        )}
      </div>
    </form>
  )
}
