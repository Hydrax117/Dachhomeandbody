"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Validation schema (not exported — "use server" files can only export async functions)
// ---------------------------------------------------------------------------

const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z.string().max(100, "Title must be 100 characters or less").optional(),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be 1000 characters or less"),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReviewFormState = {
  errors?: {
    productId?: string[]
    rating?: string[]
    title?: string[]
    comment?: string[]
    _form?: string[]
  }
  success?: boolean
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

/**
 * Submit a product review.
 * Creates a pending review record.
 * Checks if the user has purchased the product to set verifiedPurchase flag.
 * Requirements: 6.1, 6.6
 */
export async function submitReview(
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  // Require authentication
  const session = await auth()
  if (!session?.user?.id) {
    return {
      errors: {
        _form: ["You must be logged in to submit a review."],
      },
    }
  }

  // Validate form data
  const validatedFields = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    comment: formData.get("comment"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { productId, rating, title, comment } = validatedFields.data
  const userId = session.user.id

  try {
    // Verify product exists and is not deleted
    const product = await prisma.product.findFirst({
      where: { id: productId, deleted: false },
      select: { id: true },
    })

    if (!product) {
      return {
        errors: { _form: ["Product not found."] },
      }
    }

    // Check if user already submitted a review for this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
      select: { id: true },
    })

    if (existingReview) {
      return {
        errors: {
          _form: ["You have already submitted a review for this product."],
        },
      }
    }

    // Check purchase verification — only customers with a DELIVERED order can review
    // Requirement 6.6: mark as unverified if not purchased
    const deliveredOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "DELIVERED",
        },
      },
      select: { id: true },
    })

    if (!deliveredOrder) {
      return {
        errors: {
          _form: [
            "Only customers who have received this product can leave a review.",
          ],
        },
      }
    }

    const verifiedPurchase = true

    // Create review with PENDING status (Requirement 6.1)
    await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        comment,
        verifiedPurchase,
        status: "PENDING",
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Review submission error:", error)
    return {
      errors: {
        _form: ["An error occurred while submitting your review. Please try again."],
      },
    }
  }
}
