"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toggleWishlist } from "@/app/actions/wishlist"

interface WishlistButtonProps {
  productId: string
  initialInWishlist?: boolean
  className?: string
  size?: number
}

/**
 * Heart button to add/remove a product from the wishlist.
 * Redirects to login if the user is not authenticated.
 * Requirements: 7.1, 7.2
 */
export function WishlistButton({
  productId,
  initialInWishlist = false,
  className = "",
  size = 18,
}: WishlistButtonProps) {
  const { status } = useSession()
  const router = useRouter()
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    if (status !== "authenticated") {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    startTransition(async () => {
      const result = await toggleWishlist(productId)
      if (!result.error) {
        setInWishlist(result.inWishlist)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      className={`flex items-center justify-center transition-colors disabled:opacity-50 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={inWishlist ? "#B8965C" : "none"}
        stroke={inWishlist ? "#B8965C" : "currentColor"}
        strokeWidth="1.5"
        aria-hidden="true"
        className="transition-all duration-200"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
