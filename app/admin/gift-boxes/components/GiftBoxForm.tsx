"use client"

import { useActionState, useState } from "react"
import { GIFT_BOX_THEME_META, type GiftBoxTheme } from "@/lib/gift-boxes"
import type { GiftBoxFormState } from "@/app/actions/gift-boxes"

interface GiftBoxFormProps {
  action: (
    prev: GiftBoxFormState,
    formData: FormData
  ) => Promise<GiftBoxFormState>
  defaultValues?: {
    title?: string
    slug?: string
    description?: string
    image?: string
    maxItems?: number
    price?: number
    theme?: GiftBoxTheme
    active?: boolean
    sortOrder?: number
  }
  submitLabel?: string
}

const themes = Object.entries(GIFT_BOX_THEME_META) as [
  GiftBoxTheme,
  { label: string; description: string }
][]

export default function GiftBoxForm({
  action,
  defaultValues = {},
  submitLabel = "Save Gift Box",
}: GiftBoxFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})
  const [isActive, setIsActive] = useState(defaultValues.active ?? true)
  const [slug, setSlug] = useState(defaultValues.slug ?? "")

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {/* Form error */}
      {state.errors?._form && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
          <p className="text-sm text-red-700">{state.errors._form[0]}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={defaultValues.title ?? ""}
          required
          className="input"
          placeholder="Signature Cream Box"
          onChange={(e) => {
            // Only auto-generate slug if it hasn't been manually edited
            // (i.e. it still matches what would be auto-generated from the old value)
            if (!defaultValues.slug) {
              setSlug(generateSlug(e.target.value))
            }
          }}
        />
        {state.errors?.title && (
          <p className="field-error">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="label">
          Slug
          <span className="ml-2 text-[10px] text-[#B8965C] normal-case tracking-normal font-normal">
            auto-generated from title
          </span>
        </label>
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="input font-mono text-sm"
          placeholder="signature-cream-box"
        />
        {state.errors?.slug && (
          <p className="field-error">{state.errors.slug[0]}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          defaultValue={defaultValues.description ?? ""}
          required
          rows={3}
          className="input resize-none"
          placeholder="A short, evocative description of this gift box…"
        />
        {state.errors?.description && (
          <p className="field-error">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="label">Image URL</label>
        <input
          type="url"
          name="image"
          defaultValue={defaultValues.image ?? ""}
          required
          className="input"
          placeholder="https://res.cloudinary.com/…"
        />
        {state.errors?.image && (
          <p className="field-error">{state.errors.image[0]}</p>
        )}
      </div>

      {/* Theme */}
      <div>
        <label className="label">Theme</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {themes.map(([key, meta]) => (
            <label
              key={key}
              className="relative flex flex-col gap-1 p-4 border border-[#e5e5e5] cursor-pointer hover:border-[#B8965C] transition-colors has-[:checked]:border-[#111111] has-[:checked]:bg-[#F8F5F2]"
            >
              <input
                type="radio"
                name="theme"
                value={key}
                defaultChecked={defaultValues.theme === key}
                required
                className="sr-only"
              />
              <span className="text-xs font-medium text-[#111111]">
                {meta.label}
              </span>
              <span className="text-[11px] text-[#8C8C8C] leading-snug">
                {meta.description}
              </span>
            </label>
          ))}
        </div>
        {state.errors?.theme && (
          <p className="field-error">{state.errors.theme[0]}</p>
        )}
      </div>

      {/* Max Items + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Max Items</label>
          <input
            type="number"
            name="maxItems"
            defaultValue={defaultValues.maxItems ?? 5}
            min={1}
            max={20}
            required
            className="input"
          />
          {state.errors?.maxItems && (
            <p className="field-error">{state.errors.maxItems[0]}</p>
          )}
        </div>
        <div>
          <label className="label">Box Price (₦)</label>
          <input
            type="number"
            name="price"
            defaultValue={defaultValues.price ?? 0}
            min={0}
            step={100}
            required
            className="input"
            placeholder="0 for complimentary"
          />
          {state.errors?.price && (
            <p className="field-error">{state.errors.price[0]}</p>
          )}
        </div>
      </div>

      {/* Sort Order + Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={defaultValues.sortOrder ?? 0}
            min={0}
            className="input"
          />
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer">
            {/* Single hidden input — always submitted with the correct value */}
            <input type="hidden" name="active" value={isActive ? "true" : "false"} />
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#B8965C]"
            />
            <span className="text-xs text-[#111111] tracking-wide">
              Active (visible to customers)
            </span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
