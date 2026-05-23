/**
 * Gift Box data access layer.
 * Covers customer-facing queries and admin CRUD for the
 * "Build Your Own Gift Box" feature.
 */

import { z } from "zod"
import { type Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  buildPaginationArgs,
  paginate,
  type PaginationParams,
} from "@/lib/db"

// ---------------------------------------------------------------------------
// Enum definitions — defined here to avoid build-time Prisma resolution issues
// ---------------------------------------------------------------------------

export const GiftBoxTheme = {
  SIGNATURE_CREAM: "SIGNATURE_CREAM",
  NOIR_LUXURY: "NOIR_LUXURY",
  ROMANTIC_BLUSH: "ROMANTIC_BLUSH",
} as const
export type GiftBoxTheme = (typeof GiftBoxTheme)[keyof typeof GiftBoxTheme]

export const GiftCardStyle = {
  MINIMAL: "MINIMAL",
  ROMANTIC: "ROMANTIC",
  BIRTHDAY: "BIRTHDAY",
  LUXURY_GOLD: "LUXURY_GOLD",
} as const
export type GiftCardStyle = (typeof GiftCardStyle)[keyof typeof GiftCardStyle]

export const GiftRibbonStyle = {
  BLACK_SATIN: "BLACK_SATIN",
  IVORY_SILK: "IVORY_SILK",
  BLUSH_RIBBON: "BLUSH_RIBBON",
  GOLD_VELVET: "GOLD_VELVET",
} as const
export type GiftRibbonStyle = (typeof GiftRibbonStyle)[keyof typeof GiftRibbonStyle]

export const GiftOrderStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const
export type GiftOrderStatus = (typeof GiftOrderStatus)[keyof typeof GiftOrderStatus]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GiftBoxFilters {
  active?: boolean
  theme?: GiftBoxTheme
}

// Prisma select for customer-facing gift box list
const giftBoxSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
  maxItems: true,
  price: true,
  theme: true,
  active: true,
  sortOrder: true,
} satisfies Prisma.GiftBoxSelect

// Full gift order with relations
const giftOrderSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  guestEmail: true,
  guestName: true,
  subtotal: true,
  boxPrice: true,
  total: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentReference: true,
  shippingAddress: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  giftBox: { select: giftBoxSelect },
  customization: {
    select: {
      id: true,
      message: true,
      cardStyle: true,
      ribbonStyle: true,
      deliveryDate: true,
      anonymous: true,
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      price: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          topNotes: true,
          heartNotes: true,
          baseNotes: true,
          moodTags: true,
        },
      },
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.GiftOrderSelect

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

export const giftBoxCreateSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  image: z.string().url(),
  maxItems: z.number().int().min(1).max(20),
  price: z.number().nonnegative(),
  theme: z.enum(["SIGNATURE_CREAM", "NOIR_LUXURY", "ROMANTIC_BLUSH"]),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const giftBoxUpdateSchema = giftBoxCreateSchema.partial()

export const giftCustomizationSchema = z.object({
  message: z.string().max(200).optional(),
  cardStyle: z.enum(["MINIMAL", "ROMANTIC", "BIRTHDAY", "LUXURY_GOLD"]).default("MINIMAL"),
  ribbonStyle: z.enum(["BLACK_SATIN", "IVORY_SILK", "BLUSH_RIBBON", "GOLD_VELVET"]).default("BLACK_SATIN"),
  deliveryDate: z.coerce.date().optional(),
  anonymous: z.boolean().default(false),
})

export const giftOrderCreateSchema = z.object({
  giftBoxId: z.string().min(1),
  productIds: z.array(z.string()).min(1),
  customization: giftCustomizationSchema,
  shippingAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().default("Nigeria"),
  }),
  paymentMethod: z.string().min(1),
  notes: z.string().max(500).optional(),
})

export type GiftBoxCreateInput = z.infer<typeof giftBoxCreateSchema>
export type GiftBoxUpdateInput = z.infer<typeof giftBoxUpdateSchema>
export type GiftCustomizationInput = z.infer<typeof giftCustomizationSchema>
export type GiftOrderCreateInput = z.infer<typeof giftOrderCreateSchema>

// ---------------------------------------------------------------------------
// Customer-facing queries
// ---------------------------------------------------------------------------

/** Get all active gift boxes, ordered by sortOrder. */
export async function getGiftBoxes(filters: GiftBoxFilters = {}) {
  const where: Prisma.GiftBoxWhereInput = {}
  if (filters.active !== undefined) where.active = filters.active
  if (filters.theme) where.theme = filters.theme

  return prisma.giftBox.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: giftBoxSelect,
  })
}

/** Get a single gift box by slug. */
export async function getGiftBox(slug: string) {
  return prisma.giftBox.findUnique({
    where: { slug },
    select: giftBoxSelect,
  })
}

/** Get a single gift box by id. */
export async function getGiftBoxById(id: string) {
  return prisma.giftBox.findUnique({
    where: { id },
    select: giftBoxSelect,
  })
}

// ---------------------------------------------------------------------------
// Gift order queries
// ---------------------------------------------------------------------------

/** Get a gift order by id with all relations. */
export async function getGiftOrder(id: string) {
  return prisma.giftOrder.findUnique({
    where: { id },
    select: giftOrderSelect,
  })
}

/** Get a gift order by order number. */
export async function getGiftOrderByNumber(orderNumber: string) {
  return prisma.giftOrder.findUnique({
    where: { orderNumber },
    select: giftOrderSelect,
  })
}

/** Get all gift orders for a user. */
export async function getUserGiftOrders(userId: string) {
  return prisma.giftOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: giftOrderSelect,
  })
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

/** Get all gift boxes for admin (including inactive). */
export async function getAdminGiftBoxes(pagination: PaginationParams = {}) {
  const { skip, take } = buildPaginationArgs(pagination)
  const [data, total] = await Promise.all([
    prisma.giftBox.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      skip,
      take,
      select: { ...giftBoxSelect, _count: { select: { giftOrders: true } } },
    }),
    prisma.giftBox.count(),
  ])
  return paginate(data, total, pagination)
}

/** Get all gift orders for admin with filters. */
export async function getAdminGiftOrders(
  filters: { status?: GiftOrderStatus; search?: string } = {},
  pagination: PaginationParams = {}
) {
  const where: Prisma.GiftOrderWhereInput = {}
  if (filters.status) where.status = filters.status
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      { user: { email: { contains: filters.search, mode: "insensitive" } } },
      { guestEmail: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const { skip, take } = buildPaginationArgs(pagination)
  const [data, total] = await Promise.all([
    prisma.giftOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: giftOrderSelect,
    }),
    prisma.giftOrder.count({ where }),
  ])
  return paginate(data, total, pagination)
}

// ---------------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------------

/** Create a new gift box. */
export async function createGiftBox(input: GiftBoxCreateInput) {
  const data = giftBoxCreateSchema.parse(input)
  return prisma.giftBox.create({ data, select: giftBoxSelect })
}

/** Update an existing gift box. */
export async function updateGiftBox(id: string, input: GiftBoxUpdateInput) {
  const data = giftBoxUpdateSchema.parse(input)
  return prisma.giftBox.update({ where: { id }, data, select: giftBoxSelect })
}

/** Delete a gift box (hard delete — only if no orders). */
export async function deleteGiftBox(id: string) {
  const orderCount = await prisma.giftOrder.count({ where: { giftBoxId: id } })
  if (orderCount > 0) {
    // Soft-disable instead of deleting
    return prisma.giftBox.update({
      where: { id },
      data: { active: false },
      select: giftBoxSelect,
    })
  }
  return prisma.giftBox.delete({ where: { id } })
}

/** Update gift order status. */
export async function updateGiftOrderStatus(
  id: string,
  status: GiftOrderStatus
) {
  return prisma.giftOrder.update({
    where: { id },
    data: { status },
    select: giftOrderSelect,
  })
}

// ---------------------------------------------------------------------------
// Gift order creation (transactional)
// ---------------------------------------------------------------------------

/** Generate a unique gift order number. */
function generateGiftOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GIFT-${timestamp}-${random}`
}

/**
 * Create a complete gift order in a single transaction:
 * 1. Validate the gift box exists and has capacity
 * 2. Validate all products exist and are in stock
 * 3. Create GiftCustomization
 * 4. Create GiftOrder with GiftOrderItems
 */
export async function createGiftOrder(
  input: GiftOrderCreateInput,
  userId?: string
) {
  const data = giftOrderCreateSchema.parse(input)

  return prisma.$transaction(async (tx) => {
    // 1. Validate gift box
    const giftBox = await tx.giftBox.findUnique({
      where: { id: data.giftBoxId, active: true },
    })
    if (!giftBox) throw new Error("Gift box not found or unavailable")
    if (data.productIds.length > giftBox.maxItems) {
      throw new Error(
        `This box holds a maximum of ${giftBox.maxItems} items`
      )
    }

    // 2. Validate products — check unique IDs only
    const uniqueProductIds = [...new Set(data.productIds)]
    const products = await tx.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        deleted: false,
        stock: { gt: 0 },
      },
      select: { id: true, price: true, stock: true, name: true },
    })

    if (products.length !== uniqueProductIds.length) {
      throw new Error("One or more products are unavailable")
    }

    // 3. Build price map (count duplicates for quantity)
    const quantityMap = new Map<string, number>()
    for (const pid of data.productIds) {
      quantityMap.set(pid, (quantityMap.get(pid) ?? 0) + 1)
    }

    const productMap = new Map(products.map((p) => [p.id, p]))
    let subtotal = 0
    for (const [pid, qty] of quantityMap) {
      const product = productMap.get(pid)!
      subtotal += product.price * qty
    }

    const boxPrice = giftBox.price
    const total = subtotal + boxPrice

    // 4. Create customization
    const customization = await tx.giftCustomization.create({
      data: {
        message: data.customization.message ?? null,
        cardStyle: data.customization.cardStyle,
        ribbonStyle: data.customization.ribbonStyle,
        deliveryDate: data.customization.deliveryDate ?? null,
        anonymous: data.customization.anonymous,
      },
    })

    // 5. Create gift order
    const orderNumber = generateGiftOrderNumber()
    const giftOrder = await tx.giftOrder.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        giftBoxId: data.giftBoxId,
        customizationId: customization.id,
        subtotal,
        boxPrice,
        total,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: Array.from(quantityMap.entries()).map(([pid, qty]) => ({
            productId: pid,
            quantity: qty,
            price: productMap.get(pid)!.price,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
      },
    })

    return giftOrder
  })
}

// ---------------------------------------------------------------------------
// Theme / style metadata (used in UI)
// ---------------------------------------------------------------------------

export const GIFT_BOX_THEME_META: Record<
  GiftBoxTheme,
  { label: string; description: string; palette: string }
> = {
  SIGNATURE_CREAM: {
    label: "Signature Cream",
    description: "Cream textured packaging with black satin ribbon and gold embossed logo",
    palette: "from-[#F2EDE8] to-[#E8DDD4]",
  },
  NOIR_LUXURY: {
    label: "Noir Luxury",
    description: "Matte black rigid box with velvet interior and gold foil branding",
    palette: "from-[#1A1A1A] to-[#0A0A0A]",
  },
  ROMANTIC_BLUSH: {
    label: "Romantic Blush",
    description: "Nude blush tones with silk ribbon and a delicate floral insert card",
    palette: "from-[#F5E6E0] to-[#EDD5CC]",
  },
}

export const GIFT_CARD_STYLE_META: Record<GiftCardStyle, { label: string }> = {
  MINIMAL: { label: "Minimal" },
  ROMANTIC: { label: "Romantic" },
  BIRTHDAY: { label: "Birthday" },
  LUXURY_GOLD: { label: "Luxury Gold" },
}

export const GIFT_RIBBON_STYLE_META: Record<GiftRibbonStyle, { label: string }> = {
  BLACK_SATIN: { label: "Black Satin" },
  IVORY_SILK: { label: "Ivory Silk" },
  BLUSH_RIBBON: { label: "Blush Ribbon" },
  GOLD_VELVET: { label: "Gold Velvet" },
}
