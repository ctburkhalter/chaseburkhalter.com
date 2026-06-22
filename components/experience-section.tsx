const experience = [
  {
    company: "Future Research, Inc.",
    url: "https://future.co/",
    role: "Senior Analytics Engineer",
    period: "Feb 2026 – May 2026",
    type: "Contract",
    color: "orange",
    bullets: [
      "Re-architected dbt incremental modeling across the core Snowflake pipeline, cutting compute spend by ~80% while query volume continued to grow",
      "Established an AI-first analytics layer by persisting governed model documentation into Snowflake, building 3 custom MCP servers (Hightouch, Snowflake, Linear via FastMCP), and generating a LookML-to-Hex semantic context layer",
      "Launched a natural-language data access integration — connected Claude directly to the production Snowflake environment with scoped, least-privilege access so non-technical stakeholders could query governed data without SQL",
      "Owned source-to-mart integrations across product analytics, support (Intercom), Iterable lifecycle, and Google Search Console — ingestion, identity resolution, and downstream modeling end-to-end",
      "Led incident response on a 13-day Fivetran Aurora PostgreSQL replication failure — sequenced and recovered 2.4B rows across 3 connectors, managed WAL slot risk, and coordinated directly with Fivetran Engineering to prevent data loss",
      "Automated recurring manual data workflows with Python, replacing spreadsheet-dependent processes with scheduled API-driven pipelines",
    ],
    tags: ["dbt", "Snowflake", "Fivetran", "Python", "LookML", "Hex", "MCP"],
  },
  {
    company: "The Atlanta Journal-Constitution",
    url: "https://www.ajc.com/",
    role: "Senior Data & Analytics Engineer",
    period: "Aug 2024 – Jun 2025",
    type: "Promoted · Feb 2025",
    color: "emerald",
    bullets: [
      "Led the end-to-end implementation of Amplitude analytics across 7 digital properties, independently owning JavaScript instrumentation, QA, and governance for the full rollout",
      "Migrated event tracking and reporting from Redshift to Snowflake, improving query performance and establishing a scalable foundation for downstream analytics",
      "Rebuilt the GTM/GA4 tracking infrastructure after a team restructuring, assuming sole ownership of tagging, debugging, and data QA across web properties",
      "Partnered with product and platform teams on cross-platform engagement analytics across AppsFlyer attribution, Airship push messaging, and Iterable lifecycle campaigns",
      "Built scalable Power BI and Tableau dashboards for election and campaign performance reporting, enabling faster editorial and executive decision-making",
      "Laid the groundwork for enterprise dbt adoption and data governance through documentation, anchor taxonomy, and data-lineage mapping",
    ],
    tags: ["Amplitude", "Snowflake", "dbt", "GA4", "GTM", "Tableau", "Power BI"],
  },
  {
    company: "Shortcut",
    url: "https://www.shortcut.com/",
    role: "Senior Data Analyst",
    period: "Oct 2022 – May 2024",
    type: "Remote · SaaS",
    color: "violet",
    bullets: [
      "Served as the sole analyst supporting 6 cross-functional departments (sales, finance, marketing, product, engineering, and customer support), owning the full analytics workflow",
      "Drove $100K+ in annual savings by orchestrating the migration from proprietary visualization tools to Apache Superset with no loss of reporting coverage",
      "Administered the full modern data stack (Segment, Amplitude, Superset, Google Analytics, Snowflake, dbt, Fivetran, Hightouch, and Pendo) as the single owner of analytics tooling",
      "Built reporting models in SQL and dbt from first- and third-party sources, driving insights for finance, sales, marketing, customer support, and product teams",
      "Designed Superset and Amplitude dashboards to monitor revenue, retention, behavioral funnels, and marketing attribution",
      "Standardized event-tracking processes across teams, enabling self-serve analysis of customer behavior for non-technical stakeholders",
    ],
    tags: ["Segment", "Amplitude", "dbt", "Snowflake", "Superset", "Fivetran"],
  },
  {
    company: "SteadyApp / SteadyIQ",
    url: "https://steadyiq.com/",
    role: "Product & Data Analyst",
    period: "Mar 2020 – Sep 2022",
    type: "Fintech",
    color: "amber",
    bullets: [
      "Saved $1.4M annually by rebuilding Plaid account-token linkage — analyzed ~3 billion transactions to reduce data-aggregator spend while preserving data continuity for downstream product analytics",
      "Managed the core analytics stack (Segment, Amplitude, Tableau, Braze, and Extole) to drive data-informed decisions across product, growth, and executive teams",
      "Built and maintained source-of-truth models in Snowflake via dbt, ensuring scalable, reliable reporting for executive stakeholders",
      "Implemented data governance plans and tracking strategies for feature launches, UX optimizations, and A/B testing initiatives",
      "Created Amplitude and Tableau dashboards to evaluate product adoption, marketing effectiveness, and user engagement",
    ],
    tags: ["Snowflake", "dbt", "Segment", "Amplitude", "Tableau", "Braze"],
  },
]

const colorDot: Record<string, string> = {
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
}

const colorBadge: Record<string, string> = {
  orange: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
}

export function ExperienceSection() {
  return (
    <section id="experience" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <p className="section-kicker">Work History</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Experience</h2>
          <p className="max-w-2xl text-muted-foreground">
            6+ years building modern data stacks across fintech, B2B SaaS, digital media, and health tech.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-6 border-l border-border/70 pl-8">
            {experience.map(({ company, url, role, period, type, color, bullets, tags }) => (
              <div key={company} className="relative">
                <span className={`absolute -left-[21px] top-5 h-3 w-3 rounded-full border-2 border-background shadow-[0_0_18px_currentColor] ${colorDot[color]}`} />
                <div className="engine-panel rounded-lg p-5 space-y-3">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-semibold">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {company}
                        </a>
                      </h3>
                      <span className="rounded border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{type}</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{role}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{period}</p>
                  </div>

                  <ul className="space-y-1.5">
                    {bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded border px-2.5 py-0.5 font-mono text-[11px] font-medium ${colorBadge[color]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pl-8 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Education:</span>{" "}
            B.S. Biology / Biochemistry — University of South Alabama, 2017
          </div>
        </div>
      </div>
    </section>
  )
}
