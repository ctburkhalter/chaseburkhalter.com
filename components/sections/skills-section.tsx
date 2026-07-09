import { ACCENTS } from "@/lib/accent"
import { ALSO_WORKED_WITH, SKILL_CATEGORIES } from "@/lib/content"

export function SkillsSection() {
  return (
    <section id="skills" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <p className="section-kicker">Toolchain</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Technical Skills</h2>
          <p className="max-w-2xl text-muted-foreground">
            Deepest in dbt and Snowflake, with full-stack coverage from event instrumentation to
            self-service BI and AI-ready data access. Within each group, tools are ordered by depth.
          </p>
        </div>
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 md:grid-cols-2">
          {SKILL_CATEGORIES.map(({ label, accent, tools }) => {
            const accentClasses = ACCENTS[accent]
            return (
              <div key={label} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${accentClasses.dot}`} aria-hidden="true" />
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${accentClasses.heading}`}>
                    {label}
                  </h3>
                </div>
                <div className="engine-panel flex flex-wrap gap-2 rounded-lg p-4">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-3 py-1.5 rounded-md border border-border/70 bg-muted/40 font-medium text-foreground/85 transition-colors hover:border-primary/40"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mx-auto max-w-5xl mt-10 pt-8 border-t border-border/70">
          <p className="text-xs text-muted-foreground text-center mb-3">Also worked with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ALSO_WORKED_WITH.map((tool) => (
              <span key={tool} className="rounded border border-border/70 bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
