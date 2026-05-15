/**
 * Review data access functions for admin moderation.
 * Requirements: 6.2, 6.3, 6.4, 6.5
 */

import { type Prisma, type ReviewStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  buildPaginationArgs,
  paginate,
  type PaginationParams,
} from "@/lib/db"

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminReviewRow {
  id: string
  rating: number
  title: string | null
  comment: string
  verifiedPurchase: boolean
  status: ReviewStatus
  createdAt: Date
  updatedAt: Date
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
  user: {
    id: string
    name: string | null
    email: string
  }
}

export interface AdminReviewFilters {
  status?: ReviewStatus
  /** Matches product name or reviewer name/email */
  search?: string
}

export type AdminReviewSort = "newest" | "oldest" | "rating_desc" | "rating_asc"

// ── Helpers ────────────────────────────────────────────────────────────────

function buildAdminReviewWhere(
  filters: AdminReviewFilters
): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {}

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.search) {
    const term = filters.search.trim()
    where.OR = [
      { product: { name: { contains: term, mode: "insensitive" } } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
    ]
  }

  return where
}

function buildAdminReviewOrderBy(
  sort: AdminReviewSort
): Prisma.ReviewOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" }
    case "rating_desc":
      return { rating: "desc" }
    case "rating_asc":
      return { rating: "asc" }
    case "newest":
    default:
      return { createdAt: "desc" }
  }
}

const reviewSelect = {
  id: true,
  rating: true,
  title: true,
  comment: true,
  verifiedPurchase: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ReviewSelect

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Get all reviews for admin with filters, sorting, and pagination.
 * Requirements: 6.2, 6.3
 */
export async function getAdminReviews(
  filters: AdminReviewFilters = {},
  sort: AdminReviewSort = "newest",
  pagination: PaginationParams = {}
): Promise<import("@/lib/db").PaginatedResult<AdminReviewRow>> {
  const where = buildAdminReviewWhere(filters)
  const orderBy = buildAdminReviewOrderBy(sort)
  const { skip, take } = buildPaginationArgs(pagination)

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip,
      take,
      select: reviewSelect,
    }) as Promise<AdminReviewRow[]>,
    prisma.review.count({ where }),
  ])

  return paginate(data, total, pagination)
}

/**
 * Approve a review and recalculate the product's average rating.
 * Requirements: 6.2
 */
export async function approveReview(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: { id },
      data: { status: "APPROVED" },
      select: { productId: true },
    })

    await recalculateProductRating(tx, review.productId)
  })
}

/**
 * Reject a review — marks it as rejected and excludes it from display.
 * Requirements: 6.3
 */
export async function rejectReview(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: { id },
      data: { status: "REJECTED" },
      select: { productId: true },
    })

    await recalculateProductRating(tx, review.productId)
  })
}

/**
 * Recalculate and persist the average rating and review count for a product
 * based on all currently APPROVED reviews.
 * Requirements: 6.5
 */
async function recalculateProductRating(
  tx: Prisma.TransactionClient,
  productId: string
): Promise<void> {
  const result = await tx.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { id: true },
  })

  await tx.product.update({
    where: { id: productId },
    data: {
      averageRating: result._avg.rating ?? null,
      reviewCount: result._count.id,
    },
  })
}
