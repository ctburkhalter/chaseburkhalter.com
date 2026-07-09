import { IMPACT_STATS } from "@/lib/content"

export function ImpactBand() {
  return (
    <section className="w-full border-y border-border/70 bg-muted/35 py-8" aria-label="Career impact metrics">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {IMPACT_STATS.map(({ value, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="font-mono text-2xl font-bold text-foreground md:text-3xl">{value}</span>
              <span className="text-xs font-medium text-foreground/90">{label}</span>
              <span className="text-xs text-muted-foreground">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
