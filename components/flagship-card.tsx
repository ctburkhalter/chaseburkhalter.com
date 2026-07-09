import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ACCENTS } from "@/lib/accent"
import type { Flagship } from "@/lib/content"

const PHASE_LABELS = ["problem", "approach", "outcome"] as const

export function FlagshipCard({ flagship }: { flagship: Flagship }) {
  const { metric, title, problem, approach, outcome, tags, arch, accent } = flagship
  const accentClasses = ACCENTS[accent]
  const phases = [problem, approach, outcome]

  return (
    <Card className="engine-panel relative flex flex-col overflow-hidden rounded-lg transition-colors hover:border-primary/40">
      <CardContent className="flex-1 p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={`font-mono text-2xl font-bold md:text-3xl ${accentClasses.heading}`}>{metric}</p>
        </div>
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>

        <dl className="space-y-3">
          {phases.map((text, i) => (
            <div key={PHASE_LABELS[i]}>
              <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {PHASE_LABELS[i]}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>

        {arch && (
          <div className="flex flex-wrap items-center gap-1 pt-1" aria-label={`Approach flow: ${arch.join(", then ")}`}>
            {arch.map((node, i) => (
              <span key={node} className="flex items-center gap-1">
                <span className="rounded border border-border/70 bg-muted/30 px-2 py-1 font-mono text-xs text-muted-foreground">
                  {node}
                </span>
                {i < arch.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className={`border font-mono text-xs ${accentClasses.badge}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
