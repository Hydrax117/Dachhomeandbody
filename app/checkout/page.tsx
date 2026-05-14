import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CheckoutClient } from "./components/CheckoutClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
}

interface PageProps {
  searchParams: Promise<{ payment_error?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const paymentError = params.payment_error ?? null
  const session = await auth()

  // Load saved addresses for authenticated users
  let savedAddresses: Array<{
    id: string
    name: string
    phone: string
    address: string
    city: string
    state: string | null
    postalCode: string
    country: string
    isDefault: boolean
  }> = []

  if (session?.user?.id) {
    savedAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    })
  }

  return (
    <CheckoutClient
      isAuthenticated={!!session?.user}
      userEmail={session?.user?.email ?? null}
      userName={session?.user?.name ?? null}
      savedAddresses={savedAddresses}
      paymentError={paymentError}
    />
  )
}
