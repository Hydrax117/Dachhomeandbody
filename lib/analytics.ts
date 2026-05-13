/**
 * Analytics data access functions for the admin dashboard.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { prisma } from '@/lib/prisma'

export interface AnalyticsSummary {
  totalRevenue: number
  orderCount: number
  customerCount: number
  averageOrderValue: number
}

export interface RevenueByDay {
  date: string // ISO date string YYYY-MM-DD
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string
  name: string
  slug: string
  totalQuantity: number
  totalRevenue: number
}

export interface CustomerMetrics {
  newCustomers: number
  returningCustomers: number
  returningPercentage: number
}

/**
 * Get summary analytics for a date range.
 * Requirement 10.1, 10.5
 */
export async function getAnalyticsSummary(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSummary> {
  const [revenueResult, orderCount, customerCount] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
  ])

  const totalRevenue = revenueResult._sum.total ?? 0
  const paidOrderCount = revenueResult._count.id ?? 0

  return {
    totalRevenue,
    orderCount,
    customerCount,
    averageOrderValue: paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0,
  }
}

/**
 * Get revenue grouped by day for a date range.
 * Requirement 10.2
 */
export async function getRevenueByDay(
  startDate: Date,
  endDate: Date
): Promise<RevenueByDay[]> {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day
  const byDay = new Map<string, { revenue: number; orders: number }>()

  // Pre-fill all days in range with zeros
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  while (current <= end) {
    const key = current.toISOString().slice(0, 10)
    byDay.set(key, { revenue: 0, orders: 0 })
    current.setDate(current.getDate() + 1)
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10)
    const existing = byDay.get(key) ?? { revenue: 0, orders: 0 }
    byDay.set(key, {
      revenue: existing.revenue + order.total,
      orders: existing.orders + 1,
    })
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))
}

/**
 * Get top products by sales volume for a date range.
 * Requirement 10.3
 */
export async function getTopProducts(
  startDate: Date,
  endDate: Date,
  limit = 8
): Promise<TopProduct[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    select: {
      productId: true,
      quantity: true,
      subtotal: true,
      product: { select: { name: true, slug: true } },
    },
  })

  // Aggregate by product
  const byProduct = new Map<
    string,
    { name: string; slug: string; totalQuantity: number; totalRevenue: number }
  >()

  for (const item of items) {
    const existing = byProduct.get(item.productId) ?? {
      name: item.product.name,
      slug: item.product.slug,
      totalQuantity: 0,
      totalRevenue: 0,
    }
    byProduct.set(item.productId, {
      ...existing,
      totalQuantity: existing.totalQuantity + item.quantity,
      totalRevenue: existing.totalRevenue + item.subtotal,
    })
  }

  return Array.from(byProduct.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit)
}

/**
 * Get customer metrics (new vs returning) for a date range.
 * Requirement 10.4
 */
export async function getCustomerMetrics(
  startDate: Date,
  endDate: Date
): Promise<CustomerMetrics> {
  // New customers: registered in the date range
  const newCustomers = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: startDate, lte: endDate },
    },
  })

  // Orders in range
  const ordersInRange = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      userId: { not: null },
    },
    select: {
      userId: true,
      user: { select: { createdAt: true } },
    },
  })

  const totalOrders = ordersInRange.length
  let returningOrders = 0

  for (const order of ordersInRange) {
    // Returning = user was created before the start of this range
    if (order.user && order.user.createdAt < startDate) {
      returningOrders++
    }
  }

  const returningPercentage =
    totalOrders > 0 ? Math.round((returningOrders / totalOrders) * 100) : 0

  return {
    newCustomers,
    returningCustomers: returningOrders,
    returningPercentage,
  }
}
