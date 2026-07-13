import { TrackedLink } from "@/components/tracked-link"
import { ACCENTS } from "@/lib/accent"
import { EDUCATION, EXPERIENCE } from "@/lib/content"

export function ExperienceSection() {
  return (
    <section id="experience" className="w-full border-y border-border/70 bg-muted/20 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-8 md:mb-12">
          <p className="section-kicker">Work History</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Experience</h2>
          <p className="max-w-2xl text-muted-foreground">
            Six-plus years building modern data platforms across fintech, B2B SaaS, digital media, and health tech.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-6 border-l border-border/70 pl-8">
            {EXPERIENCE.map(({ company, url, role, period, type, accent, scope, bullets, tags }) => {
              const accentClasses = ACCENTS[accent]
              return (
                <div key={company} className="relative">
                  <span
                    className={`absolute -left-[21px] top-5 h-3 w-3 rounded-full border-2 border-background shadow-[0_0_18px_currentColor] ${accentClasses.dot}`}
                    aria-hidden="true"
                  />
                  <div className="engine-panel rounded-lg p-5 space-y-3">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="text-lg font-semibold">
                          <TrackedLink
                            href={url}
                            linkType="company"
                            location="experience"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {company}
                          </TrackedLink>
                        </h3>
                        <span className="rounded border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{type}</span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{period}</p>
                      <p className="mt-2 text-xs italic text-muted-foreground">{scope}</p>
                    </div>

                    <ul className="space-y-1.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded border px-2.5 py-0.5 font-mono text-xs font-medium ${accentClasses.badge}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 pl-8 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Education:</span> {EDUCATION}
          </div>
        </div>
      </div>
    </section>
  )
}
