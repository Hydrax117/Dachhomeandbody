"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createStaffAction, type CreateStaffState } from "../actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 bg-[#111111] text-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating…" : "Create Staff Account"}
    </button>
  )
}

interface StaffFormProps {
  onSuccess?: () => void
}

export default function StaffForm({ onSuccess }: StaffFormProps) {
  const [state, formAction] = useActionState(createStaffAction, {})

  if (state.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.errors?._form && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded text-sm">
          {state.errors._form[0]}
        </div>
      )}

      {state.success && (
        <div role="status" className="border border-green-300 bg-green-50 text-green-800 px-4 py-3 rounded text-sm">
          Staff account created successfully. Share the login credentials securely.
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="staff-name" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="staff-name"
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. Amaka Okonkwo"
          className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
        />
        {state.errors?.name && (
          <p className="mt-1 text-xs text-red-600" role="alert">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="staff-email" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="staff-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="staff@dachhomeandbody.com"
          className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
        />
        {state.errors?.email && (
          <p className="mt-1 text-xs text-red-600" role="alert">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="staff-phone" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
          Phone (optional)
        </label>
        <input
          id="staff-phone"
          name="phone"
          type="tel"
          autoComplete="off"
          placeholder="08012345678"
          className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="staff-password" className="block text-[10px] tracking-[0.18em] uppercase text-[#8C8C8C] mb-1.5">
          Temporary Password <span className="text-red-500">*</span>
        </label>
        <input
          id="staff-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          className="w-full px-3 py-2.5 border border-[#e5e5e5] text-sm text-[#111111] bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#B8965C] focus:border-[#B8965C] placeholder-[#aaa]"
        />
        {state.errors?.password && (
          <p className="mt-1 text-xs text-red-600" role="alert">{state.errors.password[0]}</p>
        )}
        <p className="mt-1 text-[10px] text-[#aaa]">
          The staff member can change this after first login.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
