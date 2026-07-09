import { Badge } from "@/components/ui/badge"
import { ACCENTS } from "@/lib/accent"
import { AI_ENTRIES, AI_SECTION } from "@/lib/content"

export function AiSection() {
  const violet = ACCENTS.violet

  return (
    <section id="ai-engineering" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.22em] ${violet.heading}`}>
            {AI_SECTION.kicker}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{AI_SECTION.heading}</h2>
          <p className="max-w-2xl text-muted-foreground">{AI_SECTION.lead}</p>
        </div>

        <div className="mx-auto max-w-4xl space-y-4">
          {AI_ENTRIES.map(({ title, description, tags }) => (
            <div key={title} className="engine-panel rounded-lg p-5 transition-colors hover:border-violet-400/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0 sm:max-w-[200px] sm:justify-end">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className={`border font-mono text-xs ${violet.badge}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
