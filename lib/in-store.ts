/**
 * In-store sales data access functions.
 * Records physical walk-in sales, decrements shared inventory,
 * and logs every change to StockHistory with channel = IN_STORE_SALE.
 */

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { Prisma } from "@prisma/client"

// ── Schemas ────────────────────────────────────────────────────────────────

export const inStoreSaleItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  variantName: z.string().optional().nullable(),
  productName: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().positive("Price must be greater than 0"),
})

export const inStoreSaleCreateSchema = z.object({
  items: z.array(inStoreSaleItemSchema).min(1, "At least one item is required"),
  customerName: z.string().max(100).optional().nullable(),
  paymentMethod: z.enum(["CASH", "POS", "TRANSFER"]).default("CASH"),
  notes: z.string().max(500).optional().nullable(),
})

export type InStoreSaleCreateInput = z.infer<typeof inStoreSaleCreateSchema>
export type InStoreSaleItem = z.infer<typeof inStoreSaleItemSchema>

// ── Types ──────────────────────────────────────────────────────────────────

export interface InStoreSaleRow {
  id: string
  saleNumber: string
  staffId: string | null
  customerName: string | null
  items: unknown
  subtotal: number
  total: number
  paymentMethod: string
  notes: string | null
  createdAt: Date
  staff: { id: string; name: string | null; email: string } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function generateSaleNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `IS-${timestamp}-${random}`
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getInStoreSales(options: {
  limit?: number
  offset?: number
  staffId?: string
  startDate?: Date
  endDate?: Date
}): Promise<{ data: InStoreSaleRow[]; total: number }> {
  const { limit = 20, offset = 0, staffId, startDate, endDate } = options

  const where: Prisma.InStoreSaleWhereInput = {}
  if (staffId) where.staffId = staffId
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const [data, total] = await Promise.all([
    prisma.inStoreSale.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        saleNumber: true,
        staffId: true,
        customerName: true,
        items: true,
        subtotal: true,
        total: true,
        paymentMethod: true,
        notes: true,
        createdAt: true,
        staff: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.inStoreSale.count({ where }),
  ])

  return { data: data as InStoreSaleRow[], total }
}

export async function getInStoreSale(id: string) {
  return prisma.inStoreSale.findUnique({
    where: { id },
    select: {
      id: true,
      saleNumber: true,
      staffId: true,
      customerName: true,
      items: true,
      subtotal: true,
      total: true,
      paymentMethod: true,
      notes: true,
      createdAt: true,
      staff: { select: { id: true, name: true, email: true } },
      stockHistory: {
        select: {
          id: true,
          productId: true,
          variantId: true,
          previousStock: true,
          newStock: true,
          change: true,
          createdAt: true,
          product: { select: { name: true } },
          variant: { select: { name: true } },
        },
      },
    },
  })
}

// ── Today's summary for the in-store dashboard ────────────────────────────

export async function getTodayInStoreSummary() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const sales = await prisma.inStoreSale.findMany({
    where: { createdAt: { gte: start } },
    select: { total: true, items: true },
  })

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const totalItems = sales.reduce((sum, s) => {
    const items = s.items as Array<{ quantity: number }>
    return sum + items.reduce((q, i) => q + i.quantity, 0)
  }, 0)

  return { saleCount: sales.length, totalRevenue, totalItems }
}

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Record an in-store sale.
 *
 * Structured to minimise round trips inside the transaction to avoid
 * pgbouncer's transaction-mode timeout:
 * 1. Bulk-fetch all products and variants needed (outside transaction — read-only)
 * 2. Validate stock availability (in memory, no DB)
 * 3. Run a single short transaction: create sale, bulk-update stock, bulk-create history
 */
export async function createInStoreSale(
  input: InStoreSaleCreateInput,
  staffUserId: string | null
): Promise<{ id: string; saleNumber: string }> {
  const { items, customerName, paymentMethod, notes } = inStoreSaleCreateSchema.parse(input)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  // ── 1. Bulk-fetch all products and variants needed ─────────────────────
  const productIds = [...new Set(items.map((i) => i.productId))]
  const variantIds = [...new Set(items.map((i) => i.variantId).filter((id): id is string => !!id))]

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, name: true },
    }),
    variantIds.length > 0
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, productId: true, stock: true, name: true },
        })
      : Promise.resolve([]),
  ])

  const productMap = new Map(products.map((p) => [p.id, p]))
  const variantMap = new Map(variants.map((v) => [v.id, v]))

  // ── 2. Validate stock in memory ────────────────────────────────────────
  for (const item of items) {
    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant) throw new Error(`Variant not found for ${item.productName}`)
      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName} (${variant.name}). ` +
          `Available: ${variant.stock}, Requested: ${item.quantity}`
        )
      }
    } else {
      const product = productMap.get(item.productId)
      if (!product) throw new Error(`Product not found: ${item.productName}`)
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName}. ` +
          `Available: ${product.stock}, Requested: ${item.quantity}`
        )
      }
    }
  }

  // Pre-compute all new stock values in memory to keep the transaction short
  // Track running stock per variant/product across multiple line items
  const variantStockDelta = new Map<string, number>() // variantId → total qty sold
  const productStockDelta = new Map<string, number>() // productId → total qty sold (non-variant)

  for (const item of items) {
    if (item.variantId) {
      variantStockDelta.set(
        item.variantId,
        (variantStockDelta.get(item.variantId) ?? 0) + item.quantity
      )
    } else {
      productStockDelta.set(
        item.productId,
        (productStockDelta.get(item.productId) ?? 0) + item.quantity
      )
    }
  }

  const saleNumber = generateSaleNumber()

  // ── 3. Single short transaction ────────────────────────────────────────
  return prisma.$transaction(async (tx) => {
    // Create the sale record
    const sale = await tx.inStoreSale.create({
      data: {
        saleNumber,
        staffId: staffUserId,
        customerName: customerName ?? null,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          variantName: i.variantName ?? null,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity,
        })),
        subtotal,
        total,
        paymentMethod,
        notes: notes ?? null,
      },
      select: { id: true, saleNumber: true },
    })

    // Decrement variant stock
    for (const [variantId, qty] of variantStockDelta.entries()) {
      const variant = variantMap.get(variantId)!
      const newStock = variant.stock - qty
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      })
      await tx.stockHistory.create({
        data: {
          productId: variant.productId,
          variantId,
          userId: staffUserId,
          inStoreSaleId: sale.id,
          previousStock: variant.stock,
          newStock,
          change: -qty,
          channel: "IN_STORE_SALE",
          reason: "In-store sale",
          notes: saleNumber,
        },
      })
    }

    // Re-sync product stock for products that had variant sales
    // Group variants by product
    const variantsByProduct = new Map<string, string[]>()
    for (const [variantId] of variantStockDelta.entries()) {
      const productId = variantMap.get(variantId)!.productId
      const existing = variantsByProduct.get(productId) ?? []
      variantsByProduct.set(productId, [...existing, variantId])
    }

    for (const [productId] of variantsByProduct.entries()) {
      // Sum all variant stocks (using the delta values we already know)
      const allVariants = variants.filter((v) => v.productId === productId)
      const newProductStock = allVariants.reduce((sum, v) => {
        const delta = variantStockDelta.get(v.id) ?? 0
        return sum + (v.stock - delta)
      }, 0)
      await tx.product.update({
        where: { id: productId },
        data: { stock: newProductStock },
      })
    }

    // Decrement non-variant product stock
    for (const [productId, qty] of productStockDelta.entries()) {
      const product = productMap.get(productId)!
      const newStock = product.stock - qty
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      })
      await tx.stockHistory.create({
        data: {
          productId,
          variantId: null,
          userId: staffUserId,
          inStoreSaleId: sale.id,
          previousStock: product.stock,
          newStock,
          change: -qty,
          channel: "IN_STORE_SALE",
          reason: "In-store sale",
          notes: saleNumber,
        },
      })
    }

    return sale
  }, {
    // Give pgbouncer enough headroom — 15 seconds covers the bulk writes
    timeout: 15000,
  })
}
