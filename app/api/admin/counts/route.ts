/**
 * GET /api/admin/counts
 *
 * Returns live unprocessed counts for the admin sidebar badges.
 * Lightweight — only touches count queries, no full data fetches.
 * Polled every 30 seconds by the AdminSidebar client component.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [pendingOrders, newPayRequests, pendingReviews, lowStock] = await Promise.all([
    // Orders paid but not yet actioned (PENDING status)
    prisma.order.count({
      where: { status: "PENDING", paymentStatus: "PAID" },
    }),
    // Pay-For-Me requests that have been paid — these show up as orders but
    // the admin may not have seen them yet (created in last 24 hours)
    prisma.paymentRequest.count({
      where: {
        status: "PAID",
        paidAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    // Reviews waiting for moderation
    prisma.review.count({ where: { status: "PENDING" } }),
    // Products nearly out of stock
    prisma.product.count({ where: { stock: { lte: 5 }, deleted: false } }),
  ])

  return NextResponse.json(
    { pendingOrders, newPayRequests, pendingReviews, lowStock },
    {
      headers: {
        // Cache for 20 seconds — fresh enough without hammering the DB
        "Cache-Control": "private, max-age=20",
      },
    }
  )
}
