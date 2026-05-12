"use client"

import { useFormStatus } from "react-dom"
import { logout } from "@/app/actions/auth"

function LogoutButtonInner({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50"
      }
    >
      {pending ? "Signing out..." : (children ?? "Sign Out")}
    </button>
  )
}

export default function LogoutButton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <form action={logout}>
      <LogoutButtonInner className={className}>{children}</LogoutButtonInner>
    </form>
  )
}
