import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Download, Mail, Phone, MapPin, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectCard } from "@/components/project-card"
import { ExperienceSection } from "@/components/experience-section"
import { MobileNavigation } from "@/components/mobile-navigation"
import { AnalyticsShowcase } from "@/components/analytics-showcase"
import { ResumeDownloadLink } from "@/components/resume-download-link"

export default function Home() {
  const stackTools = [
    "dbt", "Snowflake", "Amplitude", "Segment", "Fivetran", "Looker", "Python", "GA4",
  ]

  const skillCategories = [
    {
      label: "Data Engineering",
      color: "emerald",
      tools: ["Snowflake", "dbt", "SQL", "Fivetran", "Hightouch", "Airflow", "MetricFlow", "Redshift", "BigQuery", "Postgres", "Docker", "AWS", "MongoDB"],
    },
    {
      label: "AI & LLM Tools",
      color: "rose",
      tools: ["FastMCP", "Claude AI", "Claude Code", "ChatGPT / Codex", "Hex AI", "MCP Server Development", "Prompt Engineering", "AI-Ready Data Design", "LookML → Semantic Context"],
    },
    {
      label: "Instrumentation & Analytics",
      color: "amber",
      tools: ["Amplitude", "Segment", "GA4", "Google Tag Manager", "Iterable", "AppsFlyer", "Airship", "Avo", "DataHub", "OpenMetadata", "Pendo"],
    },
    {
      label: "BI & Visualization",
      color: "violet",
      tools: ["Looker / LookML", "Hex", "Tableau", "Power BI", "Apache Superset", "Hashboard", "Mixpanel", "Chartbeat"],
    },
    {
      label: "Engineering & Methodologies",
      color: "sky",
      tools: ["Python", "TypeScript / JS", "Jinja", "React / Next.js", "Jupyter", "CI/CD", "Git", "Incremental dbt Modeling", "Data Lineage & Governance"],
    },
  ]

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/10",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/10",
    violet: "border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/10",
    sky: "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400 hover:border-sky-500/60 hover:bg-sky-500/10",
  }

  const categoryHeaderColor: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    violet: "text-violet-600 dark:text-violet-400",
    sky: "text-sky-600 dark:text-sky-400",
  }

  const categoryDotColor: Record<string, string> = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    sky: "bg-sky-500",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Chase Burkhalter Home">
            <span className="text-primary font-bold">CB</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">Chase Burkhalter</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {[
              { href: "#experience", label: "Experience" },
              { href: "#projects", label: "Projects" },
              { href: "#skills", label: "Skills" },
              { href: "#contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="hidden md:inline-flex gap-2">
              <ResumeDownloadLink source="nav">
                <Download className="h-3.5 w-3.5" />
                Resume
              </ResumeDownloadLink>
            </Button>
            <MobileNavigation />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">

        {/* Hero */}
        <section id="hero" className="w-full pt-6 pb-16 md:pt-8 md:pb-24 lg:pb-32 bg-background">
          <div className="container px-4 md:px-6 space-y-5">

            {/* Row 1: Identity strip — headshot · name · title/status */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-4 shrink-0">
                <Image
                  src="/headshot.jpg"
                  alt="Chase Burkhalter"
                  width={88}
                  height={88}
                  className="rounded-full object-cover ring-2 ring-border shrink-0"
                  priority
                />
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl whitespace-nowrap">
                  Chase Burkhalter
                </h1>
              </div>
              <div className="sm:ml-auto sm:pl-6 sm:border-l sm:border-border/40 flex flex-col gap-1">
                <p className="text-base font-medium text-muted-foreground">
                  Senior Analytics Engineer · Data &amp; Analytics Engineering
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-sm text-muted-foreground">Open to senior data engineering &amp; analytics engineering roles</span>
                </div>
              </div>
            </div>

            {/* Row 2: Bio + impact cards */}
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-start">

              {/* Left: bio, CTAs, social, pills, location */}
              <div className="flex flex-col gap-5">
                <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                  I own the full analytics stack — dbt Snowflake pipelines, Segment and Amplitude instrumentation, BI delivery, and AI-era tooling like custom MCP servers and governed semantic layers. I&apos;ve built and run these systems as the sole analytics engineer at multiple companies across fintech, SaaS, and health tech.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="#projects">
                      View Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <ResumeDownloadLink source="hero" className="gap-2 flex items-center">
                      <Download className="h-4 w-4" />
                      Download Resume
                    </ResumeDownloadLink>
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href="https://www.linkedin.com/in/chaseburkhalter/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Link>
                  <Link
                    href="https://github.com/ctburkhalter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </Link>
                </div>

                {/* Stack pills */}
                <div className="flex flex-wrap gap-2">
                  {stackTools.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground bg-muted/50"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Dothan, AL — open to remote</span>
                </div>
              </div>

              {/* Right: impact stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "$1.4M", label: "Annual infrastructure savings", sub: "SteadyApp aggregator rebuild" },
                  { value: "80%", label: "Snowflake credit reduction", sub: "While query volume grew 58%" },
                  { value: "2.4B", label: "Rows recovered, zero data loss", sub: "13-day Fivetran incident response" },
                  { value: "7", label: "Digital properties instrumented", sub: "End-to-end Amplitude at AJC" },
                ].map(({ value, label, sub }) => (
                  <Card key={value} className="border-border/60">
                    <CardContent className="p-5">
                      <p className="text-3xl font-bold text-primary">{value}</p>
                      <p className="text-sm font-medium mt-1">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Impact metrics strip */}
        <section className="w-full border-y bg-muted/40 py-8">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { value: "Sole AE × 3", label: "Full-stack analytics ownership" },
                { value: "6+ yrs", label: "Modern data stack" },
                { value: "$100K+", label: "BI tool migration savings" },
                { value: "3", label: "MCP servers built" },
                { value: "2.4B rows", label: "Recovered in production incident" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-2xl font-bold">{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <ExperienceSection />

        {/* Projects */}
        <section id="projects" className="w-full py-16 md:py-24 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Projects</h2>
              <p className="max-w-2xl text-muted-foreground">
                Senior-level data and analytics engineering work with measurable impact across cost, governance, instrumentation, and decision velocity.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ProjectCard
                metric="$12,312/yr"
                title="Snowflake FinOps & dbt Performance Program"
                description="Snowflake credits were growing without per-model attribution — no visibility into which dbt models drove cost. Built a Hex FinOps notebook on query attribution data to surface the 11 costliest models, converted 6 to incremental and archived 5 — cutting credits 80% while query volume grew 58%."
                tags={["dbt", "Snowflake", "FinOps", "Performance"]}
              />
              <ProjectCard
                metric="7 Properties"
                title="Amplitude Implementation"
                description="AJC had no unified behavioral analytics layer — 7 digital properties tracked independently with no shared taxonomy or governance. Owned end-to-end Amplitude rollout including JavaScript instrumentation, object-action taxonomy spec, QA testing playbook, and governance documentation that remained in use after the engagement."
                tags={["Amplitude", "JavaScript", "Data Governance", "Event Taxonomy"]}
              />
              <ProjectCard
                metric="18 Models"
                title="AI-Ready Semantic Layer"
                description="AI tools querying the warehouse had no governed business context — just raw column names and no definitions. Enabled dbt persist_docs globally and migrated 18 mart models to per-model YAML so Snowflake object comments carry business definitions. Hex AI, Claude, and BI tools now read context directly from the warehouse — no separate documentation layer needed."
                tags={["dbt", "Snowflake", "LookML", "Hex", "MCP"]}
              />
              <ProjectCard
                metric="$100K+/yr"
                title="BI Tool Migration to Superset"
                description="Orchestrated the full migration from proprietary visualization tools to Apache Superset at Shortcut, eliminating $100K+ in annual spend while expanding self-service analytics for all teams."
                tags={["Apache Superset", "Cost Optimization", "Snowflake", "dbt"]}
              />
              <ProjectCard
                metric="Promoted Feb 2025"
                title="Data Warehouse Migration"
                description="AJC's analytics ran on a Redshift deployment that couldn't support column-level lineage, incremental modeling, or self-service access. Migrated event tracking and reporting to Snowflake with a governed dbt foundation, enabling the capabilities Redshift couldn't provide and establishing the platform for future analytics scaling."
                tags={["Snowflake", "Redshift", "dbt", "ETL/ELT"]}
              />
              <ProjectCard
                metric="$1.4M/yr"
                title="Plaid Token Linkage & Fraud Cost Reduction"
                description="Analyzed ~3B transactions and fraud indicators to rebuild account-token linkage around Plaid, reducing data-aggregator costs and fraud exposure while preserving continuity for downstream product analytics."
                tags={["Plaid", "Fraud Analytics", "Cost Optimization", "Data Infrastructure"]}
              />
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Technical Skills</h2>
              <p className="max-w-2xl text-muted-foreground">
                Deep expertise in dbt and Snowflake; full-stack coverage from event instrumentation to self-service BI.
              </p>
            </div>
            <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 md:grid-cols-2">
              {skillCategories.map(({ label, color, tools }) => (
                <div key={label} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${categoryDotColor[color]}`} />
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${categoryHeaderColor[color]}`}>
                      {label}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <span
                        key={tool}
                        className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${colorMap[color]}`}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-auto max-w-5xl mt-10 pt-8 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">Also worked with</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Iterable", "Braze", "Stripe", "Salesforce", "HubSpot", "LaunchDarkly", "Optimizely", "FullStory", "Qualtrics", "Chameleon", "Plaid", "Zendesk", "Clojure", "Figma"].map((tool) => (
                  <span key={tool} className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Analytics showcase */}
        <AnalyticsShowcase />

        {/* Contact */}
        <section id="contact" className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-lg flex flex-col items-center text-center gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Open to data engineering and analytics engineering roles at product-led tech companies, contract work, and collaboration. Remote.
                </p>
              </div>

              <div className="w-full space-y-3">
                <a
                  href="mailto:chase@chaseburkhalter.com"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors group"
                >
                  <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">chase@chaseburkhalter.com</p>
                  </div>
                </a>
                <a
                  href="tel:334-333-4308"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors group"
                >
                  <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">334-333-4308</p>
                  </div>
                </a>
                <Link
                  href="https://www.linkedin.com/in/chaseburkhalter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">LinkedIn</p>
                    <p className="text-sm font-medium">linkedin.com/in/chaseburkhalter</p>
                  </div>
                </Link>
              </div>

              <div className="flex gap-3 w-full">
                <Button asChild className="flex-1">
                  <a href="mailto:chase@chaseburkhalter.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <ResumeDownloadLink source="contact">
                    <Download className="mr-2 h-4 w-4" />
                    Resume
                  </ResumeDownloadLink>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 Chase Burkhalter</p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js · TypeScript · Tailwind CSS · Segment · Amplitude
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/in/chaseburkhalter/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="https://github.com/ctburkhalter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="mailto:chase@chaseburkhalter.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Email
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
