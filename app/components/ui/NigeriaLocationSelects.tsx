"use client"

/**
 * Reusable state + city dropdown pair for Nigerian addresses.
 * When the state changes, the city list updates automatically.
 * Optionally calls onStateChange so the parent can fetch the shipping fee.
 */

import { useState, useEffect } from "react"
import { nigerianStates, getCitiesForState } from "@/lib/nigeria-states"

interface NigeriaLocationSelectsProps {
  /** Currently selected state name */
  selectedState: string
  /** Currently selected city */
  selectedCity: string
  /** Called when the state selection changes */
  onStateChange: (state: string) => void
  /** Called when the city selection changes */
  onCityChange: (city: string) => void
  /** Optional CSS class applied to each <select> */
  selectClassName?: string
  /** Show validation error styling on state field */
  stateError?: boolean
  /** Show validation error styling on city field */
  cityError?: boolean
  /** aria-describedby for state error */
  stateErrorId?: string
  /** aria-describedby for city error */
  cityErrorId?: string
  /** Whether the fields are disabled */
  disabled?: boolean
}

export function NigeriaLocationSelects({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  selectClassName = "input",
  stateError,
  cityError,
  stateErrorId,
  cityErrorId,
  disabled,
}: NigeriaLocationSelectsProps) {
  const [cities, setCities] = useState<string[]>(() =>
    selectedState ? getCitiesForState(selectedState) : []
  )

  // Update city list whenever state changes
  useEffect(() => {
    const newCities = selectedState ? getCitiesForState(selectedState) : []
    setCities(newCities)
  }, [selectedState])

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newState = e.target.value
    onStateChange(newState)
    // Reset city when state changes
    onCityChange("")
  }

  const stateCls = `${selectClassName}${stateError ? " input--error" : ""}`
  const cityCls = `${selectClassName}${cityError ? " input--error" : ""}`

  return (
    <>
      {/* State */}
      <div>
        <label htmlFor="field-state" className="label">
          State
        </label>
        <select
          id="field-state"
          value={selectedState}
          onChange={handleStateChange}
          className={stateCls}
          disabled={disabled}
          aria-describedby={stateError && stateErrorId ? stateErrorId : undefined}
          required
        >
          <option value="">Select state…</option>
          {nigerianStates.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        {stateError && stateErrorId && (
          <p id={stateErrorId} className="field-error" role="alert">
            Please select a state
          </p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="field-city" className="label">
          City
        </label>
        <select
          id="field-city"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className={cityCls}
          disabled={disabled || !selectedState}
          aria-describedby={cityError && cityErrorId ? cityErrorId : undefined}
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
        {cityError && cityErrorId && (
          <p id={cityErrorId} className="field-error" role="alert">
            Please select a city
          </p>
        )}
      </div>
    </>
  )
}
