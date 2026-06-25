/**
 * Dynamic server-side sitemap for database-driven routes.
 * Covers product detail pages and category filter pages.
 * Served at /server-sitemap.xml and referenced from robots.txt.
 */

import { getServerSideSitemap } from "next-sitemap"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { deleted: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { id: true },
      orderBy: { name: "asc" },
    }),
  ])

  const productEntries = products.map((product) => ({
    loc: `https://www.dachhomeandbody.com/shop/${product.slug}`,
    lastmod: product.updatedAt.toISOString(),
    changefreq: "weekly" as const,
    priority: 0.8,
  }))

  const categoryEntries = categories.map((cat) => ({
    loc: `https://www.dachhomeandbody.com/shop?categoryId=${cat.id}`,
    lastmod: new Date().toISOString(),
    changefreq: "weekly" as const,
    priority: 0.7,
  }))

  return getServerSideSitemap([...productEntries, ...categoryEntries])
}
