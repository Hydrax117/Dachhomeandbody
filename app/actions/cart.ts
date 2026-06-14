"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { CartItem } from "@/app/components/cart/CartContext"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PersistedCartItem {
  productId: string
  variantId: string | null
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    stock: number
    variantId: string | null
    variantName: string | null
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
      variant: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
  })

  return items
    .filter((item) => !item.product.deleted)
    .map((item) => {
      // If variant exists, use variant price and stock
      const effectivePrice = item.variant ? item.variant.price : item.product.price
      const effectiveStock = item.variant ? item.variant.stock : item.product.stock

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: effectivePrice,
          images: item.product.images,
          stock: effectiveStock,
          variantId: item.variantId,
          variantName: item.variant?.name ?? null,
        },
      }
    })
}

// ── Save a single cart item (upsert) ──────────────────────────────────────

export async function saveCartItem(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  const userId = session.user.id

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId, productId, variantId },
    })
    return
  }

  // Prisma's compound unique key does not accept null in the `where` clause.
  // When variantId is null we must use findFirst + update/create manually.
  if (variantId) {
    await prisma.cartItem.upsert({
      where: { userId_productId_variantId: { userId, productId, variantId } },
      create: { userId, productId, variantId, quantity },
      update: { quantity },
    })
  } else {
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: null },
    })
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } })
    } else {
      await prisma.cartItem.create({ data: { userId, productId, variantId: null, quantity } })
    }
  }
}

// ── Remove a single cart item ──────────────────────────────────────────────

export async function removeCartItem(
  productId: string,
  variantId: string | null
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id, productId, variantId },
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

export async function mergeGuestCart(
  guestItems: { productId: string; variantId?: string | null; quantity: number }[]
): Promise<PersistedCartItem[]> {
  const session = await auth()
  if (!session?.user?.id || guestItems.length === 0) return loadCart()

  const userId = session.user.id

  const [dbItems, products, variants] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId } }),
    prisma.product.findMany({
      where: { id: { in: guestItems.map((i) => i.productId) }, deleted: false },
      select: { id: true, stock: true },
    }),
    guestItems.some((i) => i.variantId)
      ? prisma.productVariant.findMany({
          where: { id: { in: guestItems.map((i) => i.variantId).filter(Boolean) as string[] } },
          select: { id: true, stock: true },
        })
      : Promise.resolve([]),
  ])

  const productStockMap = new Map(products.map((p) => [p.id, p.stock]))
  const variantStockMap = new Map((variants as Array<{ id: string; stock: number }>).map((v) => [v.id, v.stock]))
  const dbMap = new Map(
    (dbItems as Array<{ productId: string; variantId: string | null; quantity: number }>).map(
      (i) => [`${i.productId}:${i.variantId ?? ""}`, i.quantity]
    )
  )

  await Promise.all(
    guestItems.map(async (guestItem) => {
      const stock = guestItem.variantId
        ? variantStockMap.get(guestItem.variantId)
        : productStockMap.get(guestItem.productId)
      if (stock === undefined) return

      const key = `${guestItem.productId}:${guestItem.variantId ?? ""}`
      const existing = dbMap.get(key) ?? 0
      const merged = Math.min(existing + guestItem.quantity, stock)
      if (merged <= 0) return

      const vid = guestItem.variantId ?? null

      if (vid) {
        await prisma.cartItem.upsert({
          where: { userId_productId_variantId: { userId, productId: guestItem.productId, variantId: vid } },
          create: { userId, productId: guestItem.productId, variantId: vid, quantity: merged },
          update: { quantity: merged },
        })
      } else {
        const existingRow = await prisma.cartItem.findFirst({
          where: { userId, productId: guestItem.productId, variantId: null },
        })
        if (existingRow) {
          await prisma.cartItem.update({ where: { id: existingRow.id }, data: { quantity: merged } })
        } else {
          await prisma.cartItem.create({ data: { userId, productId: guestItem.productId, variantId: null, quantity: merged } })
        }
      }
    })
  )

  return loadCart()
}
