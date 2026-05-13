"use client"

import { useMemo } from "react"
import type { RevenueByDay } from "@/lib/analytics"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

interface RevenueChartProps {
  data: RevenueByDay[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const { points, maxRevenue, labels } = useMemo(() => {
    if (data.length === 0) return { points: [], maxRevenue: 0, labels: [] }

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

    const width = 600
    const height = 160
    const paddingX = 0
    const paddingY = 10

    const points = data.map((d, i) => {
      const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2)
      const y = paddingY + (1 - d.revenue / maxRevenue) * (height - paddingY * 2)
      return { x, y, ...d }
    })

    // Show ~5 evenly spaced labels
    const step = Math.max(1, Math.floor(data.length / 5))
    const labels = data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d) => {
        const date = new Date(d.date + "T00:00:00")
        return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
      })

    return { points, maxRevenue, labels }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#8b7355]">
        No data for this period
      </div>
    )
  }

  const width = 600
  const height = 160

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40"
        aria-label="Revenue trend chart"
        role="img"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#revenueGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#C8A96B"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#C8A96B"
            stroke="white"
            strokeWidth="1.5"
          >
            <title>
              {p.date}: {formatCurrency(p.revenue)} ({p.orders} order{p.orders !== 1 ? "s" : ""})
            </title>
          </circle>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        {labels.map((label, i) => (
          <span key={i} className="text-[10px] text-[#aaa]">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
