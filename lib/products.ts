/**
 * Product data access functions.
 * Covers customer-facing queries (listing, filtering, sorting, pagination)
 * and admin CRUD operations.
 */

import { z } from "zod"
import {
  FragranceType,
  Gender,
  Longevity,
  Strength,
  type Prisma,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  buildPaginationArgs,
  paginate,
  softDelete,
  type PaginatedResult,
  type PaginationParams,
} from "@/lib/db"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductSort = "price_asc" | "price_desc" | "newest" | "popularity"

export interface ProductFilters {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  fragranceType?: FragranceType[]
  longevity?: Longevity[]
  strength?: Strength[]
  gender?: Gender[]
  inStock?: boolean
  search?: string
  featured?: boolean
}

// Prisma select shape used for customer-facing product lists
const productListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  compareAtPrice: true,
  images: true,
  stock: true,
  sku: true,
  featured: true,
  fragranceType: true,
  topNotes: true,
  heartNotes: true,
  baseNotes: true,
  longevity: true,
  strength: true,
  moodTags: true,
  gender: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.ProductSelect

// Full product with reviews for detail pages
const productDetailSelect = {
  ...productListSelect,
  reviews: {
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      verifiedPurchase: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true, image: true } },
    },
  },
} satisfies Prisma.ProductSelect

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).default([]),
  categoryId: z.string().min(1),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(1),
  featured: z.boolean().default(false),
  fragranceType: z.nativeEnum(FragranceType).optional(),
  topNotes: z.array(z.string()).default([]),
  heartNotes: z.array(z.string()).default([]),
  baseNotes: z.array(z.string()).default([]),
  longevity: z.nativeEnum(Longevity).optional(),
  strength: z.nativeEnum(Strength).optional(),
  moodTags: z.array(z.string()).default([]),
  gender: z.nativeEnum(Gender).optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Prisma `where` clause from ProductFilters (excludes deleted). */
function buildProductWhere(
  filters: ProductFilters
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { deleted: false }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {}
    if (filters.priceMin !== undefined) where.price.gte = filters.priceMin
    if (filters.priceMax !== undefined) where.price.lte = filters.priceMax
  }

  if (filters.fragranceType?.length) {
    where.fragranceType = { in: filters.fragranceType }
  }

  if (filters.longevity?.length) {
    where.longevity = { in: filters.longevity }
  }

  if (filters.strength?.length) {
    where.strength = { in: filters.strength }
  }

  if (filters.gender?.length) {
    where.gender = { in: filters.gender }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 }
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured
  }

  if (filters.search) {
    const term = filters.search.trim()
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { topNotes: { has: term } },
      { heartNotes: { has: term } },
      { baseNotes: { has: term } },
    ]
  }

  return where
}

/** Map a ProductSort value to a Prisma `orderBy` clause. */
function buildProductOrderBy(
  sort: ProductSort
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" }
    case "price_desc":
      return { price: "desc" }
    case "newest":
      return { createdAt: "desc" }
    case "popularity":
      return { reviewCount: "desc" }
    default:
      return { createdAt: "desc" }
  }
}

// ---------------------------------------------------------------------------
// Customer-facing queries
// ---------------------------------------------------------------------------

/**
 * Get a paginated, filtered, and sorted list of products.
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export async function getProducts(
  filters: ProductFilters = {},
  sort: ProductSort = "newest",
  pagination: PaginationParams = {}
) {
  const where = buildProductWhere(filters)
  const orderBy = buildProductOrderBy(sort)
  const { skip, take } = buildPaginationArgs(pagination)

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take, select: productListSelect }),
    prisma.product.count({ where }),
  ])

  return paginate(data, total, pagination)
}

/**
 * Get a single product by slug, including category and approved reviews.
 * Requirements: 2.5, 2.6, 2.7, 2.8
 */
export async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, deleted: false },
    select: productDetailSelect,
  })
}

/**
 * Get featured products for homepage / collections.
 * Requirements: 8.5, 12.2
 */
export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { featured: true, deleted: false, stock: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: productListSelect,
  })
}

/**
 * Get best-selling products ranked by total quantity sold.
 * Requirements: 12.3
 */
export async function getBestSellers(limit = 8) {
  // Aggregate total quantity sold per product via OrderItems
  const topItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  })

  if (topItems.length === 0) return []

  const productIds = topItems.map((item) => item.productId)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deleted: false },
    select: productListSelect,
  })

  // Preserve the sales-rank order returned by the aggregation
  const productMap = new Map(products.map((p) => [p.id, p]))
  return productIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
}

/**
 * Get new arrivals — products created in the last 30 days.
 * Requirements: 12.4
 */
export async function getNewArrivals(limit = 8) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return prisma.product.findMany({
    where: {
      deleted: false,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  })
}

// ---------------------------------------------------------------------------
// Admin CRUD operations
// ---------------------------------------------------------------------------

/**
 * Create a new product after validating all required fields.
 * Requirements: 8.1, 8.2, 8.7
 */
export async function createProduct(input: ProductCreateInput) {
  const data = productCreateSchema.parse(input)
  return prisma.product.create({ data, select: productDetailSelect })
}

/**
 * Update an existing product by id.
 * Requirements: 8.3, 8.5, 8.6
 */
export async function updateProduct(id: string, input: ProductUpdateInput) {
  const data = productUpdateSchema.parse(input)
  return prisma.product.update({
    where: { id },
    data,
    select: productDetailSelect,
  })
}

/**
 * Soft-delete a product — hides it from customer views without removing the DB record.
 * Requirements: 8.4
 */
export async function deleteProduct(id: string) {
  await softDelete(prisma.product, id)
}

/**
 * Get all products for admin (includes deleted, no pagination by default).
 * Requirements: 8.1, 8.3, 8.4
 */
export async function getAdminProducts(
  filters: ProductFilters & { includeDeleted?: boolean } = {},
  sort: ProductSort = "newest",
  pagination: PaginationParams = {}
) {
  const { includeDeleted = false, ...rest } = filters
  const where = buildProductWhere(rest)

  // Admin can optionally see deleted products
  if (includeDeleted) {
    delete where.deleted
  }

  const orderBy = buildProductOrderBy(sort)
  const { skip, take } = buildPaginationArgs(pagination)

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        ...productListSelect,
        deleted: true,
      },
    }),
    prisma.product.count({ where }),
  ])

  return paginate(data, total, pagination)
}

/**
 * Get a single product by id for admin editing.
 */
export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: { ...productDetailSelect, deleted: true, sku: true },
  })
}
