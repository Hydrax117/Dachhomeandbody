"use client"

import { useActionState, useState, useRef } from "react"
import Image from "next/image"
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

// ---------------------------------------------------------------------------
// Image upload widget
// ---------------------------------------------------------------------------

function ImageUpload({
  value,
  onChange,
  onUploadingChange,
  error,
}: {
  value: string
  onChange: (url: string) => void
  onUploadingChange: (uploading: boolean) => void
  error?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setUploading(true)
    onUploadingChange(true)

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Upload failed")
      onChange(json.url as string)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      onUploadingChange(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative w-32 h-40 border border-[#e5e5e5] overflow-hidden bg-[#F8F5F2]">
          <Image
            src={value}
            alt="Gift box preview"
            fill
            className="object-cover"
            sizes="128px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded-sm"
            aria-label="Remove image"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded px-6 py-5 text-center cursor-pointer transition-colors ${
          uploading
            ? "border-[#B8965C] cursor-not-allowed"
            : "border-[#e5e5e5] hover:border-[#B8965C]"
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(e) => !uploading && e.key === "Enter" && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload gift box image"
        aria-busy={uploading}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[#B8965C]">
            <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Uploading…
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-2 text-[#C4C4C4]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm text-[#111111]">
              {value ? "Click to replace image" : "Click to upload image"}
            </p>
            <p className="text-[11px] text-[#aaa] mt-1">JPEG, PNG, WebP — max 10 MB</p>
          </>
        )}
      </div>

      {/* Also allow pasting a URL directly */}
      <div>
        <p className="text-[10px] text-[#8C8C8C] mb-1.5 tracking-wide">Or paste a URL</p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/…"
          className="input text-xs"
        />
      </div>

      {(uploadError || error) && (
        <p className="field-error">{uploadError || error}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function GiftBoxForm({
  action,
  defaultValues = {},
  submitLabel = "Save Gift Box",
}: GiftBoxFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})
  const [isActive, setIsActive] = useState(defaultValues.active ?? true)
  const [slug, setSlug] = useState(defaultValues.slug ?? "")
  const [imageUrl, setImageUrl] = useState(defaultValues.image ?? "")
  const [isUploading, setIsUploading] = useState(false)

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

      {/* Image */}
      <div>
        <label className="label">Box Image</label>
        {/* Hidden input carries the final URL into the form submission */}
        <input type="hidden" name="image" value={imageUrl} />
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onUploadingChange={setIsUploading}
          error={state.errors?.image?.[0]}
        />
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
          disabled={isPending || isUploading}
          title={isUploading ? "Please wait for image to finish uploading" : undefined}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading image…" : isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
