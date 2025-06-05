"use client"

import { useState } from "react"
import { useAnalytics } from "@/hooks/use-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function AnalyticsIntegrations() {
  const { trackEvent, identifyUser } = useAnalytics()
  const [userId, setUserId] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventProperty, setEventProperty] = useState("")
  const [eventValue, setEventValue] = useState("")
  const [eventSent, setEventSent] = useState(false)
  const [userIdentified, setUserIdentified] = useState(false)

  const handleTrackEvent = () => {
    if (!eventName) return

    const properties: Record<string, any> = {}
    if (eventProperty && eventValue) {
      properties[eventProperty] = eventValue
    }

    trackEvent({
      name: eventName,
      properties,
    })

    setEventSent(true)
    setTimeout(() => setEventSent(false), 3000)
  }

  const handleIdentifyUser = () => {
    if (!userId) return

    identifyUser(userId, {
      visited_portfolio: true,
      visited_at: new Date().toISOString(),
    })

    setUserIdentified(true)
    setTimeout(() => setUserIdentified(false), 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Live Analytics Integrations</CardTitle>
        <CardDescription>Test the actual analytics integrations powering this portfolio site</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="track">Track Events</TabsTrigger>
            <TabsTrigger value="identify">Identify User</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Customer Data Platform that collects, standardizes, and routes user data to marketing, analytics,
                    and data warehouse tools.
                  </p>
                  <div className="mt-4 flex items-center text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Active on this site</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Google Tag Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tag management system that allows you to quickly update tags and code snippets on your website.
                  </p>
                  <div className="mt-4 flex items-center text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Active on this site</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Amplitude</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Product analytics platform that helps you understand user behavior and improve product experiences.
                  </p>
                  <div className="mt-4 flex items-center text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Active on this site</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">How It Works</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This portfolio site implements actual analytics tracking using Segment, Google Tag Manager, and
                Amplitude. You can test the implementations using the tabs above.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => window.open("/analytics-dashboard", "_blank")}>
                  View Live Analytics Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="track" className="space-y-4 pt-4">
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

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">What happens when you track an event?</h3>
                <p className="text-sm text-muted-foreground">
                  When you click "Track Event", the event data is sent to Segment, which then forwards it to Google Tag
                  Manager and Amplitude. You can verify this by opening your browser's developer tools and checking the
                  network tab.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="identify" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  placeholder="e.g., your-email@example.com"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <Button onClick={handleIdentifyUser} disabled={!userId || userIdentified} className="w-full">
                {userIdentified ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> User Identified Successfully
                  </>
                ) : (
                  "Identify User"
                )}
              </Button>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">What happens when you identify a user?</h3>
                <p className="text-sm text-muted-foreground">
                  When you click "Identify User", the user ID and traits are sent to all analytics providers. This
                  allows you to track user behavior across sessions and connect events to specific users.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4 pt-4">
            <div className="bg-muted p-4 rounded-lg overflow-auto">
              <h3 className="font-medium mb-2">Analytics Architecture</h3>
              <pre className="text-xs">
                {`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Actions   │────▶│  Analytics Hook │────▶│  Analytics Lib  │
│                 │     │                 │     │                 │
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
                This portfolio site uses a modular analytics architecture that makes it easy to add or remove analytics
                providers. All tracking is centralized through a single Analytics Manager that distributes events to all
                configured providers.
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
                  <p className="text-sm">✓ User identification</p>
                  <p className="text-sm">✓ Custom event tracking</p>
                  <p className="text-sm">✓ React hooks for easy integration</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Extensibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">✓ Easy to add new providers</p>
                  <p className="text-sm">✓ Consistent API across providers</p>
                  <p className="text-sm">✓ TypeScript for type safety</p>
                  <p className="text-sm">✓ Environment variable configuration</p>
                  <p className="text-sm">✓ Server-side compatibility</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
