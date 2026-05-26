import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllShippingRates } from "@/lib/shipping"
import { ShippingRatesTable } from "./components/ShippingRatesTable"

export const metadata = {
  title: "Shipping Rates — Admin",
}

export default async function AdminShippingPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login")
  }

  const rates = await getAllShippingRates()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-light text-[#111111]">
          Shipping Rates
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Set per-state shipping fees for Nigeria. Customers will see the fee for
          their selected state at checkout.
        </p>
      </div>

      <ShippingRatesTable rates={rates} />
    </div>
  )
}
