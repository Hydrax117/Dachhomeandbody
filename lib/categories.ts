/**
 * Category data access functions.
 * Requirements: 19.1, 19.2, 19.4, 19.5
 */

import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100),
  description: z.string().max(500).optional(),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all categories with product count.
 * Requirements: 19.5
 */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { deleted: false } } } },
    },
  })
}

/**
 * Get a single category by id.
 */
export async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: { where: { deleted: false } } } },
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new category with a unique name.
 * Requirements: 19.1
 */
export async function createCategory(input: CategoryCreateInput) {
  const data = categoryCreateSchema.parse(input)
  return prisma.category.create({ data })
}

/**
 * Update an existing category.
 * Requirements: 19.2
 */
export async function updateCategory(id: string, input: CategoryUpdateInput) {
  const data = categoryUpdateSchema.parse(input)
  return prisma.category.update({ where: { id }, data })
}

/**
 * Delete a category and unassign all its products (set categoryId to null is
 * not possible with a required FK, so we reassign products to an "Uncategorized"
 * sentinel category, creating it if needed).
 * Requirements: 19.4
 */
export async function deleteCategory(id: string) {
  return prisma.$transaction(async (tx) => {
    // Count products in this category
    const productCount = await tx.product.count({ where: { categoryId: id } })

    if (productCount > 0) {
      // Find or create an "Uncategorized" fallback category
      let fallback = await tx.category.findFirst({
        where: { slug: "uncategorized" },
      })

      if (!fallback) {
        fallback = await tx.category.create({
          data: { name: "Uncategorized", slug: "uncategorized" },
        })
      }

      // Reassign products
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallback.id },
      })
    }

    await tx.category.delete({ where: { id } })
  })
}
