// Single source of truth for accent styling. Three hues by design:
// green for data platform work, violet for AI, orange for ops and incidents.
export type Accent = "green" | "violet" | "orange"

interface AccentClasses {
  dot: string
  heading: string
  badge: string
  chip: string
}

export const ACCENTS: Record<Accent, AccentClasses> = {
  green: {
    dot: "bg-emerald-500",
    heading: "text-emerald-300",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300/60 hover:bg-emerald-400/15",
  },
  violet: {
    dot: "bg-violet-500",
    heading: "text-violet-300",
    badge: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-200 hover:border-violet-300/60 hover:bg-violet-400/15",
  },
  orange: {
    dot: "bg-orange-500",
    heading: "text-orange-300",
    badge: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    chip: "border-orange-400/30 bg-orange-400/10 text-orange-200 hover:border-orange-300/60 hover:bg-orange-400/15",
  },
}
