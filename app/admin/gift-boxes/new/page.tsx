import type { Metadata } from "next"
import Link from "next/link"
import GiftBoxForm from "../components/GiftBoxForm"
import { createGiftBoxAction } from "@/app/actions/gift-boxes"

export const metadata: Metadata = { title: "New Gift Box" }

export default function NewGiftBoxPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          New Gift Box
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Create a new luxury gift box style for customers to choose from.
        </p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded p-6 lg:p-8">
        <GiftBoxForm action={createGiftBoxAction} submitLabel="Create Gift Box" />
      </div>
    </div>
  )
}
