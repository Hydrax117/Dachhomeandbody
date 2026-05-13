"use client"

import { useState, useTransition } from "react"
import CategoryForm from "./CategoryForm"
import type { CategoryFormState } from "../actions"

interface CategoryRowProps {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    _count: { products: number }
  }
  updateAction: (id: string, prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>
  deleteAction: (id: string) => Promise<{ error?: string }>
}

export default function CategoryRow({ category, updateAction, deleteAction }: CategoryRowProps) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Bind the category id into the update action
  const boundUpdateAction = updateAction.bind(null, category.id)

  function handleDelete() {
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteAction(category.id)
      if (result.error) {
        setDeleteError(result.error)
        setConfirming(false)
      }
    })
  }

  if (editing) {
    return (
      <tr className="bg-[#FFFDF9]">
        <td colSpan={4} className="px-4 py-4">
          <CategoryForm
            category={category}
            createAction={async () => ({ success: false })}
            updateAction={boundUpdateAction}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-[#FAF8F5] transition-colors">
      {/* Name */}
      <td className="px-4 py-3">
        <p className="font-medium text-[#111111] text-sm">{category.name}</p>
        {category.description && (
          <p className="text-[11px] text-[#8b7355] mt-0.5 truncate max-w-[260px]">
            {category.description}
          </p>
        )}
      </td>

      {/* Slug */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="font-mono text-xs text-[#8b7355]">{category.slug}</span>
      </td>

      {/* Product count */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-[#111111]">{category._count.products}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {confirming ? (
            <>
              <span className="text-[11px] text-[#8b7355]">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-red-600 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                aria-label={`Confirm delete ${category.name}`}
              >
                {isPending ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="text-xs text-[#8b7355] hover:text-[#111111] px-1.5 py-1 rounded hover:bg-[#f0ece4] transition-colors"
              >
                No
              </button>
              {deleteError && (
                <span className="text-[11px] text-red-600">{deleteError}</span>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#8b7355] hover:text-[#C8A96B] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                aria-label={`Edit ${category.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-[#8b7355] hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                aria-label={`Delete ${category.name}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
