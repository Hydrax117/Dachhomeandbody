/**
 * Utility for reading Nigerian states/cities from public/states.json.
 * This file is safe to import on both server and client — it only reads
 * the static JSON bundled at build time.
 */

import statesData from "@/public/states.json"

export interface NigerianState {
  code: string
  name: string
  capital: string
  lgas: string[]
  cities: string[]
}

/** All Nigerian states sorted alphabetically by name. */
export const nigerianStates: NigerianState[] = (
  statesData as NigerianState[]
).sort((a, b) => a.name.localeCompare(b.name))

/** Map of state name → cities array for quick lookup. */
export const citiesByState: Record<string, string[]> = Object.fromEntries(
  nigerianStates.map((s) => [s.name, [...s.cities].sort()])
)

/** Get sorted cities for a given state name. Returns [] if not found. */
export function getCitiesForState(stateName: string): string[] {
  return citiesByState[stateName] ?? []
}

/** Get all state names as a sorted string array. */
export function getStateNames(): string[] {
  return nigerianStates.map((s) => s.name)
}
