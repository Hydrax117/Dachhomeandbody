import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PasswordForm from "@/app/account/profile/components/PasswordForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Profile",
}

export default async function AdminProfilePage() {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/auth/login")
  }

  const isOAuthOnly = !session.user.email // edge case guard

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          My Profile
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          {session.user.name ?? session.user.email}
          <span className="ml-2 text-[9px] tracking-[0.15em] uppercase text-[#B8965C] bg-[#B8965C]/10 px-1.5 py-0.5 rounded">
            {session.user.role === "STAFF" ? "Staff" : "Admin"}
          </span>
        </p>
      </div>

      {/* Account info — read only */}
      <div className="bg-[#F8F5F2] border border-[#e5e5e5] rounded p-5 space-y-3">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C]">Account</p>
        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <span className="text-[#8C8C8C]">Name</span>
          <span className="text-[#111111] font-medium">{session.user.name ?? "—"}</span>
          <span className="text-[#8C8C8C]">Email</span>
          <span className="text-[#111111]">{session.user.email}</span>
          <span className="text-[#8C8C8C]">Role</span>
          <span className="text-[#111111] capitalize">{session.user.role?.toLowerCase()}</span>
        </div>
      </div>

      {/* Password change */}
      <div className="border border-[#e5e5e5] rounded p-5 space-y-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-1">
            Change Password
          </p>
          <p className="text-xs text-[#8C8C8C]">
            Minimum 8 characters with at least one letter and one number.
          </p>
        </div>

        {isOAuthOnly ? (
          <p className="text-sm text-[#8C8C8C] bg-[#F8F5F2] border border-[#e5e5e5] rounded px-4 py-3">
            Your account uses social login — password change is not available.
          </p>
        ) : (
          <PasswordForm />
        )}
      </div>
    </div>
  )
}
