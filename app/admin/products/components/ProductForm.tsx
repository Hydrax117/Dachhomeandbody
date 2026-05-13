"use client"

import { useActionState, useState, useRef, useTransition } from "react"
import { useFormStatus } from "react-dom"
import type { CreateProductState } from "../actions"

// ── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  action: (prev: CreateProductState, formData: FormData) => Promise<CreateProductState>
}

// ── Step definitions ───────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Fragrance Profile", "Images & Stock"] as const
type Step = 0 | 1 | 2

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  )
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function inputCls(error?: string) {
  return [
    "w-full px-3 py-2.5 border text-sm text-[#111111] bg-white rounded",
    "focus:outline-none focus:ring-1 focus:ring-[#C8A96B] focus:border-[#C8A96B]",
    "placeholder-[#aaa] transition-colors",
    error ? "border-red-400" : "border-[#e5e5e5]",
  ].join(" ")
}

function selectCls(error?: string) {
  return [
    "w-full px-3 py-2.5 border text-sm text-[#111111] bg-white rounded",
    "focus:outline-none focus:ring-1 focus:ring-[#C8A96B] focus:border-[#C8A96B]",
    "transition-colors appearance-none",
    error ? "border-red-400" : "border-[#e5e5e5]",
  ].join(" ")
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-6 py-3 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating…" : "Create Product"}
    </button>
  )
}

// ── Step 1: Basic Info ─────────────────────────────────────────────────────

function BasicInfoStep({
  categories,
  errors,
}: {
  categories: Category[]
  errors: CreateProductState["errors"]
}) {
  const [slug, setSlug] = useState("")
  const [nameVal, setNameVal] = useState("")

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setNameVal(val)
    setSlug(slugify(val))
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <Label htmlFor="name" required>Product Name</Label>
        <input
          id="name" name="name" type="text" required
          value={nameVal}
          onChange={handleNameChange}
          placeholder="e.g. Oud Noir Eau de Parfum"
          className={inputCls(errors?.name?.[0])}
        />
        <FieldError message={errors?.name?.[0]} />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug" required>URL Slug</Label>
        <input
          id="slug" name="slug" type="text" required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="oud-noir-eau-de-parfum"
          className={inputCls(errors?.slug?.[0])}
        />
        <FieldError message={errors?.slug?.[0]} />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" required>Description</Label>
        <textarea
          id="description" name="description" required rows={4}
          placeholder="Describe the product in detail…"
          className={inputCls(errors?.description?.[0]) + " resize-y min-h-[100px]"}
        />
        <FieldError message={errors?.description?.[0]} />
      </div>

      {/* Price + Compare At Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" required>Price (₦)</Label>
          <input
            id="price" name="price" type="number" required min="0" step="0.01"
            placeholder="25000"
            className={inputCls(errors?.price?.[0])}
          />
          <FieldError message={errors?.price?.[0]} />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare At Price (₦)</Label>
          <input
            id="compareAtPrice" name="compareAtPrice" type="number" min="0" step="0.01"
            placeholder="30000"
            className={inputCls(errors?.compareAtPrice?.[0])}
          />
          <FieldError message={errors?.compareAtPrice?.[0]} />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="categoryId" required>Category</Label>
        <div className="relative">
          <select id="categoryId" name="categoryId" required className={selectCls(errors?.categoryId?.[0])}>
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        <FieldError message={errors?.categoryId?.[0]} />
      </div>

      {/* Gender */}
      <div>
        <Label htmlFor="gender">Gender</Label>
        <div className="relative">
          <select id="gender" name="gender" className={selectCls()}>
            <option value="">Select…</option>
            <option value="UNISEX">Unisex</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          id="featured" name="featured" type="checkbox" value="true"
          className="w-4 h-4 accent-[#C8A96B] rounded"
        />
        <label htmlFor="featured" className="text-sm text-[#111111]">
          Mark as featured product
        </label>
      </div>
    </div>
  )
}

// ── Step 2: Fragrance Profile ──────────────────────────────────────────────

function FragranceProfileStep({ errors }: { errors: CreateProductState["errors"] }) {
  return (
    <div className="space-y-5">
      {/* Fragrance Type */}
      <div>
        <Label htmlFor="fragranceType">Fragrance Type</Label>
        <div className="relative">
          <select id="fragranceType" name="fragranceType" className={selectCls()}>
            <option value="">Select type…</option>
            <option value="PERFUME">Perfume</option>
            <option value="EAU_DE_PARFUM">Eau de Parfum</option>
            <option value="EAU_DE_TOILETTE">Eau de Toilette</option>
            <option value="COLOGNE">Cologne</option>
            <option value="BODY_MIST">Body Mist</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="topNotes">Top Notes</Label>
          <input
            id="topNotes" name="topNotes" type="text"
            placeholder="Bergamot, Lemon, Pepper"
            className={inputCls(errors?.topNotes?.[0])}
          />
          <p className="mt-1 text-[10px] text-[#aaa]">Comma-separated</p>
          <FieldError message={errors?.topNotes?.[0]} />
        </div>
        <div>
          <Label htmlFor="heartNotes">Heart Notes</Label>
          <input
            id="heartNotes" name="heartNotes" type="text"
            placeholder="Rose, Jasmine, Iris"
            className={inputCls(errors?.heartNotes?.[0])}
          />
          <p className="mt-1 text-[10px] text-[#aaa]">Comma-separated</p>
          <FieldError message={errors?.heartNotes?.[0]} />
        </div>
        <div>
          <Label htmlFor="baseNotes">Base Notes</Label>
          <input
            id="baseNotes" name="baseNotes" type="text"
            placeholder="Oud, Sandalwood, Musk"
            className={inputCls(errors?.baseNotes?.[0])}
          />
          <p className="mt-1 text-[10px] text-[#aaa]">Comma-separated</p>
          <FieldError message={errors?.baseNotes?.[0]} />
        </div>
      </div>

      {/* Longevity + Strength */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="longevity">Longevity</Label>
          <div className="relative">
            <select id="longevity" name="longevity" className={selectCls()}>
              <option value="">Select…</option>
              <option value="SHORT">Short (1–3 hrs)</option>
              <option value="MODERATE">Moderate (3–6 hrs)</option>
              <option value="LONG">Long (6–12 hrs)</option>
              <option value="VERY_LONG">Very Long (12+ hrs)</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          <FieldError message={errors?.longevity?.[0]} />
        </div>
        <div>
          <Label htmlFor="strength">Strength</Label>
          <div className="relative">
            <select id="strength" name="strength" className={selectCls()}>
              <option value="">Select…</option>
              <option value="LIGHT">Light</option>
              <option value="MODERATE">Moderate</option>
              <option value="STRONG">Strong</option>
              <option value="VERY_STRONG">Very Strong</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          <FieldError message={errors?.strength?.[0]} />
        </div>
      </div>

      {/* Mood Tags */}
      <div>
        <Label htmlFor="moodTags">Mood Tags</Label>
        <input
          id="moodTags" name="moodTags" type="text"
          placeholder="Romantic, Mysterious, Fresh"
          className={inputCls()}
        />
        <p className="mt-1 text-[10px] text-[#aaa]">Comma-separated</p>
      </div>
    </div>
  )
}

// ── Step 3: Images & Stock ─────────────────────────────────────────────────

function ImagesAndStockStep({ errors }: { errors: CreateProductState["errors"] }) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadError("")
    setUploading(true)

    const uploaded: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append("file", file)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Upload failed")
        uploaded.push(json.url as string)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed")
      }
    }

    startTransition(() => {
      setImages((prev) => [...prev, ...uploaded])
    })
    setUploading(false)
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6">
      {/* Hidden inputs for image URLs */}
      {images.map((url, i) => (
        <input key={i} type="hidden" name="images" value={url} />
      ))}

      {/* Image upload area */}
      <div>
        <Label htmlFor="imageUpload">Product Images</Label>
        <div
          className="border-2 border-dashed border-[#e5e5e5] rounded-lg p-6 text-center hover:border-[#C8A96B] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload product images"
        >
          <input
            ref={fileInputRef}
            id="imageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
          {uploading ? (
            <p className="text-sm text-[#8b7355]">Uploading…</p>
          ) : (
            <>
              <svg className="mx-auto mb-2 text-[#C8A96B]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm text-[#111111]">Click to upload images</p>
              <p className="text-[11px] text-[#aaa] mt-1">JPEG, PNG, WebP — max 10 MB each</p>
            </>
          )}
        </div>
        {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
        {errors?.images?.[0] && <FieldError message={errors.images[0]} />}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#8b7355] mb-2">
            Uploaded Images ({images.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  className="w-full h-full object-cover rounded border border-[#e5e5e5]"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 text-[9px] tracking-widest uppercase bg-[#C8A96B] text-white px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  aria-label={`Remove image ${idx + 1}`}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKU + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku" required>SKU</Label>
          <input
            id="sku" name="sku" type="text" required
            placeholder="DHB-001"
            className={inputCls(errors?.sku?.[0])}
          />
          <FieldError message={errors?.sku?.[0]} />
        </div>
        <div>
          <Label htmlFor="stock" required>Stock Quantity</Label>
          <input
            id="stock" name="stock" type="number" required min="0" step="1"
            placeholder="50"
            className={inputCls(errors?.stock?.[0])}
          />
          <FieldError message={errors?.stock?.[0]} />
        </div>
      </div>
    </div>
  )
}

// ── Main ProductForm component ─────────────────────────────────────────────

export default function ProductForm({ categories, action }: ProductFormProps) {
  const [step, setStep] = useState<Step>(0)
  const [state, formAction] = useActionState(action, {})

  // If there are errors, show the step that contains the first error
  const stepErrors: Record<Step, (keyof NonNullable<CreateProductState["errors"]>)[]> = {
    0: ["name", "slug", "description", "price", "compareAtPrice", "categoryId", "gender"],
    1: ["fragranceType", "topNotes", "heartNotes", "baseNotes", "longevity", "strength"],
    2: ["images", "sku", "stock"],
  }

  function hasStepError(s: Step) {
    if (!state.errors) return false
    return stepErrors[s].some((k) => state.errors![k]?.length)
  }

  return (
    <form action={formAction} noValidate>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => {
          const isActive = step === i
          const isDone = step > i
          const hasErr = hasStepError(i as Step)
          return (
            <div key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(i as Step)}
                className={[
                  "flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors",
                  isActive
                    ? "bg-[#111111] text-white"
                    : isDone
                    ? "text-[#C8A96B] hover:text-[#111111]"
                    : "text-[#8b7355] hover:text-[#111111]",
                  hasErr ? "ring-1 ring-red-400" : "",
                ].join(" ")}
              >
                <span className={[
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0",
                  isActive ? "bg-white text-[#111111]" : isDone ? "bg-[#C8A96B] text-white" : "bg-[#e5e5e5] text-[#8b7355]",
                ].join(" ")}>
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="tracking-[0.1em] uppercase hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-[#e5e5e5] mx-1" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      {/* Form-level error */}
      {state.errors?._form && (
        <div role="alert" className="mb-6 border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded text-sm">
          {state.errors._form[0]}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-[#111111] mb-5">
          {STEPS[step]}
        </h2>

        {step === 0 && <BasicInfoStep categories={categories} errors={state.errors} />}
        {step === 1 && <FragranceProfileStep errors={state.errors} />}
        {step === 2 && <ImagesAndStockStep errors={state.errors} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          disabled={step === 0}
          className="text-xs text-[#8b7355] hover:text-[#111111] transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 border border-[#e5e5e5] rounded hover:border-[#C8A96B]"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1) as Step)}
              className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-6 py-3 rounded hover:bg-[#1a1a1a] transition-colors"
            >
              Next →
            </button>
          ) : (
            <SubmitButton />
          )}
        </div>
      </div>
    </form>
  )
}
