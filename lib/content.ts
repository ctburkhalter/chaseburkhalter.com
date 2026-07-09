// All site copy and structured content. Components render from this module;
// editing the site means editing data here, not JSX. Every metric traces to
// the resume or the engagement work summary it came from.

import type { Accent } from "@/lib/accent"

// ============================================================================
// IDENTITY & NAVIGATION
// ============================================================================

export const IDENTITY = {
  name: "Chase Burkhalter",
  title: "Senior Data & Analytics Engineer",
  positioning:
    "Building governed, AI-ready data platforms: ingestion, dbt modeling on Snowflake, product instrumentation, semantic context, and secure AI access to trusted data.",
  bio: "I build and run modern data platforms end to end: Fivetran ingestion, dbt modeling on Snowflake, product instrumentation, and BI delivery. My recent work makes that stack AI-ready with governed documentation, custom MCP servers, and least-privilege natural language access to trusted data. Six-plus years across fintech, SaaS, digital media, and health tech, usually as the sole data hire.",
  availability: "Open to senior data & analytics engineering roles",
  location: "Dothan, AL, open to remote",
  email: "chase@chaseburkhalter.com",
  linkedin: "https://www.linkedin.com/in/chaseburkhalter/",
  github: "https://github.com/ctburkhalter",
  siteRepo: "https://github.com/ctburkhalter/chaseburkhalter.com",
} as const

export const NAV_ITEMS = [
  { href: "#projects", label: "Work" },
  { href: "#ai-engineering", label: "AI" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
] as const

// Section registry: drives IntersectionObserver tracking and stable analytics
// display names. Ids are stable across redesigns so section_viewed history
// stays comparable; labels are what analytics reports, independent of the
// heading text rendered on the page.
export const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "projects", label: "Projects" },
  { id: "ai-engineering", label: "AI Engineering" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "demos", label: "Demos" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const

export const SECTION_IDS: string[] = SECTIONS.map((s) => s.id)

export function getSectionLabel(id: string): string {
  const match = SECTIONS.find((s) => s.id === id)
  if (match) return match.label
  return id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

// ============================================================================
// HERO
// ============================================================================

export const STACK_PILLS = [
  "dbt", "Snowflake", "Fivetran", "SQL", "Python", "Looker", "Amplitude", "Hightouch", "MCP",
] as const

// ============================================================================
// IMPACT BAND
// Sublabels carry the scope so every number survives an interview follow-up.
// ============================================================================

export interface ImpactStat {
  value: string
  label: string
  sub: string
}

export const IMPACT_STATS: ImpactStat[] = [
  { value: "$1.4M/yr", label: "Infrastructure savings", sub: "Plaid aggregator rebuild at SteadyApp" },
  { value: "80%", label: "Credit cut, 11 costliest dbt models", sub: "Snowflake FinOps program at Future" },
  { value: "2.4B", label: "Rows recovered, verified parity", sub: "13-day Fivetran incident response" },
  { value: "$100K+/yr", label: "BI licensing eliminated", sub: "Superset migration at Shortcut" },
  { value: "7", label: "Properties, one Amplitude taxonomy", sub: "Solo rollout at the AJC" },
  { value: "3", label: "MCP servers in production use", sub: "Snowflake, Hightouch, Linear" },
]

// ============================================================================
// FLAGSHIP WORK (structured case-study cards)
// ============================================================================

export interface Flagship {
  metric: string
  title: string
  problem: string
  approach: string
  outcome: string
  tags: string[]
  arch?: string[]
  accent: Accent
  githubUrl?: string
  liveUrl?: string
}

export const FLAGSHIPS: Flagship[] = [
  {
    metric: "$12,312/yr",
    title: "Snowflake FinOps & dbt Performance Program",
    problem: "Snowflake spend was climbing with no visibility into which dbt models drove the cost.",
    approach:
      "Built a Hex FinOps notebook on query attribution history to rank every model by credit burn, converted the six costliest to incremental builds with a hardened cutoff pattern, and archived five dead models after lineage checks against Looker and query history.",
    outcome:
      "Credits on those 11 models fell 80%, from $15,228 to $2,916 a year. Schema-level spend held roughly 25% below baseline while query volume grew 58%, and average build time dropped 3.5x.",
    tags: ["dbt", "Snowflake", "FinOps", "Hex"],
    arch: ["Attribute cost per model", "Convert or archive", "Verify savings"],
    accent: "green",
  },
  {
    metric: "13 days",
    title: "2.4 Billion-Row Replication Incident Recovery",
    problem:
      "A replication slot failure forced full historical resyncs on three Fivetran Aurora PostgreSQL connectors at once, roughly 2.4 billion rows, while production reporting degraded.",
    approach:
      "Ran point with Fivetran for 13 days: raised the WAL retention ceiling to 400GB to protect resync progress, caught syncs restarting from scratch and row-count gaps between the vendor UI and Snowflake, and sequenced the connectors to cut contention.",
    outcome:
      "Full recovery with verified source-to-destination row parity, and core reporting models restored. Later recovered a $1,000 billing credit in a usage dispute tied to the reset.",
    tags: ["Fivetran", "Aurora PostgreSQL", "Snowflake", "Incident Response"],
    arch: ["Contain WAL risk", "Sequence resyncs", "Verify row parity"],
    accent: "orange",
  },
  {
    metric: "539 measures",
    title: "AI-Ready Context Platform",
    problem: "AI tools querying the warehouse inferred business logic from column names and got metrics wrong.",
    approach:
      "Enabled dbt persist_docs so every model and column description lands in Snowflake as object comments, migrated 18 mart models to governed per-model YAML, parsed 58 LookML views into 90 AI context guides covering 539 measures, and generated 53 MetricFlow semantic models from the same source of truth.",
    outcome:
      "Hex AI, Claude, and BI tools now read governed business definitions directly from the warehouse instead of guessing.",
    tags: ["dbt", "LookML", "MetricFlow", "Snowflake", "Hex AI"],
    arch: ["Governed definitions", "Persist to warehouse", "AI + BI consume"],
    accent: "violet",
  },
  {
    metric: "7 properties",
    title: "Amplitude Rollout Across the AJC",
    problem:
      "Seven digital properties tracked behavior independently, with no shared taxonomy, governance, or cross-property reporting.",
    approach:
      "Owned the rollout solo: JavaScript instrumentation, an object-action event taxonomy, a QA playbook, and governance documentation, coordinating with product and platform teams throughout.",
    outcome:
      "The company's first unified behavioral analytics layer. The taxonomy and governance standards stayed in use after the engagement ended.",
    tags: ["Amplitude", "JavaScript", "Event Taxonomy", "Governance"],
    arch: ["Instrument", "Standardize taxonomy", "Govern & QA"],
    accent: "green",
  },
]

// ============================================================================
// SUPPORTING PROJECTS (compact cards)
// ============================================================================

export interface Project {
  metric: string
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  liveUrl?: string
}

export const PROJECTS: Project[] = [
  {
    metric: "First-party",
    title: "This Site: Ad-Block-Proof Analytics Pipeline",
    description:
      "Amplitude Browser SDK routed through a same-origin proxy so events survive the ad blockers that hide 25 to 40% of visitors, with device, referrer, and UTM enrichment. Designed, built, and documented end to end with Claude Code. The live demo below runs this exact pipeline.",
    tags: ["Next.js 15", "TypeScript", "Amplitude", "Claude Code"],
    githubUrl: "https://github.com/ctburkhalter/chaseburkhalter.com",
  },
  {
    metric: "Live site",
    title: "timdjohnson.com Author Platform",
    description:
      "Production website for historian Timothy D. Johnson, Ph.D. Google Calendar events with hourly ISR, CSP security headers, self-hosted fonts, and a master-detail bibliography. Built with Claude Code from design through deployment.",
    tags: ["Next.js", "Google Calendar API", "CSP", "Claude Code"],
    liveUrl: "https://timdjohnson.com",
  },
  {
    metric: "$100K+/yr",
    title: "BI Migration to Apache Superset",
    description:
      "Evaluated, planned, and executed Shortcut's migration off proprietary visualization tooling with no loss of reporting coverage, then expanded self-service dashboards across six departments.",
    tags: ["Apache Superset", "Snowflake", "dbt", "Cost Optimization"],
  },
  {
    metric: "$1.4M/yr",
    title: "Plaid Token Linkage Rebuild",
    description:
      "Analyzed roughly 3 billion transactions and their fraud indicators to redesign SteadyApp's data-aggregator linkage, cutting processing cost and fraud exposure while preserving continuity for downstream product analytics.",
    tags: ["Plaid", "Fraud Analytics", "Data Infrastructure"],
  },
  {
    metric: "Zero-gap cutover",
    title: "Redshift to Snowflake Migration",
    description:
      "Moved the AJC's event tracking and reporting off a Redshift deployment that could not support incremental modeling or self-service access, establishing the governed Snowflake and dbt foundation the analytics team scaled on.",
    tags: ["Snowflake", "Redshift", "dbt", "ELT"],
  },
]

// ============================================================================
// AI-READY DATA SYSTEMS
// ============================================================================

export const AI_SECTION = {
  kicker: "AI-Ready Data Systems",
  heading: "Data platforms that AI can trust",
  lead: "AI answers are only as good as the data platform underneath them. I build that platform: documented, governed, least privilege, and machine readable.",
} as const

export interface AiEntry {
  title: string
  description: string
  tags: string[]
}

export const AI_ENTRIES: AiEntry[] = [
  {
    title: "Custom MCP Servers",
    description:
      "Three FastMCP servers in production use: Snowflake with RSA key auth and automatic query limits, Hightouch for sync operations, and Linear for ticket workflows. Built to run real engineering work from Claude Code sessions, not as demos.",
    tags: ["FastMCP", "Python", "MCP"],
  },
  {
    title: "Governed Natural-Language Access",
    description:
      "Designed the role model that connects Claude to production Snowflake for 13 teammates: read-only grants scoped to the mart schema, future grants so new models inherit access, and raw PII schemas excluded entirely.",
    tags: ["Snowflake", "Claude", "Access Control"],
  },
  {
    title: "Context Engineering Pipeline",
    description:
      "Parsed 58 LookML views into 539 governed measure definitions across 90 AI context guides for Hex AI, then generated 53 MetricFlow semantic models from the same source of truth so AI and BI share one set of definitions.",
    tags: ["LookML", "MetricFlow", "Hex AI"],
  },
  {
    title: "AI-Readable Warehouse",
    description:
      "Enabled dbt persist_docs so every model and column description persists into Snowflake as object comments. Any tool that can read the warehouse, from Hex AI to Claude to a BI catalog, gets business meaning without a separate documentation layer.",
    tags: ["dbt", "Snowflake", "Documentation"],
  },
  {
    title: "AI-Assisted Engineering Practice",
    description:
      "This site and timdjohnson.com were designed, built, instrumented, and documented with Claude Code. At Future, Playwright automation audited Hex AI answer quality across 60-plus flagged conversations to improve the context that feeds it.",
    tags: ["Claude Code", "Playwright", "Next.js"],
  },
]

// ============================================================================
// EXPERIENCE
// ============================================================================

export interface Role {
  company: string
  url: string
  role: string
  period: string
  type: string
  accent: Accent
  scope: string
  bullets: string[]
  tags: string[]
}

export const EXPERIENCE: Role[] = [
  {
    company: "Future Research, Inc.",
    url: "https://future.co/",
    role: "Senior Analytics Engineer",
    period: "Feb 2026 – May 2026",
    type: "Contract",
    accent: "orange",
    scope: "Sole analytics-engineering contractor on the core Analytics team: 84 of 90 assigned Linear issues completed and about 30 PRs merged across modeling, infrastructure, AI enablement, and incident response in four months.",
    bullets: [
      "Cut Snowflake credits on the 11 costliest dbt models by 80%, worth $12,312 a year, by converting full-refresh builds to incremental and archiving dead models. Schema spend held about 25% below baseline while query volume grew 58%.",
      "Built the AI-ready analytics foundation: dbt persist_docs into Snowflake, 18 mart models migrated to governed per-model YAML, 90 LookML-derived context guides covering 539 measures, and 53 generated MetricFlow semantic models.",
      "Designed least-privilege Claude access to production Snowflake for 13 teammates, read-only and scoped to the mart schema with raw PII schemas excluded.",
      "Led a 13-day Fivetran Aurora PostgreSQL incident to full recovery, sequencing resyncs of 2.4 billion rows across three connectors with verified row parity, then won a $1,000 billing credit in the follow-up usage dispute.",
      "Owned source-to-mart integrations for Intercom, Amplitude, Iterable, and Google Search Console, covering ingestion, identity resolution, and modeling through production marts, and replaced a stale, agency-maintained affiliate-spend spreadsheet with a scheduled API-driven pipeline plus source-freshness monitoring that ended chronic stale data and false alerts.",
    ],
    tags: ["dbt", "Snowflake", "Fivetran", "Python", "LookML", "Hex", "MCP"],
  },
  {
    company: "The Atlanta Journal-Constitution",
    url: "https://www.ajc.com/",
    role: "Senior Data & Analytics Engineer",
    period: "Aug 2024 – Jun 2025",
    type: "Promoted · Feb 2025",
    accent: "green",
    scope: "Sole owner of analytics instrumentation and reporting infrastructure across all digital properties.",
    bullets: [
      "Promoted from Senior BI Analyst to Senior Data & Analytics Engineer within six months on expanded ownership of the company's data platform.",
      "Rolled out Amplitude across 7 digital properties solo: JavaScript instrumentation, object-action taxonomy, QA playbook, and governance documentation that outlived the tenure.",
      "Migrated event tracking and reporting from Redshift to Snowflake, improving dashboard performance and setting the foundation for governed dbt modeling.",
      "Rebuilt GTM and GA4 tracking after a restructuring left no handoff documentation, taking sole ownership of tagging, debugging, and QA across every web property.",
      "Laid the groundwork for enterprise dbt adoption and data governance through documentation, taxonomy standardization, and data-lineage mapping.",
      "Integrated AppsFlyer, Airship, and Iterable with product and platform teams, and built Power BI and Tableau dashboards that sped up editorial decisions during election coverage.",
    ],
    tags: ["Amplitude", "Snowflake", "GA4", "GTM", "Tableau", "Power BI"],
  },
  {
    company: "Shortcut",
    url: "https://www.shortcut.com/",
    role: "Senior Data Analyst",
    period: "Oct 2022 – May 2024",
    type: "Remote · SaaS",
    accent: "violet",
    scope: "Sole analyst for six departments, owning the stack from Segment and Fivetran through dbt, Snowflake, and BI.",
    bullets: [
      "Drove $100K+ in annual savings by migrating all reporting from proprietary visualization tools to Apache Superset with zero coverage loss.",
      "Administered the full modern data stack solo: Segment, Amplitude, Superset, Google Analytics, Snowflake, dbt, Fivetran, Hightouch, and Pendo.",
      "Built dbt reporting models that became the trusted source of insight for finance, sales, marketing, product, and support.",
      "Standardized event tracking definitions so non-technical teams could self-serve customer behavior analysis.",
    ],
    tags: ["Segment", "Amplitude", "dbt", "Snowflake", "Superset", "Fivetran"],
  },
  {
    company: "SteadyApp / SteadyIQ",
    url: "https://steadyiq.com/",
    role: "Product & Data Analyst",
    period: "Mar 2020 – Sep 2022",
    type: "Fintech",
    accent: "green",
    scope: "Primary technical analytics resource for product, growth, and executive teams.",
    bullets: [
      "Saved $1.4M annually by analyzing roughly 3 billion transactions and their fraud indicators to redesign the data-aggregator infrastructure around Plaid.",
      "Promoted from Product Analyst to Data Analyst in January 2022 on expanded technical ownership of the analytics stack.",
      "Built source-of-truth dbt models in Snowflake that executives trusted without re-verification, replacing inconsistent ad hoc reporting.",
      "Ran the core analytics stack: Segment, Amplitude, Tableau, Braze, and Extole.",
      "Designed tracking plans and measurement frameworks for feature launches and A/B tests before they shipped, not after.",
    ],
    tags: ["Snowflake", "dbt", "Segment", "Amplitude", "Tableau", "Braze"],
  },
]

export const EDUCATION = "B.S. Biology / Biochemistry, University of South Alabama, 2017"

// ============================================================================
// SKILLS
// ============================================================================

export interface SkillCategory {
  label: string
  accent: Accent
  tools: string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: "Data Platforms & Engineering",
    accent: "green",
    tools: ["Snowflake", "dbt", "SQL", "Python", "Fivetran", "Hightouch", "Airflow", "Redshift", "BigQuery", "Postgres", "AWS", "Docker"],
  },
  {
    label: "Analytics Engineering",
    accent: "green",
    tools: ["Dimensional Modeling", "Incremental Models", "Warehouse Cost Optimization (FinOps)", "Semantic Layers", "MetricFlow", "Metric Governance", "dbt Testing", "Documentation & Lineage", "Data Quality", "CI/CD"],
  },
  {
    label: "AI-Ready Data Systems",
    accent: "violet",
    tools: ["MCP Server Development", "FastMCP", "Governed AI Data Access", "Context Engineering", "Claude", "Claude Code", "ChatGPT / Codex", "Hex AI (Context Studio)"],
  },
  {
    label: "Product Analytics & Instrumentation",
    accent: "orange",
    tools: ["Amplitude", "Segment", "GA4", "Google Tag Manager", "AppsFlyer", "Iterable", "Airship", "Avo", "Event Taxonomy", "Experimentation"],
  },
  {
    label: "BI & Decision Systems",
    accent: "orange",
    tools: ["Looker / LookML", "Hex", "Tableau", "Power BI", "Apache Superset", "Mixpanel", "Chartbeat"],
  },
  {
    label: "Engineering Practices",
    accent: "violet",
    tools: ["Git", "TypeScript / JavaScript", "React / Next.js", "Jinja", "APIs & Automation", "Incident Response"],
  },
]

export const ALSO_WORKED_WITH = [
  "Braze", "Stripe", "Salesforce", "HubSpot", "LaunchDarkly", "Optimizely", "FullStory",
  "Qualtrics", "Chameleon", "Plaid", "Zendesk", "Pendo", "DataHub", "OpenMetadata",
  "Kafka", "MongoDB", "Hashboard", "Figma",
] as const

// ============================================================================
// ABOUT
// ============================================================================

export const ABOUT = {
  kicker: "About",
  heading: "The short version",
  body: "Before data, I studied biology and biochemistry at the University of South Alabama, and the scientific method stuck: instrument first, measure honestly, change one variable at a time. That mindset carried me from product analytics at a fintech startup through newsroom analytics at the AJC to contract platform work in health tech, usually as the only data hire in the building. I work remotely from Dothan, Alabama, and I like the problems where the pipeline, the metric, and the business decision all have to line up.",
} as const

// ============================================================================
// CONTACT
// ============================================================================

export const CONTACT = {
  heading: "Get in Touch",
  body: "Open to senior data and analytics engineering roles at product-led companies, plus contract engagements. Remote from Dothan, AL.",
} as const
