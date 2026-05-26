"use client"

import { useState, useEffect, useCallback } from "react"
import { z } from "zod"
import type { SavedAddress } from "./CheckoutClient"

// ── Validation schema ──────────────────────────────────────────────────────

const AddressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
})

const GuestEmailSchema = z.string().email("Please enter a valid email address")

export type ShippingAddress = z.infer<typeof AddressSchema>
type FieldErrors = Partial<Record<keyof ShippingAddress | "email", string>>

// ── Props ──────────────────────────────────────────────────────────────────

interface ShippingAddressFormProps {
  isAuthenticated: boolean
  userEmail: string | null
  userName: string | null
  savedAddresses: SavedAddress[]
  initialEmail: string
  onSubmit: (address: ShippingAddress, email: string, shippingCost: number) => void
}

// ── Saved address selector ─────────────────────────────────────────────────

function SavedAddressSelector({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: SavedAddress[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#111111]/50 mb-3">
        Saved Addresses
      </p>
      <div className="space-y-2">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr.id === selectedId ? null : addr.id)}
            className={[
              "w-full text-left px-4 py-3.5 border rounded-sm text-sm transition-all duration-200",
              addr.id === selectedId
                ? "border-[#B8965C] bg-[#B8965C]/5"
                : "border-[#EBEBEB] hover:border-[#B8965C]/50",
            ].join(" ")}
            aria-pressed={addr.id === selectedId}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[#111111]">{addr.name}</p>
                <p className="text-[#8C8C8C] text-xs mt-0.5">
                  {addr.address}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                </p>
                <p className="text-[#8C8C8C] text-xs">{addr.phone}</p>
              </div>
              {addr.isDefault && (
                <span className="badge badge-gold shrink-0 text-[9px]">Default</span>
              )}
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={[
            "w-full text-left px-4 py-3 border rounded-sm text-xs tracking-[0.12em] uppercase transition-all duration-200",
            selectedId === null
              ? "border-[#111111] text-[#111111]"
              : "border-[#EBEBEB] text-[#8C8C8C] hover:border-[#111111]/30",
          ].join(" ")}
        >
          + Use a new address
        </button>
      </div>
    </div>
  )
}

// ── Field component ────────────────────────────────────────────────────────

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Nigerian state/city selects (lazy-loaded) ──────────────────────────────

import { nigerianStates, getCitiesForState } from "@/lib/nigeria-states"

function NigeriaSelects({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
}: {
  selectedState: string
  selectedCity: string
  onStateChange: (s: string) => void
  onCityChange: (c: string) => void
  stateError?: string
  cityError?: string
}) {
  const cities = selectedState ? getCitiesForState(selectedState) : []

  return (
    <>
      <Field id="state" label="State" error={stateError}>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => {
            onStateChange(e.target.value)
            onCityChange("") // reset city on state change
          }}
          className={`input${stateError ? " input--error" : ""}`}
          aria-describedby={stateError ? "state-error" : undefined}
          required
        >
          <option value="">Select state…</option>
          {nigerianStates.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="city" label="City" error={cityError}>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className={`input${cityError ? " input--error" : ""}`}
          disabled={!selectedState}
          aria-describedby={cityError ? "city-error" : undefined}
          required
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
      </Field>
    </>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────

export function ShippingAddressForm({
  isAuthenticated,
  userEmail,
  userName,
  savedAddresses,
  initialEmail,
  onSubmit,
}: ShippingAddressFormProps) {
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(
    defaultAddress?.id ?? null
  )

  const [email, setEmail] = useState(initialEmail || userEmail || "")
  const [errors, setErrors] = useState<FieldErrors>({})

  // Shipping fee state
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [feeLoading, setFeeLoading] = useState(false)

  // Form field state — pre-fill from default address if available
  const [fields, setFields] = useState<ShippingAddress>(() => {
    if (defaultAddress) {
      return {
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state ?? "",
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      }
    }
    return {
      name: userName ?? "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
    }
  })

  // Fetch shipping fee whenever state changes
  const fetchShippingFee = useCallback(async (state: string) => {
    if (!state) {
      setShippingFee(null)
      return
    }
    setFeeLoading(true)
    try {
      const res = await fetch(`/api/shipping-fee?state=${encodeURIComponent(state)}`)
      if (res.ok) {
        const data = (await res.json()) as { fee: number | null }
        setShippingFee(data.fee)
      }
    } catch {
      // silently ignore — fee will show as TBD
    } finally {
      setFeeLoading(false)
    }
  }, [])

  // Fetch fee on mount if a state is already selected
  useEffect(() => {
    if (fields.state) {
      fetchShippingFee(fields.state)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSavedSelect(id: string | null) {
    setSelectedSavedId(id)
    if (id) {
      const addr = savedAddresses.find((a) => a.id === id)
      if (addr) {
        const newFields = {
          name: addr.name,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          state: addr.state ?? "",
          postalCode: addr.postalCode,
          country: addr.country,
        }
        setFields(newFields)
        setErrors({})
        fetchShippingFee(newFields.state)
      }
    } else {
      setFields({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nigeria",
      })
      setShippingFee(null)
    }
  }

  function setField(key: keyof ShippingAddress, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function handleStateChange(state: string) {
    setField("state", state)
    setField("city", "")
    fetchShippingFee(state)
  }

  function validateField(key: keyof ShippingAddress | "email") {
    if (key === "email") {
      if (!isAuthenticated) {
        const result = GuestEmailSchema.safeParse(email)
        if (!result.success) {
          setErrors((prev) => ({
            ...prev,
            email: result.error.issues[0]?.message ?? "Invalid email",
          }))
        }
      }
      return
    }
    const singleField = AddressSchema.pick({ [key]: true } as Record<typeof key, true>)
    const result = singleField.safeParse({ [key]: fields[key] })
    if (!result.success) {
      const msg = result.error.issues[0]?.message
      if (msg) setErrors((prev) => ({ ...prev, [key]: msg }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: FieldErrors = {}

    if (!isAuthenticated) {
      const emailResult = GuestEmailSchema.safeParse(email)
      if (!emailResult.success) {
        newErrors.email = emailResult.error.issues[0]?.message ?? "Invalid email"
      }
    }

    const addressResult = AddressSchema.safeParse(fields)
    if (!addressResult.success) {
      const fieldErrors = addressResult.error.flatten().fieldErrors as Partial<
        Record<keyof ShippingAddress, string[]>
      >
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        const msgArr = msgs as string[] | undefined
        if (msgArr?.[0]) newErrors[key as keyof ShippingAddress] = msgArr[0]
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const cost = shippingFee ?? 0
    onSubmit(fields, isAuthenticated ? (userEmail ?? email) : email, cost)
  }

  const inputCls = (field: keyof ShippingAddress | "email") =>
    `input${errors[field] ? " input--error" : ""}`

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Shipping address">
      <h2 className="font-serif text-2xl font-light text-[#111111] mb-6">
        Shipping Address
      </h2>

      {/* Guest email */}
      {!isAuthenticated && (
        <div className="mb-6 pb-6 border-b border-[#EBEBEB]">
          <p className="text-xs text-[#8C8C8C] mb-4">
            Checking out as a guest.{" "}
            <a href="/auth/login?callbackUrl=/checkout" className="text-[#B8965C] hover:underline">
              Sign in
            </a>{" "}
            to save your details.
          </p>
          <Field id="email" label="Email Address" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
              }}
              onBlur={() => validateField("email")}
              placeholder="you@example.com"
              className={inputCls("email")}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
            />
          </Field>
        </div>
      )}

      {/* Saved addresses for authenticated users */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <SavedAddressSelector
          addresses={savedAddresses}
          selectedId={selectedSavedId}
          onSelect={handleSavedSelect}
        />
      )}

      {/* Address fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="name" label="Full Name" error={errors.name}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => validateField("name")}
              placeholder="Jane Doe"
              className={inputCls("name")}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </Field>
          <Field id="phone" label="Phone Number" error={errors.phone}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => setField("phone", e.target.value)}
              onBlur={() => validateField("phone")}
              placeholder="+234 800 000 0000"
              className={inputCls("phone")}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </Field>
        </div>

        <Field id="address" label="Street Address" error={errors.address}>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            value={fields.address}
            onChange={(e) => setField("address", e.target.value)}
            onBlur={() => validateField("address")}
            placeholder="123 Victoria Island"
            className={inputCls("address")}
            aria-describedby={errors.address ? "address-error" : undefined}
          />
        </Field>

        {/* State + City dropdowns (Nigerian states from states.json) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NigeriaSelects
            selectedState={fields.state ?? ""}
            selectedCity={fields.city}
            onStateChange={handleStateChange}
            onCityChange={(city) => setField("city", city)}
            stateError={errors.state}
            cityError={errors.city}
          />
        </div>

        {/* Shipping fee preview */}
        {fields.state && (
          <div className="px-4 py-3 bg-[#F8F5F2] border border-[#EBEBEB] rounded-sm text-sm flex items-center justify-between">
            <span className="text-[#8C8C8C]">Shipping to {fields.state}</span>
            <span className="font-medium text-[#111111]">
              {feeLoading
                ? "Calculating…"
                : shippingFee === null
                ? "Contact us for rate"
                : shippingFee === 0
                ? "Free"
                : `₦${shippingFee.toLocaleString()}`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="postalCode" label="Postal Code" error={errors.postalCode}>
            <input
              id="postalCode"
              type="text"
              autoComplete="postal-code"
              value={fields.postalCode}
              onChange={(e) => setField("postalCode", e.target.value)}
              onBlur={() => validateField("postalCode")}
              placeholder="100001"
              className={inputCls("postalCode")}
              aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
            />
          </Field>
          <Field id="country" label="Country" error={errors.country}>
            <select
              id="country"
              autoComplete="country-name"
              value={fields.country}
              onChange={(e) => setField("country", e.target.value)}
              className="input"
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Other">Other</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="mt-8">
        <button type="submit" className="btn-primary w-full">
          Continue to Payment
        </button>
      </div>
    </form>
  )
}
