"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AnalyticsIntegrations } from "@/components/analytics-integrations"
import { useTrackEvent } from "@/hooks/use-analytics"
import { TrendingUp, Users, Eye, MousePointer, Clock, CheckCircle2, AlertCircle, Code, Copy, EyeIcon, Database, BarChart3 } from "lucide-react"
import { AnalyticsDemoSkeleton } from "@/components/skeletons"
import { useToast } from "@/components/toast"

// Real portfolio analytics data based on Chase's experience
const portfolioMetrics = {
  totalProjects: 6,
  yearsExperience: 5,
  toolsMastered: 45,
  companiesWorked: 3,
  analyticsImplementations: 12,
  costSavings: "$1.5M+"
}

// Real analytics implementations Chase has built
const analyticsImplementations = [
  {
    name: "Amplitude Implementation",
    company: "AJC",
    description: "Led implementation replacing Google Analytics with Amplitude",
    metrics: { users: "200k+ monthly active", events: "2+ million monthly", products: "7 sites & apps" },
    impact: "Enabled stakeholder self-service analytics"
  },
  {
    name: "Redshift → Snowflake Migration",
    company: "AJC", 
    description: "Spearheaded data warehouse migration",
    metrics: { performance: "3-5x faster", cost: "40% reduction", integrity: "99%" },
    impact: "Improved query performance and reduced costs"
  },
  {
    name: "GTM/GA4 Migration",
    company: "AJC",
    description: "Led migration from Universal Analytics to GA4",
    metrics: { variables: 55, tags: 29, triggers: 25 },
    impact: "Improved data quality and advanced analytics"
  },
  {
    name: "Superset Cost Optimization",
    company: "Shortcut",
    description: "Transitioned from proprietary tools to Apache Superset",
    metrics: { savings: "$100K+", users: 30, dashboards: 22 },
    impact: "Massive cost savings with improved capabilities"
  }
]

// Live portfolio interaction tracking
const portfolioInteractions = [
  { action: "Project Card View", count: 0, icon: Eye },
  { action: "Skill Badge Click", count: 0, icon: MousePointer },
  { action: "Analytics Demo Interaction", count: 0, icon: TrendingUp },
  { action: "Contact Form View", count: 0, icon: Users },
]

export function AnalyticsDemo() {
  const { trackEvent } = useTrackEvent()
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [liveInteractions, setLiveInteractions] = useState(portfolioInteractions)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPayload, setLastPayload] = useState<any>(null)
  const [showPayloadPreview, setShowPayloadPreview] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show skeleton while hydrating
  if (!isClient) {
    return <AnalyticsDemoSkeleton />
  }

  // Track portfolio interactions
  const handlePortfolioInteraction = (action: string) => {
    if (trackingEnabled) {
      setIsLoading(true)
      setError(null)
      
      const eventPayload = {
        name: `portfolio_${action.toLowerCase().replace(/\s+/g, '_')}`,
        properties: {
          demo_section: true,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          interaction_type: action,
          portfolio_section: 'analytics_demo',
        },
      }

      // Store the payload for preview
      setLastPayload({
        segment: {
          event: eventPayload.name,
          properties: eventPayload.properties,
          timestamp: eventPayload.properties.timestamp,
          context: {
            userAgent: navigator.userAgent,
            page: {
              url: window.location.href,
              title: document.title,
              path: window.location.pathname,
            },
          },
        },
        gtm: {
          event: eventPayload.name,
          ...eventPayload.properties,
          page_path: window.location.pathname,
          page_title: document.title,
          page_url: window.location.href,
        },
        amplitude: {
          event_type: eventPayload.name,
          event_properties: eventPayload.properties,
          user_properties: {
            portfolio_visitor: true,
            demo_participant: true,
          },
          time: new Date().getTime(),
        },
      })
      
      try {
        trackEvent(eventPayload)

        // Update live interaction counts
        setLiveInteractions(prev => 
          prev.map(interaction => 
            interaction.action === action 
              ? { ...interaction, count: interaction.count + 1 }
              : interaction
          )
        )
        
        // Show success toast
        success("Event Tracked", `${action} interaction has been tracked successfully`)
      } catch (err) {
        const errorMessage = "Failed to track interaction. Please try again."
        setError(errorMessage)
        showError("Tracking Failed", errorMessage)
        console.error("Analytics tracking error:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Track tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    handlePortfolioInteraction(`Analytics Demo Tab: ${value}`)
  }

  return (
    <div className="space-y-8">
      {/* Live Analytics Integrations */}
      <AnalyticsIntegrations />

      {/* Portfolio Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Real analytics implementations from Chase's experience at AJC, Shortcut, and SteadyApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tracking Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${trackingEnabled ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm font-medium">
                Live Tracking: {trackingEnabled ? "Active" : "Disabled"}
              </span>
            </div>
            <Button
              variant={trackingEnabled ? "outline" : "default"}
              onClick={() => {
                setTrackingEnabled(!trackingEnabled)
                handlePortfolioInteraction(`Tracking ${!trackingEnabled ? "Enabled" : "Disabled"}`)
              }}
              disabled={isLoading}
            >
              {trackingEnabled ? "Disable Tracking" : "Enable Tracking"}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
              <TabsTrigger value="implementations">Real Implementations</TabsTrigger>
              <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
            </TabsList>

            {/* Portfolio Overview Tab */}
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{portfolioMetrics.totalProjects}</div>
                    <p className="text-sm text-muted-foreground">Featured Projects</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{portfolioMetrics.yearsExperience}+</div>
                    <p className="text-sm text-muted-foreground">Years Experience</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">{portfolioMetrics.toolsMastered}</div>
                    <p className="text-sm text-muted-foreground">Tools Mastered</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">{portfolioMetrics.companiesWorked}</div>
                    <p className="text-sm text-muted-foreground">Companies</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{portfolioMetrics.analyticsImplementations}</div>
                    <p className="text-sm text-muted-foreground">Analytics Implementations</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-emerald-600">{portfolioMetrics.costSavings}</div>
                    <p className="text-sm text-muted-foreground">Cost Savings</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Analytics Engineering Expertise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chase specializes in building scalable analytics infrastructure, implementing event tracking systems, 
                  and creating self-service analytics platforms. His implementations have driven significant business impact 
                  across multiple organizations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Amplitude</Badge>
                  <Badge variant="secondary">Segment</Badge>
                  <Badge variant="secondary">Snowflake</Badge>
                  <Badge variant="secondary">dbt</Badge>
                  <Badge variant="secondary">GA4</Badge>
                  <Badge variant="secondary">GTM</Badge>
                  <Badge variant="secondary">Apache Superset</Badge>
                  <Badge variant="secondary">Event Tracking</Badge>
                </div>
              </div>
            </TabsContent>

            {/* Real Implementations Tab */}
            <TabsContent value="implementations" className="pt-4">
              <div className="space-y-4">
                {analyticsImplementations.map((impl, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{impl.name}</CardTitle>
                        <Badge variant="outline">{impl.company}</Badge>
                      </div>
                      <CardDescription>{impl.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(impl.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-semibold">{value}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Impact:</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">{impl.impact}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Live Tracking Tab */}
            <TabsContent value="live-tracking" className="pt-4">
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-lg font-semibold mb-2">Live Portfolio Interactions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track real interactions with this portfolio site
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {liveInteractions.map((interaction, index) => {
                      const IconComponent = interaction.icon
                      return (
                        <div key={index} className="text-center">
                          <IconComponent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold">{interaction.count}</div>
                          <div className="text-xs text-muted-foreground">{interaction.action}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handlePortfolioInteraction("Project Card View")}
                    disabled={isLoading || !trackingEnabled}
                    className="w-full min-h-[44px] touch-manipulation"
                    aria-label="Track project card view interaction"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Track Project View
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handlePortfolioInteraction("Skill Badge Click")}
                    disabled={isLoading || !trackingEnabled}
                    className="w-full min-h-[44px] touch-manipulation"
                    aria-label="Track skill badge click interaction"
                  >
                    <MousePointer className="mr-2 h-4 w-4" />
                    Track Skill Click
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handlePortfolioInteraction("Analytics Demo Interaction")}
                    disabled={isLoading || !trackingEnabled}
                    className="w-full min-h-[44px] touch-manipulation"
                    aria-label="Track analytics demo interaction"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Track Demo Interaction
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handlePortfolioInteraction("Contact Form View")}
                    disabled={isLoading || !trackingEnabled}
                    className="w-full min-h-[44px] touch-manipulation"
                    aria-label="Track contact form view interaction"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Track Contact View
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">How Live Tracking Works</h4>
                  <p className="text-sm text-muted-foreground">
                    This portfolio implements real analytics tracking using Segment, Google Tag Manager, and Amplitude. 
                    When you interact with the buttons above, actual events are sent to these platforms. You can verify 
                    this by opening your browser's developer tools and checking the network tab.
                  </p>
                </div>

                {/* Payload Preview Section */}
                {lastPayload ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Last Event Payload Preview</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPayloadPreview(!showPayloadPreview)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          {showPayloadPreview ? "Hide" : "Show"} Payload
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2))
                            success("Copied to Clipboard", "JSON payload has been copied to your clipboard")
                          }}
                          aria-label="Copy JSON payload to clipboard"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy JSON
                        </Button>
                      </div>
                    </div>

                    {showPayloadPreview && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Segment
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(lastPayload.segment, null, 2)}
                              </pre>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                Google Tag Manager
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(lastPayload.gtm, null, 2)}
                              </pre>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Amplitude
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(lastPayload.amplitude, null, 2)}
                              </pre>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Payload Details</h5>
                          <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>Event Name:</strong> {lastPayload.segment.event}</p>
                            <p><strong>Timestamp:</strong> {lastPayload.segment.timestamp}</p>
                            <p><strong>User Agent:</strong> {lastPayload.segment.context.userAgent.substring(0, 50)}...</p>
                            <p><strong>Page URL:</strong> {lastPayload.segment.context.page.url}</p>
                            <div className="mt-2">
                              <p className="font-medium mb-1">Custom Properties:</p>
                              <div className="bg-white rounded p-2 text-xs">
                                {Object.entries(lastPayload.segment.properties).map(([key, value]) => (
                                  <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                                    <span className="font-mono text-blue-700">{key}:</span>
                                    <span className="text-gray-600">
                                      {typeof value === 'string' ? `"${value}"` : 
                                       typeof value === 'boolean' ? value.toString() :
                                       typeof value === 'number' ? value.toString() :
                                       JSON.stringify(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <EyeIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      No events tracked yet. Click one of the buttons above to see the payload preview.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
