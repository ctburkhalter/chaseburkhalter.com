"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Database, Layers, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/project-card"
import { SkillBadge } from "@/components/skill-badge"
import { AboutSection } from "@/components/about-section"
import { ProjectTracker, SkillTracker, ContactTracker } from "@/components/portfolio-tracker"
import { ErrorBoundary } from "@/components/error-boundary"
import { MobileNavigation } from "@/components/mobile-navigation"

// Dynamic import for analytics demo to reduce initial bundle size
const AnalyticsDemo = dynamic(() => import("@/components/analytics-demo").then(mod => ({ default: mod.AnalyticsDemo })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse bg-muted rounded-lg h-32 w-full"></div>
    </div>
  ),
  ssr: false
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onFocus={(e) => {
          // Ensure the link is visible when focused
          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2" aria-label="Chase Burkhalter Home">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
              <span className="inline-block font-bold">Chase Burkhalter</span>
            </Link>
            <nav className="hidden md:flex gap-6" aria-label="Main navigation" role="navigation">
              <Link
                href="#about"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                aria-label="Navigate to About section"
              >
                About
              </Link>
              <Link
                href="#projects"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                aria-label="Navigate to Projects section"
              >
                Projects
              </Link>
              <Link
                href="#skills"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                aria-label="Navigate to Skills section"
              >
                Skills
              </Link>
              <Link
                href="#demos"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                aria-label="Navigate to Analytics Demos section"
              >
                Analytics Demos
              </Link>
              <Link
                href="#contact"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                aria-label="Navigate to Contact section"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
              <Link href="#contact" aria-label="Get in touch with Chase Burkhalter">Get in Touch</Link>
            </Button>
            <MobileNavigation />
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Senior Data & Analytics Engineer
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    5+ years of experience in modern data stack tooling, specializing in scalable data modeling, event instrumentation, and data governance. Proven success implementing robust tracking infrastructures and cross-platform analytics solutions that drive business impact.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild>
                    <Link href="#projects">
                      View Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#demos">Analytics Demos</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>Available for opportunities</span>
                  </div>
                  <span>•</span>
                  <span>Dothan, AL (Remote/Hybrid)</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-20 blur-xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <TrendingUp className="h-8 w-8 mb-2 text-blue-500" />
                        <h3 className="font-medium">Product Analytics</h3>
                        <p className="text-sm text-muted-foreground">Event tracking & user behavior analysis</p>
                      </div>
                      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <Database className="h-8 w-8 mb-2 text-purple-500" />
                        <h3 className="font-medium">Data Engineering</h3>
                        <p className="text-sm text-muted-foreground">Snowflake, dbt, Fivetran pipelines</p>
                      </div>
                      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <Layers className="h-8 w-8 mb-2 text-green-500" />
                        <h3 className="font-medium">Data Governance</h3>
                        <p className="text-sm text-muted-foreground">Event tracking standards & quality</p>
                      </div>
                      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <BarChart3 className="h-8 w-8 mb-2 text-orange-500" />
                        <h3 className="font-medium">Visualization</h3>
                        <p className="text-sm text-muted-foreground">Amplitude, Tableau, Superset</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Projects Section */}
        <section id="projects" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Projects</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Real-world analytics projects from my experience at AJC, Shortcut, and SteadyApp.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <ProjectTracker projectName="Amplitude Implementation">
                <ProjectCard
                  title="Amplitude Implementation & Migration"
                  description="Led the implementation of Amplitude at AJC, replacing Google Analytics and enabling stakeholder self-service analytics across digital properties. Established standardized event tracking and dashboards for key user journeys."
                  tags={["Amplitude", "Product Analytics", "Event Tracking", "Migration"]}
                  image="/amp_implementation_hero_card.png"
                />
              </ProjectTracker>
              <ProjectTracker projectName="Redshift to Snowflake Migration">
                <ProjectCard
                  title="Redshift to Snowflake Migration"
                  description="Spearheaded the migration of AJC's data warehouse from Redshift to Snowflake, improving query performance by 3-5x and reducing infrastructure costs by 40% while maintaining 100% data integrity."
                  tags={["Snowflake", "Redshift", "dbt", "Data Migration"]}
                  image="/redshift_snowflake_migration_hero_card.png"
                />
              </ProjectTracker>
              <ProjectTracker projectName="GTM/GA4 Implementation">
                <ProjectCard
                  title="GTM/GA4 Implementation & Migration"
                  description="Led the migration from Universal Analytics to GA4, implementing a comprehensive tracking strategy with Google Tag Manager to improve data quality and enable advanced analytics capabilities."
                  tags={["GA4", "Google Tag Manager", "Analytics", "Migration"]}
                  image="/gtm_ga4_migration_hero_card.png"
                />
              </ProjectTracker>
              <ProjectTracker projectName="Superset Cost Optimization">
                <ProjectCard
                  title="$100K+ Annual Savings with Superset"
                  description="Orchestrated the transition from proprietary visualization tools to Apache Superset at Shortcut, resulting in $100K+ annual cost savings while improving self-service analytics capabilities."
                  tags={["Apache Superset", "Cost Optimization", "Data Visualization"]}
                  image="/superset_savings_hero_card.png"
                />
              </ProjectTracker>
              <ProjectTracker projectName="Cross-Functional Analytics Platform">
                <ProjectCard
                  title="Cross-Functional Analytics Platform"
                  description="Built and maintained comprehensive analytics infrastructure supporting product, marketing, sales, and executive teams with unified reporting and self-service analytics capabilities."
                  tags={["dbt", "Snowflake", "Segment", "Multi-team Support"]}
                  image="/x_functional_analytics_platform_hero_card.png"
                />
              </ProjectTracker>
              <ProjectTracker projectName="Event Tracking & Data Governance">
                <ProjectCard
                  title="Event Tracking & Data Governance"
                  description="Established standardized event tracking processes and data governance frameworks across multiple organizations, improving data quality and enabling self-service analytics."
                  tags={["Event Tracking", "Data Governance", "Documentation", "Avo"]}
                  image="/event_tracking_data_gov_hero_card.png"
                />
              </ProjectTracker>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Technical Skills</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  My expertise in analytics engineering, data visualization, and product analytics tools.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <h3 className="text-lg font-semibold">Skill Level Legend</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-500 text-white px-3 py-1">Expert</Badge>
                  <span className="text-sm text-muted-foreground">90-100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500 text-white px-3 py-1">Advanced</Badge>
                  <span className="text-sm text-muted-foreground">80-89%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-yellow-500 text-gray-900 px-3 py-1">Proficient</Badge>
                  <span className="text-sm text-muted-foreground">70-79%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-gray-200 text-gray-800 px-3 py-1">Intermediate</Badge>
                  <span className="text-sm text-muted-foreground">0-69%</span>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-4xl py-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Programming & Scripting</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillTracker skillName="SQL"><SkillBadge name="SQL" level={95} /></SkillTracker>
                    <SkillTracker skillName="Python"><SkillBadge name="Python" level={90} /></SkillTracker>
                    <SkillTracker skillName="dbt"><SkillBadge name="dbt" level={95} /></SkillTracker>
                    <SkillTracker skillName="Jinja"><SkillBadge name="Jinja" level={85} /></SkillTracker>
                    <SkillTracker skillName="LookML"><SkillBadge name="LookML" level={85} /></SkillTracker>
                    <SkillTracker skillName="JavaScript"><SkillBadge name="JavaScript" level={80} /></SkillTracker>
                    <SkillTracker skillName="Clojure"><SkillBadge name="Clojure" level={75} /></SkillTracker>
                    <SkillTracker skillName="CSS"><SkillBadge name="CSS" level={80} /></SkillTracker>
                    <SkillTracker skillName="GitHub/VCS"><SkillBadge name="GitHub/VCS" level={90} /></SkillTracker>
                    <SkillTracker skillName="Jupyter"><SkillBadge name="Jupyter" level={85} /></SkillTracker>
                    <SkillTracker skillName="Next.js"><SkillBadge name="Next.js" level={80} /></SkillTracker>
                    <SkillTracker skillName="Payload CMS"><SkillBadge name="Payload CMS" level={75} /></SkillTracker>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Data Analytics & Visualization</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillTracker skillName="Amplitude"><SkillBadge name="Amplitude" level={95} /></SkillTracker>
                    <SkillTracker skillName="Tableau"><SkillBadge name="Tableau" level={90} /></SkillTracker>
                    <SkillTracker skillName="Looker"><SkillBadge name="Looker" level={85} /></SkillTracker>
                    <SkillTracker skillName="Apache Superset"><SkillBadge name="Apache Superset" level={90} /></SkillTracker>
                    <SkillTracker skillName="Google Analytics"><SkillBadge name="Google Analytics" level={90} /></SkillTracker>
                    <SkillTracker skillName="Mixpanel"><SkillBadge name="Mixpanel" level={85} /></SkillTracker>
                    <SkillTracker skillName="Hashboard"><SkillBadge name="Hashboard" level={85} /></SkillTracker>
                    <SkillTracker skillName="Hex"><SkillBadge name="Hex" level={85} /></SkillTracker>
                    <SkillTracker skillName="Power BI"><SkillBadge name="Power BI" level={80} /></SkillTracker>
                    <SkillTracker skillName="Chartbeat"><SkillBadge name="Chartbeat" level={75} /></SkillTracker>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Data Engineering & Infrastructure</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillTracker skillName="Snowflake"><SkillBadge name="Snowflake" level={95} /></SkillTracker>
                    <SkillTracker skillName="Segment"><SkillBadge name="Segment" level={95} /></SkillTracker>
                    <SkillTracker skillName="BigQuery"><SkillBadge name="BigQuery" level={90} /></SkillTracker>
                    <SkillTracker skillName="AWS"><SkillBadge name="AWS" level={85} /></SkillTracker>
                    <SkillTracker skillName="Redshift"><SkillBadge name="Redshift" level={90} /></SkillTracker>
                    <SkillTracker skillName="Fivetran"><SkillBadge name="Fivetran" level={90} /></SkillTracker>
                    <SkillTracker skillName="Hightouch"><SkillBadge name="Hightouch" level={85} /></SkillTracker>
                    <SkillTracker skillName="Google Cloud"><SkillBadge name="Google Cloud" level={85} /></SkillTracker>
                    <SkillTracker skillName="Datafold"><SkillBadge name="Datafold" level={85} /></SkillTracker>
                    <SkillTracker skillName="Docker"><SkillBadge name="Docker" level={80} /></SkillTracker>
                    <SkillTracker skillName="S3"><SkillBadge name="S3" level={85} /></SkillTracker>
                    <SkillTracker skillName="Select"><SkillBadge name="Select" level={80} /></SkillTracker>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Analytics Engineering & Instrumentation</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillTracker skillName="Amplitude"><SkillBadge name="Amplitude" level={95} /></SkillTracker>
                    <SkillTracker skillName="dbt"><SkillBadge name="dbt" level={95} /></SkillTracker>
                    <SkillTracker skillName="Event Tracking"><SkillBadge name="Event Tracking" level={95} /></SkillTracker>
                    <SkillTracker skillName="A/B Testing"><SkillBadge name="A/B Testing" level={90} /></SkillTracker>
                    <SkillTracker skillName="Cohort Analysis"><SkillBadge name="Cohort Analysis" level={90} /></SkillTracker>
                    <SkillTracker skillName="Segmentation Analysis"><SkillBadge name="Segmentation Analysis" level={90} /></SkillTracker>
                    <SkillTracker skillName="Time-series Analysis"><SkillBadge name="Time-series Analysis" level={85} /></SkillTracker>
                    <SkillTracker skillName="Regression Analysis"><SkillBadge name="Regression Analysis" level={85} /></SkillTracker>
                    <SkillTracker skillName="Data Governance"><SkillBadge name="Data Governance" level={95} /></SkillTracker>
                    <SkillTracker skillName="Product Analytics"><SkillBadge name="Product Analytics" level={95} /></SkillTracker>
                    <SkillTracker skillName="GA4"><SkillBadge name="GA4" level={90} /></SkillTracker>
                    <SkillTracker skillName="Google Tag Manager"><SkillBadge name="Google Tag Manager" level={85} /></SkillTracker>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Product & Marketing Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillBadge name="Airship" level={90} />
                    <SkillBadge name="AppsFlyer" level={85} />
                    <SkillBadge name="Avo" level={85} />
                    <SkillBadge name="Braze" level={85} />
                    <SkillBadge name="Chameleon" level={80} />
                    <SkillBadge name="CommandBar" level={80} />
                    <SkillBadge name="FullStory" level={85} />
                    <SkillBadge name="HubSpot" level={85} />
                    <SkillBadge name="Iterable" level={80} />
                    <SkillBadge name="LaunchDarkly" level={85} />
                    <SkillBadge name="Optimizely" level={85} />
                    <SkillBadge name="Piano" level={80} />
                    <SkillBadge name="Qualtrics" level={75} />
                    <SkillBadge name="Salesforce" level={85} />
                    <SkillBadge name="SimilarWeb" level={75} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Collaboration & Ops Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillBadge name="Jira" level={90} />
                    <SkillBadge name="Notion" level={85} />
                    <SkillBadge name="Slack" level={90} />
                    <SkillBadge name="Zendesk" level={80} />
                    <SkillBadge name="Figma" level={75} />
                    <SkillBadge name="Google Ad Manager" level={80} />
                    <SkillBadge name="Google Play Console" level={75} />
                    <SkillBadge name="Monday" level={80} />
                    <SkillBadge name="Plaid" level={70} />
                    <SkillBadge name="Stripe" level={75} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Demos Section */}
        <section id="demos" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Analytics Demos</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Interactive demonstrations of product analytics, event tracking, and data visualization techniques.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12">
              <ErrorBoundary>
                <AnalyticsDemo />
              </ErrorBoundary>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactTracker>
          <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get in Touch</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Interested in discussing analytics engineering opportunities or collaborating on data projects?
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-md items-center gap-6 py-12">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Chase Burkhalter</h3>
                    <p className="text-muted-foreground">Senior Data & Analytics Engineer</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <a 
                        href="mailto:chase@chaseburkhalter.com" 
                        className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded-md focus:px-1"
                        aria-label="Send email to Chase Burkhalter"
                      >
                        chase@chaseburkhalter.com
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="tel:334-333-4308" 
                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                        aria-label="Call Chase Burkhalter at 334-333-4308"
                      >
                        334-333-4308
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">Dothan, AL (Open to remote/hybrid)</p>
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button asChild>
                      <a 
                        href="mailto:chase@chaseburkhalter.com"
                        aria-label="Send email to Chase Burkhalter"
                      >
                        Send Email
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a 
                        href="tel:334-333-4308"
                        aria-label="Call Chase Burkhalter"
                      >
                        Call
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ContactTracker>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground md:text-base">© 2025 Chase Burkhalter. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/in/chase-burkhalter/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline md:text-base"
              aria-label="Visit Chase Burkhalter's LinkedIn profile"
            >
              LinkedIn
            </Link>
            <Link
              href="https://github.com/ctburkhalter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline md:text-base"
              aria-label="Visit Chase Burkhalter's GitHub profile"
            >
              GitHub
            </Link>
            <Link
              href="mailto:chase@chaseburkhalter.com"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline md:text-base"
              aria-label="Send email to Chase Burkhalter"
            >
              Email
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
