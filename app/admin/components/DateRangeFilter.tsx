"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

export type DateRangePreset = "7d" | "30d" | "90d" | "365d"

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "365d" },
]

interface DateRangeFilterProps {
  current: DateRangePreset
}

export default function DateRangeFilter({ current }: DateRangeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setRange = useCallback(
    (range: DateRangePreset) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("range", range)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-1 bg-white border border-[#e5e5e5] rounded p-1">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => setRange(preset.value)}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            current === preset.value
              ? "bg-[#111111] text-white"
              : "text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f5f0e8]"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
