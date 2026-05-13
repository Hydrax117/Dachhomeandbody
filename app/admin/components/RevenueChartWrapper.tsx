"use client"

import dynamic from "next/dynamic"
import type { RevenueByDay } from "@/lib/analytics"

const RevenueChart = dynamic(() => import("./RevenueChart"), { ssr: false })

export default function RevenueChartWrapper({ data }: { data: RevenueByDay[] }) {
  return <RevenueChart data={data} />
}
