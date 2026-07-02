/**
 * /account/profile — Customer profile management
 *
 * Allows customers to update personal info, change password,
 * and manage shipping addresses.
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import ProfileForm from "./components/ProfileForm"
import PasswordForm from "./components/PasswordForm"
import AddressList from "./components/AddressList"
import { withDbFallback } from "@/lib/db-resilience"
import ServiceUnavailable from "@/app/components/ui/ServiceUnavailable"

export const metadata: Metadata = {
  title: "Profile",
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#e5e5e5] rounded p-6 space-y-5">
      <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#111111] pb-4 border-b border-[#f0ece4]">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/profile")
  }

  const { data: user, unavailable } = await withDbFallback(
    () => prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        password: true,
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        },
      },
    }),
    null
  )

  if (unavailable) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <ServiceUnavailable message="We're having trouble loading your profile right now. Please try again in a moment." />
      </div>
    )
  }

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Profile
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Manage your personal details and saved addresses
        </p>
      </div>

      {/* Personal info */}
      <Section title="Personal Information">
        <ProfileForm
          name={user.name}
          email={user.email}
          phone={user.phone}
        />
      </Section>

      {/* Password — only shown for credential-based accounts */}
      {user.password && (
        <Section title="Change Password">
          <PasswordForm />
        </Section>
      )}

      {/* Addresses */}
      <Section title="Saved Addresses">
        <AddressList addresses={user.addresses} />
      </Section>
    </div>
  )
}
