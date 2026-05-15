"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { CartItem } from "@/app/components/cart/CartContext"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PersistedCartItem {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    stock: number
  }
}

// ── Load cart from DB ──────────────────────────────────────────────────────

export async function loadCart(): Promise<PersistedCartItem[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          stock: true,
          deleted: true,
        },
      },
    },
  })

  // Filter out deleted products
  return (items as Array<{
    productId: string
    quantity: number
    product: {
      id: string
      name: string
      slug: string
      price: number
      images: string[]
      stock: number
      deleted: boolean
    }
  }>)
    .filter((item) => !item.product.deleted)
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        images: item.product.images,
        stock: item.product.stock,
      },
    }))
}

// ── Save a single cart item (upsert) ──────────────────────────────────────

export async function saveCartItem(productId: string, quantity: number): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, productId },
    })
    return
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId, quantity },
    update: { quantity },
  })
}

// ── Remove a single cart item ──────────────────────────────────────────────

export async function removeCartItem(productId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id, productId },
  })
}

// ── Clear entire cart from DB ──────────────────────────────────────────────

export async function clearPersistedCart(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id },
  })
}

// ── Merge guest cart into user cart on login ───────────────────────────────
// Takes guest items and merges them with the user's existing DB cart.
// Guest quantities are added to existing quantities, capped at stock.

export async function mergeGuestCart(guestItems: { productId: string; quantity: number }[]): Promise<PersistedCartItem[]> {
  const session = await auth()
  if (!session?.user?.id || guestItems.length === 0) return loadCart()

  const userId = session.user.id

  // Fetch current DB cart and product stock in parallel
  const [dbItems, products] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId } }),
    prisma.product.findMany({
      where: {
        id: { in: guestItems.map((i) => i.productId) },
        deleted: false,
      },
      select: { id: true, stock: true },
    }),
  ])

  const stockMap = new Map((products as Array<{ id: string; stock: number }>).map((p) => [p.id, p.stock]))
  const dbMap = new Map((dbItems as Array<{ productId: string; quantity: number }>).map((i) => [i.productId, i.quantity]))

  // Upsert each guest item, merging quantities
  await Promise.all(
    guestItems.map(async (guestItem) => {
      const stock = stockMap.get(guestItem.productId)
      if (stock === undefined) return // product not found or deleted

      const existing = dbMap.get(guestItem.productId) ?? 0
      const merged = Math.min(existing + guestItem.quantity, stock)

      if (merged <= 0) return

      await prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: guestItem.productId } },
        create: { userId, productId: guestItem.productId, quantity: merged },
        update: { quantity: merged },
      })
    })
  )

  return loadCart()
}
