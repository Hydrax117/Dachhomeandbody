/**
 * /admin/reviews — Review moderation page
 *
 * Displays all reviews with approve/reject actions.
 * Pending reviews are shown by default.
 * Requirements: 6.2, 6.3
 */

import {
  getAdminReviews,
  type AdminReviewFilters,
  type AdminReviewSort,
  type AdminReviewRow,
} from "@/lib/reviews"
import Link from "next/link"
import type { Metadata } from "next"
import ReviewsToolbar from "./components/ReviewsToolbar"
import ReviewModerationActions from "./components/ReviewModerationActions"

export const metadata: Metadata = {
  title: "Reviews",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const
type ReviewStatusValue = (typeof VALID_STATUSES)[number]

const VALID_SORTS: AdminReviewSort[] = ["newest", "oldest", "rating_desc", "rating_asc"]

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
        statusStyles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.toLowerCase()}
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i < rating ? "#C8A96B" : "none"}
          stroke={i < rating ? "#C8A96B" : "#d1d5db"}
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  newPage: number
): string {
  const qs = new URLSearchParams()
  if (params.search && typeof params.search === "string") qs.set("search", params.search)
  if (params.status && typeof params.status === "string") qs.set("status", params.status)
  if (params.sort && typeof params.sort === "string") qs.set("sort", params.sort)
  qs.set("page", String(newPage))
  return `/admin/reviews?${qs.toString()}`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const search = typeof params.search === "string" ? params.search : ""
  const rawStatus = typeof params.status === "string" ? params.status : "PENDING"
  const status = VALID_STATUSES.includes(rawStatus as ReviewStatusValue)
    ? (rawStatus as ReviewStatusValue)
    : "PENDING"
  const rawSort = typeof params.sort === "string" ? params.sort : "newest"
  const sort: AdminReviewSort = VALID_SORTS.includes(rawSort as AdminReviewSort)
    ? (rawSort as AdminReviewSort)
    : "newest"
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  const pageSize = 20

  const filters: AdminReviewFilters = {
    search: search || undefined,
    status: status || undefined,
  }

  const result = await getAdminReviews(filters, sort, { page, pageSize })
  const { data: reviews, total, totalPages } = result

  const hasFilters = search || sort !== "newest"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">Reviews</h1>
        <p className="text-sm text-[#8b7355] mt-1">
          {total} review{total !== 1 ? "s" : ""}
          {status ? ` with status: ${status.toLowerCase()}` : ""}
          {hasFilters ? " matching filters" : ""}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-[#e5e5e5]">
        {[
          { value: "PENDING", label: "Pending" },
          { value: "APPROVED", label: "Approved" },
          { value: "REJECTED", label: "Rejected" },
          { value: "", label: "All" },
        ].map((tab) => {
          const isActive = status === tab.value || (!status && tab.value === "")
          const qs = new URLSearchParams()
          if (tab.value) qs.set("status", tab.value)
          if (search) qs.set("search", search)
          if (sort !== "newest") qs.set("sort", sort)
          const href = `/admin/reviews${qs.toString() ? `?${qs.toString()}` : ""}`
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-[#C8A96B] text-[#111111] font-medium"
                  : "border-transparent text-[#8b7355] hover:text-[#111111]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Toolbar */}
      <ReviewsToolbar
        currentSearch={search}
        currentStatus={status}
        currentSort={sort}
      />

      {/* Table */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8b7355]">
            {hasFilters || status
              ? "No reviews match your filters."
              : "No reviews yet."}
          </p>
          {(hasFilters || status) && (
            <Link
              href="/admin/reviews"
              className="inline-block mt-3 text-xs text-[#C8A96B] hover:underline"
            >
              Clear filters →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#FAF8F5]">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden sm:table-cell">
                    Reviewer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden md:table-cell">
                    Review
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8b7355] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {reviews.map((review: AdminReviewRow) => (
                  <tr key={review.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {review.product.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.product.images[0]}
                            alt={review.product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded border border-[#e5e5e5] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${review.product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#111111] hover:text-[#C8A96B] transition-colors truncate block max-w-[140px]"
                          >
                            {review.product.name}
                          </Link>
                          {review.verifiedPurchase && (
                            <span className="text-[10px] text-green-700">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Reviewer */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-[#111111] truncate max-w-[160px]">
                        {review.user.name ?? "—"}
                      </p>
                      <p className="text-[11px] text-[#8b7355] truncate max-w-[160px]">
                        {review.user.email}
                      </p>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <StarRating rating={review.rating} />
                    </td>

                    {/* Review text */}
                    <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                      {review.title && (
                        <p className="text-xs font-medium text-[#111111] truncate">
                          {review.title}
                        </p>
                      )}
                      <p className="text-xs text-[#8b7355] line-clamp-2">{review.comment}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <StatusBadge status={review.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#8b7355]">
                        {new Date(review.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <ReviewModerationActions
                        reviewId={review.id}
                        currentStatus={review.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#FAF8F5]">
              <p className="text-xs text-[#8b7355]">
                Page {page} of {totalPages} — {total} reviews
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(params, page - 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(params, page + 1)}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#C8A96B] hover:text-[#C8A96B] transition-colors"
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
