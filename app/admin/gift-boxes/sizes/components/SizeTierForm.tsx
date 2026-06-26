"use client"

import { useActionState, useState } from "react"
import type { SizeTierFormState } from "@/app/actions/gift-boxes"
import type { GiftBoxSizeTier } from "@/lib/gift-boxes"

interface SizeTierFormProps {
  action: (prev: SizeTierFormState, formData: FormData) => Promise<SizeTierFormState>
  defaultValues: GiftBoxSizeTier
}

export default function SizeTierForm({ action, defaultValues }: SizeTierFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})
  const [isActive, setIsActive] = useState(defaultValues.active)

  return (
    <form action={formAction} className="space-y-4">
      {state.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form[0]}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Saved successfully.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Label */}
        <div>
          <label className="label">Display Label</label>
          <input
            type="text"
            name="label"
            defaultValue={defaultValues.label}
            required
            className="input"
            placeholder="Small"
          />
          {state.errors?.label && (
            <p className="field-error">{state.errors.label[0]}</p>
          )}
        </div>

        {/* Item Range */}
        <div>
          <label className="label">Item Range Label</label>
          <input
            type="text"
            name="itemRange"
            defaultValue={defaultValues.itemRange}
            required
            className="input"
            placeholder="1–5 items"
          />
          {state.errors?.itemRange && (
            <p className="field-error">{state.errors.itemRange[0]}</p>
          )}
        </div>

        {/* Max Items */}
        <div>
          <label className="label">Max Items</label>
          <input
            type="number"
            name="maxItems"
            defaultValue={defaultValues.maxItems}
            min={1}
            max={100}
            required
            className="input"
          />
          {state.errors?.maxItems && (
            <p className="field-error">{state.errors.maxItems[0]}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="label">Price (₦)</label>
          <input
            type="number"
            name="price"
            defaultValue={defaultValues.price}
            min={0}
            step={100}
            required
            className="input"
          />
          {state.errors?.price && (
            <p className="field-error">{state.errors.price[0]}</p>
          )}
        </div>

        {/* Sort Order */}
        <div>
          <label className="label">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={defaultValues.sortOrder}
            min={0}
            className="input"
          />
        </div>

        {/* Active */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="hidden" name="active" value={isActive ? "true" : "false"} />
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#B8965C]"
            />
            <span className="text-xs text-[#111111] tracking-wide">Active</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <input
          type="text"
          name="description"
          defaultValue={defaultValues.description}
          required
          className="input"
          placeholder="Short description shown to customers"
        />
        {state.errors?.description && (
          <p className="field-error">{state.errors.description[0]}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
