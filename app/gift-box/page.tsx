import type { Metadata } from "next"
import { connection } from "next/server"
import { getGiftBoxes, getGiftBoxSizeTiers } from "@/lib/gift-boxes"
import { getProducts } from "@/lib/products"
import { getCategories } from "@/lib/categories"
import { GiftBuilderProvider } from "./context/GiftBuilderContext"
import GiftBuilderClient from "./components/GiftBuilderClient"
import { withDbFallback } from "@/lib/db-resilience"
import ServiceUnavailable from "@/app/components/ui/ServiceUnavailable"

export const metadata: Metadata = {
  title: "Build Your Own Gift Box",
  description:
    "Curate a personalised luxury fragrance gift experience. Choose your box, select products, add a personal message, and schedule delivery.",
}

export default async function GiftBoxPage() {
  await connection()

  const [
    { data: giftBoxes, unavailable },
    { data: productsResult },
    { data: categories },
    { data: sizeTiers },
  ] = await Promise.all([
    withDbFallback(() => getGiftBoxes({ active: true }), []),
    withDbFallback(() => getProducts({}, "newest", { pageSize: 100 }), { data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 }),
    withDbFallback(() => getCategories(), []),
    withDbFallback(() => getGiftBoxSizeTiers(), []),
  ])

  if (unavailable) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <ServiceUnavailable message="The gift box builder is temporarily unavailable. Please try again in a moment." />
      </div>
    )
  }

  return (
    <GiftBuilderProvider>
      <GiftBuilderClient
        giftBoxes={giftBoxes}
        products={productsResult.data}
        categories={categories}
        sizeTiers={sizeTiers}
      />
    </GiftBuilderProvider>
  )
}
