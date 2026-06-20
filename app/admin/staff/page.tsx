import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStaffMembers } from "@/lib/staff"
import NewStaffPanel from "./components/NewStaffPanel"
import StaffActions from "./components/StaffActions"

export const metadata = {
  title: "Staff Management",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export default async function StaffPage() {
  // Admin-only guard
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin")
  }

  const staff = await getStaffMembers()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
            Staff
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewStaffPanel />
      </div>

      {/* Permissions summary */}
      <div className="bg-[#F8F5F2] border border-[#e5e5e5] rounded-lg p-5">
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] font-medium mb-3">
          Staff Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-green-700 font-medium mb-1.5">Can access</p>
            <ul className="space-y-1 text-[#444]">
              {["View & update orders", "View & update gift orders", "View pay requests", "Record in-store sales", "View inventory / stock levels", "View customers (read-only)"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-red-600 font-medium mb-1.5">Cannot access</p>
            <ul className="space-y-1 text-[#444]">
              {["Create / edit / delete products", "Manage categories", "Create / edit coupons", "Update shipping rates", "Moderate reviews", "Manage popups & chat", "Add or manage other staff"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Staff list */}
      {staff.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-12 text-center">
          <p className="text-sm text-[#8C8C8C]">No staff members yet.</p>
          <p className="text-xs text-[#aaa] mt-1">
            Add a staff member to give them limited dashboard access.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#F8F5F2]">
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                  Staff Member
                </th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden sm:table-cell">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden md:table-cell">
                  Activity
                </th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium hidden lg:table-cell">
                  Added
                </th>
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-[#F8F5F2] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111111]">
                      {member.name ?? "—"}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">{member.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-[#8C8C8C]">
                      {member.phone ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-3 text-xs text-[#8C8C8C]">
                      <span>{member._count.inStoreSales} sales</span>
                      <span>{member._count.orders} orders</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-[#8C8C8C]">
                      {formatDate(member.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StaffActions
                      staffId={member.id}
                      staffName={member.name}
                      isActive={member.role === "STAFF"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
