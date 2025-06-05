import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Chase</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Senior Data & Analytics Engineer with a proven track record of driving business impact through data.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl py-12">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Professional Journey</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-1 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">The Atlanta Journal-Constitution</h4>
                      <p className="text-sm text-muted-foreground">Senior Data/Analytics Engineer (Promoted)</p>
                      <p className="text-xs text-muted-foreground">Aug 2024 - Present</p>
                      <p className="text-sm mt-1">
                        Leading analytics for digital products, migrating to Snowflake, implementing Amplitude
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-1 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Shortcut (Remote)</h4>
                      <p className="text-sm text-muted-foreground">Senior Data Analyst</p>
                      <p className="text-xs text-muted-foreground">Oct 2022 - May 2024</p>
                      <p className="text-sm mt-1">
                        Sole analyst supporting all teams, saved $100K+ with Superset migration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-1 text-green-500" />
                    <div>
                      <h4 className="font-semibold">SteadyApp/SteadyIQ</h4>
                      <p className="text-sm text-muted-foreground">Data Analyst → Product Analyst</p>
                      <p className="text-xs text-muted-foreground">Mar 2020 - Sep 2022</p>
                      <p className="text-sm mt-1">
                        Analyzed 3B+ transactions, saved $1.4M annually through fraud detection
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Key Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-green-500" />
                    <div>
                      <h4 className="font-semibold">$1.4M Annual Savings</h4>
                      <p className="text-sm text-muted-foreground">
                        Analyzed 3+ billion financial transactions to optimize data aggregator management
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">$100K+ Cost Reduction</h4>
                      <p className="text-sm text-muted-foreground">
                        Led transition from proprietary tools to Apache Superset
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Cross-Functional Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        Sole analyst supporting sales, finance, marketing, product, and engineering teams
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Data Governance Leader</h4>
                      <p className="text-sm text-muted-foreground">
                        Standardized event tracking processes and implemented robust data governance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Specializations</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Product Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Expert in event tracking, user behavior analysis, and product performance measurement
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Event Tracking
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        User Funnels
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        A/B Testing
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Cohort Analysis
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Analytics Engineering</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Building robust data pipelines and transformations for scalable analytics infrastructure
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        dbt
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Snowflake
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Data Modeling
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ETL/ELT
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Data Governance</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Implementing standards and processes to ensure data quality and consistency
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Data Quality
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Documentation
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Standards
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Validation
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Business Intelligence</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Creating actionable insights and dashboards for cross-functional teams
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Dashboards
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        KPI Tracking
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Self-Service
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Reporting
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
