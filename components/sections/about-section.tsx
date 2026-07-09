import { ABOUT } from "@/lib/content"

export function AboutSection() {
  return (
    <section id="about" className="w-full border-y border-border/70 bg-muted/20 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl flex flex-col items-center text-center gap-4">
          <p className="section-kicker">{ABOUT.kicker}</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{ABOUT.heading}</h2>
          <p className="text-muted-foreground leading-relaxed text-left sm:text-center">
            {ABOUT.body}
          </p>
        </div>
      </div>
    </section>
  )
}
