"use client"

import { useActionState, useEffect, useRef } from "react"
import type { CategoryFormState } from "../actions"

interface CategoryFormProps {
  /** When provided, the form is in edit mode */
  category?: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  createAction: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>
  updateAction: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>
  onSuccess?: () => void
  onCancel?: () => void
}

const initialState: CategoryFormState = {}

export default function CategoryForm({
  category,
  createAction,
  updateAction,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const action = category ? updateAction : createAction
  const [state, formAction, isPending] = useActionState(action, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-generate slug from name (create mode only)
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (category) return // don't auto-generate in edit mode
    const slugInput = formRef.current?.elements.namedItem("slug") as HTMLInputElement | null
    if (slugInput) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
  }

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onSuccess?.()
    }
  }, [state.success, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Global error */}
      {state.errors?._form && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.errors._form[0]}
        </p>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="cat-name"
          className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1"
        >
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          defaultValue={category?.name ?? ""}
          onChange={handleNameChange}
          className="w-full border border-[#e5e5e5] rounded px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B] transition-colors"
          placeholder="e.g. Eau de Parfum"
        />
        {state.errors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="cat-slug"
          className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1"
        >
          Slug <span aria-hidden="true">*</span>
        </label>
        <input
          id="cat-slug"
          name="slug"
          type="text"
          required
          defaultValue={category?.slug ?? ""}
          className="w-full border border-[#e5e5e5] rounded px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B] transition-colors font-mono"
          placeholder="e.g. eau-de-parfum"
        />
        {state.errors?.slug && (
          <p className="text-xs text-red-600 mt-1">{state.errors.slug[0]}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="cat-description"
          className="block text-xs tracking-[0.12em] uppercase text-[#8b7355] mb-1"
        >
          Description
        </label>
        <textarea
          id="cat-description"
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
          className="w-full border border-[#e5e5e5] rounded px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#C8A96B] transition-colors resize-none"
          placeholder="Optional short description"
        />
        {state.errors?.description && (
          <p className="text-xs text-red-600 mt-1">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : category ? "Save Changes" : "Create Category"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#8b7355] hover:text-[#111111] transition-colors px-3 py-2.5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
