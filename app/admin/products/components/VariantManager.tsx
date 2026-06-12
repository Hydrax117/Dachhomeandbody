"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import type { VariantActionState } from "../actions"

// ── Types ──────────────────────────────────────────────────────────────────

export interface VariantRow {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  sortOrder: number
}

interface VariantManagerProps {
  productId: string
  variants: VariantRow[]
  createAction: (prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
  updateAction: (variantId: string, prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
  deleteAction: (variantId: string) => Promise<{ error?: string }>
  updateStockAction: (variantId: string, prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)

function inputCls(error?: string) {
  return [
    "w-full px-3 py-2 border text-sm text-[#111111] bg-white rounded",
    "focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C]",
    "placeholder-[#aaa] transition-colors",
    error ? "border-red-400" : "border-[#e5e5e5]",
  ].join(" ")
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600" role="alert">{message}</p>
}

function SubmitBtn({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.1em] uppercase px-4 py-2 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

// ── Stock badge ────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-[10px] px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">Out of Stock</span>
  if (stock <= 5) return <span className="text-[10px] px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">Low ({stock})</span>
  return <span className="text-[10px] px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">In Stock ({stock})</span>
}

// ── Variant form (shared for create + edit) ────────────────────────────────

function VariantForm({
  state,
  formAction,
  defaultValues,
  submitLabel,
  submitPendingLabel,
  onCancel,
}: {
  state: VariantActionState
  formAction: (formData: FormData) => void
  defaultValues?: Partial<VariantRow>
  submitLabel: string
  submitPendingLabel: string
  onCancel?: () => void
}) {
  return (
    <form action={formAction} className="space-y-4 bg-[#F8F5F2] border border-[#e5e5e5] rounded-lg p-5">
      {state.errors?._form && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded" role="alert">
          {state.errors._form[0]}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <Label htmlFor="v-name" required>Variant Name</Label>
          <input id="v-name" name="name" type="text" required defaultValue={defaultValues?.name ?? ""} placeholder="e.g. 100ml, 250g" className={inputCls(state.errors?.name?.[0])} />
          <FieldError message={state.errors?.name?.[0]} />
        </div>

        {/* SKU */}
        <div>
          <Label htmlFor="v-sku" required>SKU</Label>
          <input id="v-sku" name="sku" type="text" required defaultValue={defaultValues?.sku ?? ""} placeholder="DHB-PROD-100ML" className={inputCls(state.errors?.sku?.[0])} />
          <FieldError message={state.errors?.sku?.[0]} />
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="v-price" required>Price (₦)</Label>
          <input id="v-price" name="price" type="number" required min="0" step="0.01" defaultValue={defaultValues?.price ?? ""} placeholder="25000" className={inputCls(state.errors?.price?.[0])} />
          <FieldError message={state.errors?.price?.[0]} />
        </div>

        {/* Compare At Price */}
        <div>
          <Label htmlFor="v-compare">Compare At Price (₦)</Label>
          <input id="v-compare" name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={defaultValues?.compareAtPrice ?? ""} placeholder="30000" className={inputCls()} />
        </div>

        {/* Stock */}
        <div>
          <Label htmlFor="v-stock" required>Stock</Label>
          <input id="v-stock" name="stock" type="number" required min="0" step="1" defaultValue={defaultValues?.stock ?? 0} className={inputCls(state.errors?.stock?.[0])} />
          <FieldError message={state.errors?.stock?.[0]} />
        </div>

        {/* Sort Order */}
        <div>
          <Label htmlFor="v-sort">Sort Order</Label>
          <input id="v-sort" name="sortOrder" type="number" min="0" step="1" defaultValue={defaultValues?.sortOrder ?? 0} className={inputCls()} />
          <p className="mt-1 text-[10px] text-[#aaa]">Lower numbers appear first</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitBtn label={submitLabel} pendingLabel={submitPendingLabel} />
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs text-[#8C8C8C] hover:text-[#111111] transition-colors px-3 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

// ── Inline stock adjuster ──────────────────────────────────────────────────

function StockAdjuster({
  variantId,
  currentStock,
  updateStockAction,
}: {
  variantId: string
  currentStock: number
  updateStockAction: (variantId: string, prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
}) {
  const boundAction = updateStockAction.bind(null, variantId)
  const [state, formAction] = useActionState(boundAction, {})
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-[#8C8C8C] hover:text-[#B8965C] transition-colors underline underline-offset-2"
      >
        Adjust stock
      </button>
    )
  }

  return (
    <form action={formAction} className="flex items-center gap-2 mt-1">
      {state.success && <span className="text-[10px] text-green-600">Updated</span>}
      {state.errors?._form && <span className="text-[10px] text-red-600">{state.errors._form[0]}</span>}
      <input
        name="newStock"
        type="number"
        min="0"
        step="1"
        defaultValue={currentStock}
        className="w-20 px-2 py-1 border border-[#e5e5e5] text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C]"
        aria-label="New stock quantity"
      />
      <button
        type="submit"
        className="text-[10px] text-white bg-[#111111] px-2 py-1 rounded hover:bg-[#1a1a1a] transition-colors"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-[10px] text-[#8C8C8C] hover:text-[#111111] transition-colors"
      >
        ×
      </button>
    </form>
  )
}

// ── Variant row ────────────────────────────────────────────────────────────

function VariantRowItem({
  variant,
  updateAction,
  deleteAction,
  updateStockAction,
}: {
  variant: VariantRow
  updateAction: (variantId: string, prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
  deleteAction: (variantId: string) => Promise<{ error?: string }>
  updateStockAction: (variantId: string, prev: VariantActionState, formData: FormData) => Promise<VariantActionState>
}) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const boundUpdateAction = updateAction.bind(null, variant.id)
  const [updateState, updateFormAction] = useActionState(boundUpdateAction, {})

  async function handleDelete() {
    if (!confirm(`Delete variant "${variant.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const result = await deleteAction(variant.id)
    if (result.error) {
      setDeleteError(result.error)
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <li className="border border-[#e5e5e5] rounded-lg overflow-hidden">
        <div className="bg-[#F8F5F2] px-4 py-2 text-xs font-medium text-[#111111] border-b border-[#e5e5e5]">
          Editing: {variant.name}
        </div>
        <div className="p-4">
          {updateState.success ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-green-700">✓ Saved</span>
              <button onClick={() => setEditing(false)} className="text-xs text-[#8C8C8C] hover:text-[#111111]">Close</button>
            </div>
          ) : (
            <VariantForm
              state={updateState}
              formAction={updateFormAction}
              defaultValues={variant}
              submitLabel="Save Changes"
              submitPendingLabel="Saving…"
              onCancel={() => setEditing(false)}
            />
          )}
        </div>
      </li>
    )
  }

  return (
    <li className="border border-[#e5e5e5] rounded-lg px-4 py-3 flex items-start justify-between gap-4 hover:bg-[#F8F5F2] transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-medium text-[#111111]">{variant.name}</span>
          <StockBadge stock={variant.stock} />
        </div>
        <div className="flex items-center gap-3 flex-wrap text-xs text-[#8C8C8C]">
          <span className="font-medium text-[#111111]">{formatCurrency(variant.price)}</span>
          {variant.compareAtPrice && (
            <span className="line-through text-[#aaa]">{formatCurrency(variant.compareAtPrice)}</span>
          )}
          <span>SKU: {variant.sku}</span>
        </div>
        <div className="mt-1.5">
          <StockAdjuster
            variantId={variant.id}
            currentStock={variant.stock}
            updateStockAction={updateStockAction}
          />
        </div>
        {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-[#8C8C8C] hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </li>
  )
}

// ── Main VariantManager ────────────────────────────────────────────────────

export default function VariantManager({
  variants,
  createAction,
  updateAction,
  deleteAction,
  updateStockAction,
}: VariantManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createState, createFormAction] = useActionState(createAction, {})

  return (
    <div className="space-y-5">
      {/* Hint */}
      <p className="text-xs text-[#8C8C8C] bg-[#F8F5F2] border border-[#EBEBEB] rounded px-3 py-2">
        Variants allow this product to have different sizes, volumes, or options — each with its own price and stock.
        Products with no variants use the base price and stock set on the product itself.
      </p>

      {/* Existing variants */}
      {variants.length > 0 ? (
        <ul className="space-y-2">
          {variants.map((v) => (
            <VariantRowItem
              key={v.id}
              variant={v}
              updateAction={updateAction}
              deleteAction={deleteAction}
              updateStockAction={updateStockAction}
            />
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-[#e5e5e5] rounded-lg p-6 text-center">
          <p className="text-sm text-[#8C8C8C]">No variants yet — this product uses base price and stock.</p>
        </div>
      )}

      {/* Add variant */}
      {showCreateForm ? (
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-3">New Variant</p>
          {createState.success ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded px-4 py-3">
              <span className="text-sm text-green-700">✓ Variant added</span>
              <button
                onClick={() => { setShowCreateForm(false) }}
                className="text-xs text-green-700 underline hover:no-underline"
              >
                Add another
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-xs text-[#8C8C8C] hover:text-[#111111] ml-auto"
              >
                Done
              </button>
            </div>
          ) : (
            <VariantForm
              state={createState}
              formAction={createFormAction}
              submitLabel="Add Variant"
              submitPendingLabel="Adding…"
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 border border-[#e5e5e5] text-[#111111] text-xs tracking-[0.1em] uppercase px-4 py-2.5 rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Variant
        </button>
      )}
    </div>
  )
}
