import { FlagshipCard } from "@/components/flagship-card"
import { ProjectCard } from "@/components/project-card"
import { FLAGSHIPS, PROJECTS } from "@/lib/content"

export function WorkSection() {
  return (
    <section id="projects" className="w-full border-y border-border/70 bg-muted/20 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-8 md:mb-12">
          <p className="section-kicker">Featured Work</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Work That Moved Real Numbers</h2>
          <p className="max-w-2xl text-muted-foreground">
            Four flagship engagements in depth, plus a shelf of supporting builds. Every figure here
            comes from production systems I owned.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {FLAGSHIPS.map((flagship) => (
            <FlagshipCard key={flagship.title} flagship={flagship} />
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  )
}
