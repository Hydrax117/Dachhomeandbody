import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./components/AdminSidebar"

export const metadata = {
  title: {
    default: "Admin — Dachhomeandbody",
    template: "%s | Admin — Dachhomeandbody",
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check (middleware handles redirect, this is a safety net)
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/auth/login?callbackUrl=/admin")
  }

  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EF]">
      <AdminSidebar role={session.user.role} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[#F8F5F2] border-b border-[#e5e5e5] flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <span className="text-[9px] tracking-[0.15em] uppercase text-[#B8965C] bg-[#B8965C]/10 px-1.5 py-0.5 rounded">
                Staff
              </span>
            )}
            <span className="text-xs text-[#8C8C8C]">
              {session.user.name ?? session.user.email}
            </span>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "Admin"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/30 flex items-center justify-center">
                <span className="text-[10px] font-medium text-[#B8965C] uppercase">
                  {(session.user.name ?? session.user.email ?? "A").charAt(0)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
