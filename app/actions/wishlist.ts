"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ── Types ──────────────────────────────────────────────────────────────────

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  images: string[]
  stock: number
  fragranceType: string | null
  averageRating: number | null
  reviewCount: number
  category: { name: string; slug: string }
}

export interface WishlistEntry {
  id: string
  productId: string
  createdAt: Date
  product: WishlistProduct
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Get all wishlist items for the authenticated user.
 * Requirements: 7.3
 */
export async function getWishlist(): Promise<WishlistEntry[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
          stock: true,
          fragranceType: true,
          averageRating: true,
          reviewCount: true,
          deleted: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  type RawItem = (typeof items)[number]

  // Filter out soft-deleted products
  return items
    .filter((item: RawItem) => !item.product.deleted)
    .map((item: RawItem) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice,
        images: item.product.images,
        stock: item.product.stock,
        fragranceType: item.product.fragranceType,
        averageRating: item.product.averageRating,
        reviewCount: item.product.reviewCount,
        category: item.product.category,
      },
    }))
}

/**
 * Get the set of product IDs in the user's wishlist (for UI state).
 */
export async function getWishlistProductIds(): Promise<Set<string>> {
  const session = await auth()
  if (!session?.user?.id) return new Set()

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  })

  return new Set(items.map((i: { productId: string }) => i.productId))
}

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Add a product to the wishlist.
 * Requirements: 7.1
 */
export async function addToWishlist(
  productId: string
): Promise<{ error?: string; alreadyExists?: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be logged in" }

  // Check product exists and is not deleted
  const product = await prisma.product.findFirst({
    where: { id: productId, deleted: false },
    select: { id: true },
  })
  if (!product) return { error: "Product not found" }

  // Upsert — silently succeed if already in wishlist
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId },
    update: {},
  })

  revalidatePath("/account/wishlist")
  return {}
}

/**
 * Remove a product from the wishlist.
 * Requirements: 7.2
 */
export async function removeFromWishlist(
  productId: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be logged in" }

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  })

  revalidatePath("/account/wishlist")
  return {}
}

/**
 * Toggle wishlist membership for a product.
 * Returns the new state: true = added, false = removed.
 * Requirements: 7.1, 7.2
 */
export async function toggleWishlist(
  productId: string
): Promise<{ inWishlist: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { inWishlist: false, error: "You must be logged in" }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
    select: { id: true },
  })

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
    revalidatePath("/account/wishlist")
    return { inWishlist: false }
  }

  // Verify product exists
  const product = await prisma.product.findFirst({
    where: { id: productId, deleted: false },
    select: { id: true },
  })
  if (!product) return { inWishlist: false, error: "Product not found" }

  await prisma.wishlistItem.create({
    data: { userId: session.user.id, productId },
  })

  revalidatePath("/account/wishlist")
  return { inWishlist: true }
}
