"use client"

import { useActionState } from "react"
import { changePassword, type PasswordFormState } from "@/app/actions/profile"
import { Input, Label, FieldError } from "@/app/components/ui/Input"

const initialState: PasswordFormState = {}

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialState)

  return (
    <form action={action} className="space-y-5">
      {state.success && (
        <p className="text-sm text-[#27ae60] bg-green-50 border border-green-200 rounded px-4 py-3">
          Password changed successfully.
        </p>
      )}
      {state.errors?._form && (
        <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded px-4 py-3">
          {state.errors._form[0]}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          error={!!state.errors?.currentPassword}
          aria-describedby={state.errors?.currentPassword ? "current-pw-error" : undefined}
        />
        <FieldError id="current-pw-error" message={state.errors?.currentPassword?.[0]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            error={!!state.errors?.newPassword}
            aria-describedby={state.errors?.newPassword ? "new-pw-error" : undefined}
          />
          <FieldError id="new-pw-error" message={state.errors?.newPassword?.[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={!!state.errors?.confirmPassword}
            aria-describedby={state.errors?.confirmPassword ? "confirm-pw-error" : undefined}
          />
          <FieldError id="confirm-pw-error" message={state.errors?.confirmPassword?.[0]} />
        </div>
      </div>

      <p className="text-xs text-[#8C8C8C]">
        Minimum 8 characters with at least one letter and one number.
      </p>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary text-xs disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  )
}
