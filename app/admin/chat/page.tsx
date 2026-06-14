import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = { title: "Chat Analytics" }

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  // Auth guard
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/auth/login")
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const search = params.search ?? ""
  const pageSize = 25

  const where = search
    ? {
        OR: [
          { userMessage: { contains: search, mode: "insensitive" as const } },
          { botReply: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [logs, total, stats] = await Promise.all([
    prisma.chatLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.chatLog.count({ where }),
    prisma.chatLog.aggregate({
      _count: { id: true },
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  // Top questions: group by first 60 chars of userMessage
  const topQuestions = await prisma.$queryRaw<{ msg: string; cnt: bigint }[]>`
    SELECT LEFT("userMessage", 60) as msg, COUNT(*) as cnt
    FROM "ChatLog"
    GROUP BY LEFT("userMessage", 60)
    ORDER BY cnt DESC
    LIMIT 8
  `

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Chat Analytics
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {total} conversation{total !== 1 ? "s" : ""} logged
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Chats", value: total },
          { label: "Last 7 Days", value: stats._count.id },
          { label: "Page", value: `${page} / ${totalPages || 1}` },
          { label: "Per Page", value: pageSize },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#e5e5e5] rounded p-4"
          >
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C]">
              {s.label}
            </p>
            <p className="font-serif text-2xl text-[#111111] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top questions */}
      {topQuestions.length > 0 && (
        <div className="bg-white border border-[#e5e5e5] rounded p-5">
          <h2 className="text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-4">
            Most Asked Questions
          </h2>
          <div className="space-y-2">
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[11px] text-[#C4C4C4] w-5 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111111] truncate">{q.msg}</p>
                </div>
                <span className="text-[11px] text-[#B8965C] font-medium shrink-0">
                  {Number(q.cnt)}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search conversations…"
          className="flex-1 px-4 py-2 border border-[#e5e5e5] rounded text-sm text-[#111111] placeholder:text-[#8C8C8C] outline-none focus:border-[#B8965C]"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#111111] text-white text-xs tracking-widest uppercase rounded hover:bg-[#B8965C] transition-colors"
        >
          Search
        </button>
        {search && (
          <a
            href="/admin/chat"
            className="px-4 py-2 border border-[#e5e5e5] text-xs text-[#8C8C8C] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors flex items-center"
          >
            Clear
          </a>
        )}
      </form>

      {/* Logs table */}
      {logs.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">
            {search ? "No conversations match your search." : "No chat conversations yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                  {["Time", "User Message", "Bot Reply", "Session"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F5F2] transition-colors">
                    <td className="px-4 py-3 text-[11px] text-[#8C8C8C] whitespace-nowrap">
                      {timeAgo(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-[13px] text-[#111111] line-clamp-2">
                        {log.userMessage}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <p className="text-[12px] text-[#8C8C8C] line-clamp-2">
                        {log.botReply}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-[#C4C4C4]">
                        {log.sessionId.slice(0, 8)}…
                      </span>
                      {log.userId && (
                        <span className="ml-1 text-[9px] tracking-wider uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          auth
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-[#e5e5e5] px-4 py-3 flex items-center justify-between bg-[#F8F5F2]">
              <p className="text-xs text-[#8C8C8C]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/chat?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    ← Prev
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/chat?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className="text-xs px-3 py-1.5 border border-[#e5e5e5] rounded hover:border-[#B8965C] hover:text-[#B8965C] transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
