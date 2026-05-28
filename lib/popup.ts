/**
 * Popup configuration data access.
 */

import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

export const popupConfigSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).default(""),
  ctaLabel: z.string().min(1, "CTA label is required").max(60),
  ctaUrl: z.string().min(1, "CTA URL is required").max(500),
  imageUrl: z.string().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
  productName: z.string().max(120).optional().or(z.literal("")),
  productId: z.string().optional().or(z.literal("")),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  delaySeconds: z.coerce.number().int().min(0).max(30).default(4),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
})

export type PopupConfigInput = z.infer<typeof popupConfigSchema>

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get the single popup config record (upsert pattern — always one row).
 */
export async function getPopupConfig() {
  return prisma.popupConfig.findFirst({
    orderBy: { createdAt: "asc" },
    include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } },
  })
}

/**
 * Get popup config for public display — only returns if enabled and within date range.
 */
export async function getActivePopupConfig() {
  const config = await prisma.popupConfig.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!config || !config.enabled) return null

  const now = new Date()
  if (config.startDate && config.startDate > now) return null
  if (config.endDate && config.endDate < now) return null

  return config
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Upsert the popup config (create if none exists, update otherwise).
 */
export async function upsertPopupConfig(input: PopupConfigInput) {
  const data = popupConfigSchema.parse(input)

  const existing = await prisma.popupConfig.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })

  const payload = {
    enabled: data.enabled,
    title: data.title,
    description: data.description,
    ctaLabel: data.ctaLabel,
    ctaUrl: data.ctaUrl,
    imageUrl: data.imageUrl || null,
    productName: data.productName || null,
    productId: data.productId || null,
    originalPrice: data.originalPrice ?? null,
    discountPercent: data.discountPercent ?? null,
    delaySeconds: data.delaySeconds,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  }

  if (existing) {
    return prisma.popupConfig.update({ where: { id: existing.id }, data: payload })
  }

  return prisma.popupConfig.create({ data: payload })
}
