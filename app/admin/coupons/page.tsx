/**
 * /admin/coupons — Coupon management page
 *
 * Displays all coupons with usage stats, status, and create/toggle/delete actions.
 * Requirements: 11.1, 11.4
 */

import { getAdminCoupons } from "@/lib/coupons"
import type { Metadata } from "next"
import { createCouponAction, toggleCouponActiveAction, deleteCouponAction } from "./actions"
import NewCouponPanel from "./components/NewCouponPanel"
import CouponRow from "./components/CouponRow"

export const metadata: Metadata = {
  title: "Coupons",
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#8b7355] mb-1">{label}</p>
      <p className="font-serif text-2xl font-medium text-[#111111]">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons()

  const now = new Date()
  const active = coupons.filter(
    (c) =>
      c.active &&
      (c.expiresAt == null || c.expiresAt > now) &&
      (c.maxUsageCount == null || c.usageCount < c.maxUsageCount)
  )
  const totalUses = coupons.reduce((sum, c) => sum + c.usageCount, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">Coupons</h1>
          <p className="text-sm text-[#8b7355] mt-1">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <NewCouponPanel createAction={createCouponAction} />
      </div>

      {/* Stats */}
      {coupons.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Coupons" value={coupons.length} />
          <StatCard label="Active" value={active.length} />
          <StatCard label="Total Uses" value={totalUses} />
        </div>
      )}

      {/* Table */}
      {coupons.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8b7355]">No coupons yet.</p>
          <p className="text-xs text-[#aaa] mt-1">
            Create your first coupon using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#FAF8F5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Discount
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Usage
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden md:table-cell">
                    Expires
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {coupons.map((coupon) => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    toggleAction={toggleCouponActiveAction}
                    deleteAction={deleteCouponAction}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
