import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getGiftBoxById } from "@/lib/gift-boxes"
import GiftBoxForm from "../../components/GiftBoxForm"
import { updateGiftBoxAction } from "@/app/actions/gift-boxes"

export const metadata: Metadata = { title: "Edit Gift Box" }

export default async function EditGiftBoxPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const box = await getGiftBoxById(id)
  if (!box) notFound()

  // Bind the id to the action
  const boundAction = updateGiftBoxAction.bind(null, id)

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
          Edit Gift Box
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">{box.title}</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded p-6 lg:p-8">
        <GiftBoxForm
          action={boundAction}
          defaultValues={box}
          submitLabel="Update Gift Box"
        />
      </div>
    </div>
  )
}
