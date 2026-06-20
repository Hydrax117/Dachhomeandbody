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
 * - Validates stock availability
 * - Decrements stock (variant if applicable, otherwise product)
 * - Re-syncs product base stock when variants are involved
 * - Creates StockHistory entries with channel = IN_STORE_SALE
 * All wrapped in a transaction.
 */
export async function createInStoreSale(
  input: InStoreSaleCreateInput,
  staffUserId: string | null
): Promise<{ id: string; saleNumber: string }> {
  const { items, customerName, paymentMethod, notes } = inStoreSaleCreateSchema.parse(input)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // No shipping for in-store; extend later if needed

  // Validate stock availability before starting transaction
  for (const item of items) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, name: true },
      })
      if (!variant) throw new Error(`Variant not found for ${item.productName}`)
      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName} (${variant.name}). ` +
          `Available: ${variant.stock}, Requested: ${item.quantity}`
        )
      }
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      })
      if (!product) throw new Error(`Product not found: ${item.productName}`)
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName}. ` +
          `Available: ${product.stock}, Requested: ${item.quantity}`
        )
      }
    }
  }

  return prisma.$transaction(async (tx) => {
    // Create the in-store sale record
    const sale = await tx.inStoreSale.create({
      data: {
        saleNumber: generateSaleNumber(),
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

    // Decrement stock and create history entries
    for (const item of items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        })
        if (!variant) continue

        const newVariantStock = variant.stock - item.quantity

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: newVariantStock },
        })

        // Re-sync product base stock from sum of variants
        const variants = await tx.productVariant.findMany({
          where: { productId: item.productId },
          select: { stock: true },
        })
        const newProductStock = variants.reduce((s, v) => s + v.stock, 0)

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        })

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newProductStock },
        })

        await tx.stockHistory.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            userId: staffUserId,
            inStoreSaleId: sale.id,
            previousStock: variant.stock,
            newStock: newVariantStock,
            change: -item.quantity,
            channel: "IN_STORE_SALE",
            reason: "In-store sale",
            notes: sale.saleNumber,
          },
        })

        // Also record the product-level sync
        if (product) {
          await tx.stockHistory.create({
            data: {
              productId: item.productId,
              variantId: null,
              userId: staffUserId,
              inStoreSaleId: sale.id,
              previousStock: product.stock,
              newStock: newProductStock,
              change: newProductStock - product.stock,
              channel: "IN_STORE_SALE",
              reason: "In-store sale (product sync)",
              notes: sale.saleNumber,
            },
          })
        }
      } else {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        })
        if (!product) continue

        const newStock = product.stock - item.quantity

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        })

        await tx.stockHistory.create({
          data: {
            productId: item.productId,
            variantId: null,
            userId: staffUserId,
            inStoreSaleId: sale.id,
            previousStock: product.stock,
            newStock,
            change: -item.quantity,
            channel: "IN_STORE_SALE",
            reason: "In-store sale",
            notes: sale.saleNumber,
          },
        })
      }
    }

    return sale
  })
}
