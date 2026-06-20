"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { createInStoreSaleAction, type InStoreSaleState } from "../actions"

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductOption {
  id: string
  name: string
  sku: string
  stock: number
  price: number
  variants: Array<{
    id: string
    name: string
    sku: string
    stock: number
    price: number
  }>
}

interface SaleLineItem {
  productId: string
  variantId: string | null
  variantName: string | null
  productName: string
  sku: string
  quantity: number
  price: number
  maxStock: number
}

// ── Submit button ──────────────────────────────────────────────────────────

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full py-3 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
    >
      {pending ? "Recording sale…" : "Record Sale"}
    </button>
  )
}

// ── Formatters ─────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

// ── Main component ─────────────────────────────────────────────────────────

interface InStoreSaleFormProps {
  products: ProductOption[]
}

export default function InStoreSaleForm({ products }: InStoreSaleFormProps) {
  const [state, formAction] = useActionState(createInStoreSaleAction, {})
  const formRef = useRef<HTMLFormElement>(null)

  const [lineItems, setLineItems] = useState<SaleLineItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState("")

  // Reset form after success
  useEffect(() => {
    if (state.success) {
      setLineItems([])
      setSelectedProductId("")
      setSelectedVariantId("")
      formRef.current?.reset()
    }
  }, [state.success])

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId)

  function addItem() {
    if (!selectedProduct) return

    const price = selectedVariant ? selectedVariant.price : selectedProduct.price
    const stock = selectedVariant ? selectedVariant.stock : selectedProduct.stock
    const sku = selectedVariant ? selectedVariant.sku : selectedProduct.sku

    // Merge with existing line if same product+variant
    const existingIdx = lineItems.findIndex(
      (l) => l.productId === selectedProductId && l.variantId === (selectedVariantId || null)
    )

    if (existingIdx >= 0) {
      setLineItems((prev) =>
        prev.map((l, i) =>
          i === existingIdx
            ? { ...l, quantity: Math.min(l.quantity + 1, l.maxStock) }
            : l
        )
      )
    } else {
      setLineItems((prev) => [
        ...prev,
        {
          productId: selectedProductId,
          variantId: selectedVariantId || null,
          variantName: selectedVariant?.name ?? null,
          productName: selectedProduct.name,
          sku,
          quantity: 1,
          price,
          maxStock: stock,
        },
      ])
    }

    setSelectedProductId("")
    setSelectedVariantId("")
  }

  function removeItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateQty(idx: number, qty: number) {
    setLineItems((prev) =>
      prev.map((l, i) =>
        i === idx ? { ...l, quantity: Math.max(1, Math.min(qty, l.maxStock)) } : l
      )
    )
  }

  const subtotal = lineItems.reduce((sum, l) => sum + l.price * l.quantity, 0)

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 space-y-6">
      <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium">
        New In-Store Sale
      </h2>

      {/* Success banner */}
      {state.success && state.saleNumber && (
        <div role="status" className="border border-green-300 bg-green-50 text-green-800 px-4 py-3 rounded text-sm">
          Sale recorded — <span className="font-medium">{state.saleNumber}</span>. Stock has been updated.
        </div>
      )}

      {/* Form error */}
      {state.errors?._form && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded text-sm">
          {state.errors._form[0]}
        </div>
      )}

      {/* Product picker */}
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C]">Add Product</p>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value)
              setSelectedVariantId("")
            }}
            className="flex-1 min-w-[200px] px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
          >
            <option value="">— Select product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                {p.name}{p.stock === 0 ? " (out of stock)" : ` (${p.stock})`}
              </option>
            ))}
          </select>

          {selectedProduct && selectedProduct.variants.length > 0 && (
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="flex-1 min-w-[160px] px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
            >
              <option value="">— Select variant —</option>
              {selectedProduct.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock === 0}>
                  {v.name}{v.stock === 0 ? " (out of stock)" : ` (${v.stock})`}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={addItem}
            disabled={
              !selectedProductId ||
              (selectedProduct?.variants.length ? !selectedVariantId : false)
            }
            className="px-4 py-2.5 bg-[#F8F5F2] border border-[#e5e5e5] text-sm text-[#111111] rounded hover:bg-[#f0ece4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Line items */}
      {lineItems.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F5F2] border-b border-[#e5e5e5]">
                <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] font-medium">Product</th>
                <th className="text-center px-3 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] font-medium">Qty</th>
                <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] font-medium">Price</th>
                <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#8C8C8C] font-medium">Subtotal</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111111]">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-[#8C8C8C]">{item.variantName}</p>
                    )}
                    <p className="text-[10px] text-[#aaa] font-mono">{item.sku}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={item.maxStock}
                      value={item.quantity}
                      onChange={(e) => updateQty(idx, parseInt(e.target.value, 10) || 1)}
                      className="w-16 text-center px-2 py-1 border border-[#e5e5e5] text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C]"
                    />
                    <p className="text-[10px] text-[#aaa] mt-0.5">max {item.maxStock}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#8C8C8C]">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#111111]">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[#aaa] hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#e5e5e5] bg-[#F8F5F2]">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-[#111111]">Total</td>
                <td className="px-4 py-3 text-right font-serif text-base font-medium text-[#111111]">
                  {formatCurrency(subtotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Sale details form */}
      <form action={formAction} ref={formRef} className="space-y-4">
        {/* Hidden items payload */}
        <input type="hidden" name="items" value={JSON.stringify(lineItems)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer name */}
          <div>
            <label htmlFor="customerName" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
              Customer Name (optional)
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Walk-in customer"
              className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
            />
          </div>

          {/* Payment method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              defaultValue="CASH"
              className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]"
            >
              <option value="CASH">Cash</option>
              <option value="POS">POS / Card</option>
              <option value="TRANSFER">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="saleNotes" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
            Notes (optional)
          </label>
          <input
            id="saleNotes"
            name="notes"
            type="text"
            maxLength={500}
            placeholder="Any additional notes…"
            className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
          />
        </div>

        <SubmitButton disabled={lineItems.length === 0} />
      </form>
    </div>
  )
}
