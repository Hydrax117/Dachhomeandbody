"use client"

import { useTransition } from "react"
import { deleteScheduledCampaignAction } from "../actions"

interface ScheduledCampaign {
  id: string
  subject: string
  headline: string
  sendTo: string
  scheduledAt: Date
  status: string
  sentCount: number | null
  createdAt: Date
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: "Scheduled", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    SENDING:  { label: "Sending…",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    SENT:     { label: "Sent",      cls: "bg-[#2E7D52]/10 text-[#2E7D52] border-[#2E7D52]/20" },
    CANCELLED:{ label: "Cancelled", cls: "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]" },
  }
  const s = map[status] ?? { label: status, cls: "bg-[#f5f5f5] text-[#8C8C8C] border-[#e5e5e5]" }
  return (
    <span className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

function sendToLabel(sendTo: string) {
  const map: Record<string, string> = {
    all: "Everyone",
    subscribers: "Subscribers",
    customers: "Customers",
  }
  return map[sendTo] ?? sendTo
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("Cancel this scheduled campaign?")) return
    startTransition(async () => {
      await deleteScheduledCampaignAction(id)
      window.location.reload()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-[10px] tracking-[0.12em] uppercase text-red-600 hover:text-red-800 transition-colors disabled:opacity-40"
    >
      {isPending ? "Cancelling…" : "Cancel"}
    </button>
  )
}

export default function ScheduledList({ campaigns }: { campaigns: ScheduledCampaign[] }) {
  return (
    <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5] rounded overflow-hidden">
      {campaigns.map((c) => (
        <div key={c.id} className="flex items-start justify-between gap-4 px-5 py-4 bg-white hover:bg-[#fafafa] transition-colors">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {statusBadge(c.status)}
              <span className="text-[10px] text-[#8C8C8C] tracking-wide">
                {sendToLabel(c.sendTo)}
                {c.sentCount != null && ` · ${c.sentCount} sent`}
              </span>
            </div>
            <p className="text-sm font-medium text-[#111111] truncate">{c.subject}</p>
            <p className="text-xs text-[#8C8C8C] truncate">{c.headline}</p>
          </div>

          <div className="shrink-0 text-right space-y-1.5">
            <p className="text-[11px] text-[#4A4A4A]">
              {new Date(c.scheduledAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-[#8C8C8C]">
              {new Date(c.scheduledAt).toLocaleTimeString("en-NG", {
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
            {c.status === "PENDING" && <DeleteButton id={c.id} />}
          </div>
        </div>
      ))}
    </div>
  )
}
