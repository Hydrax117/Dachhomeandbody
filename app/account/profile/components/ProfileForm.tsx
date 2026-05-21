"use client"

import { useActionState } from "react"
import { updateProfile, type ProfileFormState } from "@/app/actions/profile"
import { Input, Label, FieldError } from "@/app/components/ui/Input"

interface ProfileFormProps {
  name: string | null
  email: string
  phone: string | null
}

const initialState: ProfileFormState = {}

export default function ProfileForm({ name, email, phone }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, initialState)

  return (
    <form action={action} className="space-y-5">
      {state.success && (
        <p className="text-sm text-[#27ae60] bg-green-50 border border-green-200 rounded px-4 py-3">
          Profile updated successfully.
        </p>
      )}
      {state.errors?._form && (
        <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded px-4 py-3">
          {state.errors._form[0]}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={name ?? ""}
            autoComplete="name"
            error={!!state.errors?.name}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={state.errors?.name?.[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="email"
            error={!!state.errors?.email}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={state.errors?.email?.[0]} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone Number <span className="text-[#8C8C8C]">(optional)</span></Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          autoComplete="tel"
          placeholder="+234 800 000 0000"
          error={!!state.errors?.phone}
          aria-describedby={state.errors?.phone ? "phone-error" : undefined}
        />
        <FieldError id="phone-error" message={state.errors?.phone?.[0]} />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary text-xs disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
