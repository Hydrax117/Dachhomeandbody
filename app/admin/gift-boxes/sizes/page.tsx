import type { Metadata } from "next"
import Link from "next/link"
import { getAllGiftBoxSizeTiers } from "@/lib/gift-boxes"
import SizeTierForm from "./components/SizeTierForm"
import { updateGiftBoxSizeTierAction } from "@/app/actions/gift-boxes"

export const metadata: Metadata = { title: "Gift Box Sizes" }

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

export default async function GiftBoxSizesPage() {
  const tiers = await getAllGiftBoxSizeTiers()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/gift-boxes"
          className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors"
        >
          ← Gift Boxes
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Box Sizes &amp; Pricing
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Update item limits and prices for each gift box size. Changes take effect immediately.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-[#fffbf0] border border-[#B8965C]/30 rounded px-4 py-3">
        <p className="text-xs text-[#8C8C8C] leading-relaxed">
          <span className="font-medium text-[#111111]">Pricing note:</span> Changing a price only
          affects new orders. Past orders have their price stored at order time and are unaffected.
        </p>
      </div>

      {/* Size tier cards */}
      <div className="space-y-4">
        {tiers.map((tier) => {
          const boundAction = updateGiftBoxSizeTierAction.bind(null, tier.id)
          return (
            <div key={tier.id} className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
              {/* Tier header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ece4] bg-[#F8F5F2]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-[#B8965C]">
                    {tier.key}
                  </span>
                  <span className="text-sm font-medium text-[#111111]">{tier.label}</span>
                  <span className="text-xs text-[#8C8C8C]">·</span>
                  <span className="text-xs text-[#8C8C8C]">{tier.itemRange}</span>
                  <span className="text-xs text-[#8C8C8C]">·</span>
                  <span className="text-xs font-medium text-[#111111]">{formatCurrency(tier.price)}</span>
                </div>
                <span className={`text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
                  tier.active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]"
                }`}>
                  {tier.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Edit form */}
              <div className="px-6 py-5">
                <SizeTierForm action={boundAction} defaultValues={tier} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
