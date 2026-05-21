import type { Longevity, Strength } from "@prisma/client"

interface FragranceProfileProps {
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity?: Longevity | null
  strength?: Strength | null
  moodTags?: string[]
}

const longevityLabel: Record<string, string> = {
  SHORT: "1–3 Hours",
  MODERATE: "3–6 Hours",
  LONG: "6–12 Hours",
  VERY_LONG: "12+ Hours",
}

const longevityPercent: Record<string, number> = {
  SHORT: 25,
  MODERATE: 50,
  LONG: 75,
  VERY_LONG: 100,
}

const strengthLabel: Record<string, string> = {
  LIGHT: "Light",
  MODERATE: "Moderate",
  STRONG: "Strong",
  VERY_STRONG: "Very Strong",
}

const strengthPercent: Record<string, number> = {
  LIGHT: 25,
  MODERATE: 50,
  STRONG: 75,
  VERY_STRONG: 100,
}

function NoteGroup({
  label,
  notes,
}: {
  label: string
  notes: string[]
}) {
  if (!notes.length) return null
  return (
    <div className="flex gap-6 items-start">
      <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {notes.map((note) => (
          <span
            key={note}
            className="px-2.5 py-1 text-[11px] tracking-wide bg-[#f0ece4] text-[#4A4A4A] border border-[#EBEBEB]"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  )
}

function ScaleBar({
  label,
  value,
  displayLabel,
}: {
  label: string
  value: number
  displayLabel: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C]">{label}</span>
        <span className="text-[11px] text-[#4A4A4A]">{displayLabel}</span>
      </div>
      <div className="h-0.5 bg-[#EBEBEB] w-full" role="presentation">
        <div
          className="h-full bg-[#B8965C] transition-all duration-700"
          style={{ width: `${value}%` }}
          aria-label={`${label}: ${displayLabel}`}
        />
      </div>
    </div>
  )
}

export function FragranceProfile({
  topNotes,
  heartNotes,
  baseNotes,
  longevity,
  strength,
  moodTags,
}: FragranceProfileProps) {
  const hasNotes = topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0
  const hasProfile = hasNotes || longevity || strength

  if (!hasProfile) return null

  return (
    <section aria-label="Fragrance profile">
      <div className="divider-gold mb-5" aria-hidden="true" />
      <h2 className="font-serif text-lg font-medium mb-6">Fragrance Profile</h2>

      {/* Notes — grouped by type (Req 2.8) */}
      {hasNotes && (
        <div className="space-y-4 mb-8">
          <NoteGroup label="Top Notes" notes={topNotes} />
          <NoteGroup label="Heart Notes" notes={heartNotes} />
          <NoteGroup label="Base Notes" notes={baseNotes} />
        </div>
      )}

      {/* Longevity & Strength scales */}
      {(longevity || strength) && (
        <div className="space-y-4 mb-6">
          {longevity && (
            <ScaleBar
              label="Longevity"
              value={longevityPercent[longevity] ?? 50}
              displayLabel={longevityLabel[longevity] ?? longevity}
            />
          )}
          {strength && (
            <ScaleBar
              label="Strength"
              value={strengthPercent[strength] ?? 50}
              displayLabel={strengthLabel[strength] ?? strength}
            />
          )}
        </div>
      )}

      {/* Mood tags */}
      {moodTags && moodTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {moodTags.map((tag) => (
            <span
              key={tag}
              className="badge badge-cream text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
