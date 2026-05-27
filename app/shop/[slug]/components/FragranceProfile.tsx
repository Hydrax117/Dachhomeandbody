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

// Note type descriptions for editorial context
const noteTypeDescriptions: Record<string, string> = {
  "Top Notes": "The first impression — what you smell in the opening moments.",
  "Heart Notes": "The soul of the fragrance — what lingers after the opening fades.",
  "Base Notes": "The foundation — deep, lasting, and unforgettable.",
}

function NoteGroup({ label, notes }: { label: string; notes: string[] }) {
  if (!notes.length) return null
  return (
    <div className="py-6 border-b border-white/5 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
        <div className="sm:w-36 shrink-0">
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-1">{label}</p>
          <p className="text-white/25 text-[10px] leading-relaxed hidden sm:block">
            {noteTypeDescriptions[label]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notes.map((note) => (
            <span
              key={note}
              className="px-3 py-1.5 text-[11px] tracking-[0.1em] bg-white/5 text-white/70 border border-white/10 hover:border-[#B8965C]/40 hover:text-white/90 transition-colors duration-300"
            >
              {note}
            </span>
          ))}
        </div>
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
    <div className="flex items-center gap-6">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/40 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-white/10 relative" role="presentation">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-px bg-[#B8965C] transition-all duration-700"
          style={{ width: `${value}%` }}
          aria-label={`${label}: ${displayLabel}`}
        />
        {/* Dot indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B8965C] border-2 border-[#111111] transition-all duration-700"
          style={{ left: `calc(${value}% - 4px)` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-[11px] text-white/50 w-20 text-right shrink-0">{displayLabel}</span>
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-6 h-px bg-[#B8965C]/50" aria-hidden="true" />
        <p className="text-[#B8965C] text-[10px] tracking-[0.4em] uppercase">Fragrance Profile</p>
      </div>

      <h2 className="font-serif text-white font-light text-2xl lg:text-3xl mb-10 leading-snug">
        The anatomy of<br />
        <em className="not-italic text-[#B8965C]">this scent</em>.
      </h2>

      {/* Notes */}
      {hasNotes && (
        <div className="mb-10">
          <NoteGroup label="Top Notes" notes={topNotes} />
          <NoteGroup label="Heart Notes" notes={heartNotes} />
          <NoteGroup label="Base Notes" notes={baseNotes} />
        </div>
      )}

      {/* Longevity & Strength */}
      {(longevity || strength) && (
        <div className="space-y-6 mb-10 pt-8 border-t border-white/5">
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-6">Performance</p>
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
        <div className="pt-8 border-t border-white/5">
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-5">Mood &amp; Occasion</p>
          <div className="flex flex-wrap gap-2">
            {moodTags.map((tag) => (
              <span
                key={tag}
                className="ingredient-pill text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
