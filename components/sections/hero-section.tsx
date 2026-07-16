import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Download, MapPin, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResumeDownloadLink } from "@/components/resume-download-link"
import { TrackedLink } from "@/components/tracked-link"
import { IDENTITY, STACK_PILLS } from "@/lib/content"

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full overflow-hidden pt-10 pb-12 md:pt-16 md:pb-16">
      <div className="pointer-events-none absolute right-[-12rem] top-12 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[-10rem] top-56 h-80 w-80 rounded-full bg-emerald-500/14 blur-3xl" aria-hidden="true" />
      <div className="container relative px-4 md:px-6 space-y-6 md:space-y-8">

        {/* Identity strip */}
        <div className="engine-panel flex flex-wrap items-center gap-x-6 gap-y-4 rounded-lg p-4">
          <div className="flex min-w-0 items-center gap-4">
            {/* Arch frame: a semicircular top over straight sides and a flat base
                (rounded-t-full leaves the bottom corners square). The source photo is
                portrait with the head near the top edge, so object-top anchors the
                crop there; a centered crop cut into the top of the head. */}
            <Image
              src="/headshot.jpg"
              alt="Chase Burkhalter"
              width={88}
              height={101}
              className="h-[74px] w-16 shrink-0 rounded-t-full object-cover object-top ring-2 ring-primary/45 shadow-[0_0_34px_rgb(34_197_94/0.24)] sm:h-[101px] sm:w-[88px]"
              priority
            />
            <div className="min-w-0">
              <p className="section-kicker">{IDENTITY.title}</p>
              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {IDENTITY.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:ml-auto sm:border-l sm:border-border/60 sm:pl-6">
            <p className="font-mono text-xs text-muted-foreground">
              stack_status: operational
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none shrink-0 shadow-[0_0_16px_rgb(34_197_94/0.9)]" />
              <span className="text-sm text-muted-foreground">{IDENTITY.availability}</span>
            </div>
          </div>
        </div>

        {/* Bio, CTAs, socials, pills */}
        <div className="max-w-3xl flex flex-col gap-4 md:gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 font-mono text-xs text-violet-300">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            building governed, AI-ready data platforms
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
            {IDENTITY.bio}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-[0_0_28px_rgb(34_197_94/0.24)] hover:bg-primary/90">
              <Link href="#projects">
                View Work <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-violet-400/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15">
              <ResumeDownloadLink source="hero" className="gap-2 flex items-center">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Resume
              </ResumeDownloadLink>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <TrackedLink
              href={IDENTITY.linkedin}
              linkType="linkedin"
              location="hero"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <LinkedInIcon />
              LinkedIn
            </TrackedLink>
            <TrackedLink
              href={IDENTITY.github}
              linkType="github"
              location="hero"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <GitHubIcon />
              GitHub
            </TrackedLink>
          </div>

          <div className="flex flex-wrap gap-2">
            {STACK_PILLS.map((tool) => (
              <span
                key={tool}
                className="rounded border border-border/70 bg-muted/50 px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {tool}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{IDENTITY.location}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
