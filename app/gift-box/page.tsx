import type { Metadata } from "next"
import { connection } from "next/server"
import { getGiftBoxes, getGiftBoxSizeTiers } from "@/lib/gift-boxes"
import { getProducts } from "@/lib/products"
import { getCategories } from "@/lib/categories"
import { GiftBuilderProvider } from "./context/GiftBuilderContext"
import GiftBuilderClient from "./components/GiftBuilderClient"

export const metadata: Metadata = {
  title: "Build Your Own Gift Box",
  description:
    "Curate a personalised luxury fragrance gift experience. Choose your box, select products, add a personal message, and schedule delivery.",
}

export default async function GiftBoxPage() {
  await connection()

  const [giftBoxes, productsResult, categories, sizeTiers] = await Promise.all([
    getGiftBoxes({ active: true }),
    getProducts({}, "newest", { pageSize: 100 }),
    getCategories(),
    getGiftBoxSizeTiers(),
  ])

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
