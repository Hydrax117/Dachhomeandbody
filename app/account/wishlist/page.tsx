/**
 * /account/wishlist — Customer wishlist page
 *
 * Displays saved products with current prices and stock status.
 * Allows adding items to cart and removing from wishlist.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWishlist } from "@/app/actions/wishlist"
import WishlistClient from "./components/WishlistClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Wishlist",
}

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account/wishlist")
  }

  const items = await getWishlist()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          My Wishlist
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {items.length === 0
            ? "No saved items yet."
            : `${items.length} saved item${items.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <WishlistClient initialItems={items} />
    </div>
  )
}
