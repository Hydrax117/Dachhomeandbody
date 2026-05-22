import type { Metadata } from "next"
import Link from "next/link"
import { getAdminGiftBoxes } from "@/lib/gift-boxes"
import { GIFT_BOX_THEME_META } from "@/lib/gift-boxes"
import DeleteGiftBoxButton from "./components/DeleteGiftBoxButton"

export const metadata: Metadata = { title: "Gift Boxes" }

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

export default async function AdminGiftBoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page, 10) || 1)
      : 1

  const { data: giftBoxes, total, totalPages } = await getAdminGiftBoxes({
    page,
    pageSize: 20,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Gift Boxes
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {total} box{total !== 1 ? "es" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gift-boxes/orders"
            className="inline-flex items-center gap-2 border border-[#e5e5e5] text-[#8C8C8C] text-xs tracking-[0.12em] uppercase px-4 py-2.5 rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/admin/gift-boxes/new"
            className="inline-flex items-center gap-2 bg-[#111111] text-white text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded hover:bg-[#1a1a1a] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Gift Box
          </Link>
        </div>
      </div>

      {/* Table */}
      {giftBoxes.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">No gift boxes yet.</p>
          <Link
            href="/admin/gift-boxes/new"
            className="inline-block mt-4 text-xs text-[#B8965C] hover:underline"
          >
            Create your first gift box →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Box
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                    Theme
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Capacity
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden lg:table-cell">
                    Orders
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {giftBoxes.map((box) => {
                  const meta = GIFT_BOX_THEME_META[box.theme]
                  const orderCount =
                    "_count" in box
                      ? (box as typeof box & { _count: { giftOrders: number } })
                          ._count.giftOrders
                      : 0

                  return (
                    <tr
                      key={box.id}
                      className="hover:bg-[#F8F5F2] transition-colors"
                    >
                      {/* Box name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={box.image}
                            alt={box.title}
                            width={40}
                            height={48}
                            className="w-10 h-12 object-cover border border-[#e5e5e5] shrink-0"
                          />
                          <div>
                            <p className="font-medium text-[#111111]">
                              {box.title}
                            </p>
                            <p className="text-[11px] text-[#8C8C8C] truncate max-w-[160px]">
                              {box.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Theme */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {meta.label}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {box.maxItems} items
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-medium text-[#111111] text-xs">
                          {box.price > 0
                            ? formatCurrency(box.price)
                            : "Free"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
                            box.active
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]"
                          }`}
                        >
                          {box.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[#8C8C8C]">
                          {orderCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/gift-boxes/${box.id}/edit`}
                            className="text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors px-2 py-1 rounded hover:bg-[#f0ece4]"
                          >
                            Edit
                          </Link>
                          <DeleteGiftBoxButton
                            id={box.id}
                            title={box.title}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#F8F5F2]">
              <p className="text-xs text-[#8C8C8C]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/gift-boxes?page=${page - 1}`}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/gift-boxes?page=${page + 1}`}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
