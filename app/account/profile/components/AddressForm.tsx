"use client"

import { useActionState, useState, useEffect } from "react"
import { addAddress, updateAddress, type AddressFormState } from "@/app/actions/profile"
import { Input, Label, FieldError } from "@/app/components/ui/Input"
import { nigerianStates, getCitiesForState } from "@/lib/nigeria-states"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string | null
  postalCode: string
  country: string
}

interface AddressFormProps {
  address?: Address
  onSuccess?: () => void
}

const initialState: AddressFormState = {}

export default function AddressForm({ address, onSuccess }: AddressFormProps) {
  const action = address
    ? updateAddress.bind(null, address.id)
    : addAddress

  const [state, formAction, pending] = useActionState(
    async (prev: AddressFormState, formData: FormData) => {
      const result = await action(prev, formData)
      if (result.success) onSuccess?.()
      return result
    },
    initialState
  )

  // Controlled state/city for cascading dropdowns
  const [selectedState, setSelectedState] = useState(address?.state ?? "")
  const [selectedCity, setSelectedCity] = useState(address?.city ?? "")
  const [cities, setCities] = useState<string[]>(() =>
    address?.state ? getCitiesForState(address.state) : []
  )

  useEffect(() => {
    setCities(selectedState ? getCitiesForState(selectedState) : [])
  }, [selectedState])

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedState(e.target.value)
    setSelectedCity("") // reset city when state changes
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.errors?._form && (
        <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded px-4 py-3">
          {state.errors._form[0]}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="addr-name">Full Name</Label>
          <Input
            id="addr-name"
            name="name"
            type="text"
            defaultValue={address?.name ?? ""}
            autoComplete="name"
            error={!!state.errors?.name}
            aria-describedby={state.errors?.name ? "addr-name-error" : undefined}
          />
          <FieldError id="addr-name-error" message={state.errors?.name?.[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr-phone">Phone</Label>
          <Input
            id="addr-phone"
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
            autoComplete="tel"
            error={!!state.errors?.phone}
            aria-describedby={state.errors?.phone ? "addr-phone-error" : undefined}
          />
          <FieldError id="addr-phone-error" message={state.errors?.phone?.[0]} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addr-address">Street Address</Label>
        <Input
          id="addr-address"
          name="address"
          type="text"
          defaultValue={address?.address ?? ""}
          autoComplete="street-address"
          error={!!state.errors?.address}
          aria-describedby={state.errors?.address ? "addr-address-error" : undefined}
        />
        <FieldError id="addr-address-error" message={state.errors?.address?.[0]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State dropdown */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-state">State</Label>
          <select
            id="addr-state"
            name="state"
            value={selectedState}
            onChange={handleStateChange}
            className={`input${state.errors?.state ? " input--error" : ""}`}
            aria-describedby={state.errors?.state ? "addr-state-error" : undefined}
          >
            <option value="">Select state…</option>
            {nigerianStates.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError id="addr-state-error" message={state.errors?.state?.[0]} />
        </div>

        {/* City dropdown — cascades from state */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-city">City</Label>
          <select
            id="addr-city"
            name="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState}
            className={`input${state.errors?.city ? " input--error" : ""}`}
            aria-describedby={state.errors?.city ? "addr-city-error" : undefined}
          >
            <option value="">
              {selectedState ? "Select city…" : "Select state first"}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FieldError id="addr-city-error" message={state.errors?.city?.[0]} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addr-postal">Postal Code</Label>
        <Input
          id="addr-postal"
          name="postalCode"
          type="text"
          defaultValue={address?.postalCode ?? ""}
          autoComplete="postal-code"
          error={!!state.errors?.postalCode}
          aria-describedby={state.errors?.postalCode ? "addr-postal-error" : undefined}
        />
        <FieldError id="addr-postal-error" message={state.errors?.postalCode?.[0]} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addr-country">Country</Label>
        <Input
          id="addr-country"
          name="country"
          type="text"
          defaultValue={address?.country ?? "Nigeria"}
          autoComplete="country-name"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary text-xs disabled:opacity-60"
        >
          {pending ? "Saving…" : address ? "Update Address" : "Add Address"}
        </button>
      </div>
    </form>
  )
}
