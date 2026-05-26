/**
 * Shipping rate data access and helpers.
 * Rates are stored per Nigerian state in the ShippingRate table.
 * Admins can update fees; the checkout flow reads them to calculate shipping cost.
 */

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShippingRateRow {
  id: string
  state: string
  fee: number
  updatedAt: Date
}

// ── Read ───────────────────────────────────────────────────────────────────

/**
 * Get all shipping rates, sorted alphabetically by state.
 */
export async function getAllShippingRates(): Promise<ShippingRateRow[]> {
  return prisma.shippingRate.findMany({
    orderBy: { state: "asc" },
    select: { id: true, state: true, fee: true, updatedAt: true },
  })
}

/**
 * Get the shipping fee for a specific state.
 * Returns null if no rate is configured for that state (treat as free / TBD).
 */
export async function getShippingFeeForState(
  state: string
): Promise<number | null> {
  const rate = await prisma.shippingRate.findUnique({
    where: { state },
    select: { fee: true },
  })
  return rate?.fee ?? null
}

// ── Write ──────────────────────────────────────────────────────────────────

/**
 * Upsert a shipping rate for a state.
 * Creates the record if it doesn't exist, updates it if it does.
 */
export async function upsertShippingRate(
  state: string,
  fee: number
): Promise<ShippingRateRow> {
  const rate = await prisma.shippingRate.upsert({
    where: { state },
    update: { fee },
    create: { state, fee },
    select: { id: true, state: true, fee: true, updatedAt: true },
  })

  revalidatePath("/admin/shipping")
  return rate
}

/**
 * Bulk upsert shipping rates (used for seeding all states at once).
 */
export async function bulkUpsertShippingRates(
  rates: Array<{ state: string; fee: number }>
): Promise<void> {
  await prisma.$transaction(
    rates.map(({ state, fee }) =>
      prisma.shippingRate.upsert({
        where: { state },
        update: { fee },
        create: { state, fee },
      })
    )
  )
  revalidatePath("/admin/shipping")
}
