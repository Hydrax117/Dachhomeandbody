import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AccountSidebar from "./components/AccountSidebar"

export const metadata = {
  title: {
    default: "My Account — Dachhomeandbody",
    template: "%s | My Account — Dachhomeandbody",
  },
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EF]">
      <AccountSidebar userName={session.user.name} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — desktop only (mobile top bar is in AccountSidebar) */}
        <header className="hidden lg:flex h-16 bg-[#F8F5F2] border-b border-[#e5e5e5] items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8C8C8C]">
              {session.user.name ?? session.user.email}
            </span>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "Account"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#B8965C]/20 border border-[#B8965C]/30 flex items-center justify-center">
                <span className="text-[10px] font-medium text-[#B8965C] uppercase">
                  {(session.user.name ?? session.user.email ?? "U").charAt(0)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content — add top padding on mobile to clear the fixed top bar */}
        <main className="flex-1 overflow-y-auto p-6 pt-20 lg:pt-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
