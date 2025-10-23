"use client"

import { useState } from "react"
import { useTrackEvent } from "@/hooks/use-analytics"
import { createCustomEvent } from "@/lib/analytics-events"
import { useToast } from "@/components/toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ExternalLink, Code, Database, BarChart3 } from "lucide-react"

const sanitizeEventName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

export function AnalyticsIntegrations() {
  const { trackEvent, identifyUser } = useTrackEvent()
  const { warning, error: showError } = useToast()
  const [userId, setUserId] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventProperty, setEventProperty] = useState("")
  const [eventValue, setEventValue] = useState("")
  const [eventSent, setEventSent] = useState(false)
  const [userIdentified, setUserIdentified] = useState(false)

  const isSegmentActive = Boolean(process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY)
  const isGtmActive = Boolean(process.env.NEXT_PUBLIC_GTM_CONTAINER_ID)
  const isAmplitudeActive = isSegmentActive

  const getStatusIndicator = (isActive: boolean) =>
    `h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"} mr-2`

  const getStatusLabel = (isActive: boolean) => (isActive ? "Active" : "Inactive")

  const handleTrackEvent = () => {
    if (!eventName) return

    const normalizedEventName = sanitizeEventName(eventName)

    if (!normalizedEventName) {
      showError("Invalid Event Name", "Event names must include at least one alphanumeric character.")
      return
    }

    if (normalizedEventName !== eventName) {
      setEventName(normalizedEventName)
      warning("Event Name Normalized", `Converted to ${normalizedEventName} to follow snake_case conventions.`)
    }

    const properties: Record<string, any> = {}
    if (eventProperty && eventValue) {
      properties[eventProperty] = eventValue
    }

    const event = createCustomEvent(normalizedEventName, properties)
    trackEvent(event)

    setEventSent(true)
    setTimeout(() => setEventSent(false), 3000)
  }

  const handleIdentifyUser = () => {
    if (!userId) return

    identifyUser(userId, {
      visited_portfolio: true,
      visited_at: new Date().toISOString(),
      source: "analytics_demo",
    })

    setUserIdentified(true)
    setTimeout(() => setUserIdentified(false), 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Live Analytics Integrations
        </CardTitle>
        <CardDescription>
          Test the actual analytics infrastructure powering this portfolio site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Infrastructure</TabsTrigger>
            <TabsTrigger value="test">Test Tracking</TabsTrigger>
            <TabsTrigger value="code">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Segment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Customer Data Platform that collects, standardizes, and routes user data to marketing, analytics,
                    and data warehouse tools.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <div className={getStatusIndicator(isSegmentActive)}></div>
                      <span>{getStatusLabel(isSegmentActive)}</span>
                    </div>
                    <Badge variant="secondary">CDP</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Google Tag Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tag management system that allows you to quickly update tags and code snippets on your website.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <div className={getStatusIndicator(isGtmActive)}></div>
                      <span>{getStatusLabel(isGtmActive)}</span>
                    </div>
                    <Badge variant="secondary">TMS</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Amplitude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Product analytics platform that helps you understand user behavior and improve product experiences.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <div className={getStatusIndicator(isAmplitudeActive)}></div>
                      <span>{getStatusLabel(isAmplitudeActive)}</span>
                    </div>
                    <Badge variant="secondary">Product Analytics</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Portfolio Analytics Architecture</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This portfolio implements a production-ready analytics stack that Chase has built and maintained 
                across multiple organizations. The architecture demonstrates real-world analytics engineering expertise.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => window.open("https://github.com/ctburkhalter", "_blank")}>
                  View Source Code <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., portfolio_project_viewed"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="property-name">Property Name (Optional)</Label>
                  <Input
                    id="property-name"
                    placeholder="e.g., project_name"
                    value={eventProperty}
                    onChange={(e) => setEventProperty(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="property-value">Property Value (Optional)</Label>
                  <Input
                    id="property-value"
                    placeholder="e.g., analytics_dashboard"
                    value={eventValue}
                    onChange={(e) => setEventValue(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleTrackEvent} disabled={!eventName || eventSent} className="w-full">
                {eventSent ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Event Sent Successfully
                  </>
                ) : (
                  "Track Event"
                )}
              </Button>

              <div className="border-t pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="user-id">User Identification</Label>
                  <Input
                    id="user-id"
                    placeholder="e.g., your-email@example.com"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <Button onClick={handleIdentifyUser} disabled={!userId || userIdentified} className="w-full mt-2">
                  {userIdentified ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> User Identified Successfully
                    </>
                  ) : (
                    "Identify User"
                  )}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">What happens when you track an event?</h3>
                <p className="text-sm text-muted-foreground">
                  When you click "Track Event", the event data is sent to Segment, which then forwards it to Google Tag
                  Manager and Amplitude. You can verify this by opening your browser's developer tools and checking the
                  network tab for requests to these services.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 pt-4">
            <div className="bg-muted p-4 rounded-lg overflow-auto">
              <h3 className="font-medium mb-2">Analytics Architecture</h3>
              <pre className="text-xs">
                {`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Portfolio      │────▶│  Analytics Hook │────▶│  Analytics Lib  │
│  Interactions   │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                        ┌─────────────────────────────────────────┐
                        │                                         │
                        │           Analytics Manager             │
                        │                                         │
                        └───┬─────────────────┬─────────────┬─────┘
                            │                 │             │
                            ▼                 ▼             ▼
                ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                │                 │ │                 │ │                 │
                │     Segment     │ │       GTM       │ │    Amplitude    │
                │                 │ │                 │ │                 │
                └─────────────────┘ └─────────────────┘ └─────────────────┘
`}
              </pre>
              <p className="text-sm text-muted-foreground mt-4">
                This portfolio uses a modular analytics architecture that Chase has implemented across multiple 
                organizations. The system is designed for scalability, maintainability, and easy integration of 
                new analytics providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">✓ Provider-agnostic tracking API</p>
                  <p className="text-sm">✓ Automatic page view tracking</p>
                  <p className="text-sm">✓ User identification & traits</p>
                  <p className="text-sm">✓ Custom event tracking</p>
                  <p className="text-sm">✓ React hooks for easy integration</p>
                  <p className="text-sm">✓ Error handling & fallbacks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Production Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">✓ TypeScript for type safety</p>
                  <p className="text-sm">✓ Environment variable configuration</p>
                  <p className="text-sm">✓ Server-side compatibility</p>
                  <p className="text-sm">✓ Performance optimized</p>
                  <p className="text-sm">✓ GDPR compliant</p>
                  <p className="text-sm">✓ Easy to extend & maintain</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
