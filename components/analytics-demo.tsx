"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AnalyticsIntegrations } from "@/components/analytics-integrations"
import { useAnalytics } from "@/hooks/use-analytics"

// Sample data for the analytics demo
const pageViewData = [
  { date: "2024-08", views: 1200, users: 800, sessions: 950 },
  { date: "2024-09", views: 1900, users: 1200, sessions: 1400 },
  { date: "2024-10", views: 1500, users: 1000, sessions: 1200 },
  { date: "2024-11", views: 2200, users: 1500, sessions: 1800 },
  { date: "2024-12", views: 2800, users: 1800, sessions: 2100 },
  { date: "2025-01", views: 3100, users: 2000, sessions: 2400 },
]

const conversionData = [
  { source: "Direct", conversions: 120, rate: 3.2 },
  { source: "Organic Search", conversions: 210, rate: 4.5 },
  { source: "Paid Search", conversions: 180, rate: 5.1 },
  { source: "Social", conversions: 90, rate: 2.8 },
  { source: "Email", conversions: 150, rate: 6.2 },
  { source: "Referral", conversions: 75, rate: 3.9 },
]

const productAnalyticsData = [
  { feature: "Dashboard", dau: 1200, retention: 85, engagement: 4.2 },
  { feature: "Reports", dau: 800, retention: 78, engagement: 3.8 },
  { feature: "Integrations", dau: 600, retention: 92, engagement: 5.1 },
  { feature: "Settings", dau: 400, retention: 65, engagement: 2.9 },
  { feature: "Billing", dau: 200, retention: 88, engagement: 3.5 },
]

export function AnalyticsDemo() {
  const { trackEvent } = useAnalytics()
  const [activeTab, setActiveTab] = useState("traffic")
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [eventCount, setEventCount] = useState(0)

  const handleTrackEvent = (eventName: string) => {
    if (trackingEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Event tracked: ${eventName}`)
      }
      setEventCount((prev) => prev + 1)

      // Actually track the event using our analytics hook
      trackEvent({
        name: eventName,
        properties: {
          demo_section: true,
          tracking_enabled: trackingEnabled,
        },
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Live Analytics Integrations */}
      <AnalyticsIntegrations />

      {/* Original Analytics Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Analytics Dashboard</CardTitle>
          <CardDescription>Demo of web analytics tracking and visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${trackingEnabled ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm font-medium">
                Analytics Tracking: {trackingEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Button
              variant={trackingEnabled ? "outline" : "default"}
              onClick={() => {
                setTrackingEnabled(!trackingEnabled)
                trackEvent(`tracking_${!trackingEnabled ? "enabled" : "disabled"}`)
              }}
            >
              {trackingEnabled ? "Disable Tracking" : "Enable Tracking"}
            </Button>
          </div>

          <Tabs
            defaultValue="traffic"
            onValueChange={(value) => {
              setActiveTab(value)
              handleTrackEvent(`tab_changed_to_${value}`)
            }}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="traffic">Traffic Overview</TabsTrigger>
              <TabsTrigger value="product">Product Analytics</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
              <TabsTrigger value="events">Event Tracking</TabsTrigger>
            </TabsList>
            <TabsContent value="traffic" className="pt-4">
              <ChartContainer
                config={{
                  views: {
                    label: "Page Views",
                    color: "hsl(var(--chart-1))",
                  },
                  users: {
                    label: "Users",
                    color: "hsl(var(--chart-2))",
                  },
                  sessions: {
                    label: "Sessions",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pageViewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                    <Line type="monotone" dataKey="sessions" stroke="var(--color-sessions)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="product" className="pt-4">
              <ChartContainer
                config={{
                  dau: {
                    label: "Daily Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  retention: {
                    label: "7-Day Retention (%)",
                    color: "hsl(var(--chart-2))",
                  },
                  engagement: {
                    label: "Engagement Score",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="dau" fill="var(--color-dau)" />
                    <Bar yAxisId="left" dataKey="retention" fill="var(--color-retention)" />
                    <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="var(--color-engagement)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="conversions" className="pt-4">
              <ChartContainer
                config={{
                  conversions: {
                    label: "Conversions",
                    color: "hsl(var(--chart-1))",
                  },
                  rate: {
                    label: "Conversion Rate (%)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--color-conversions)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-rate)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="conversions" fill="var(--color-conversions)" />
                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="var(--color-rate)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="events" className="pt-4">
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl font-bold mb-2">{eventCount}</div>
                  <div className="text-sm text-muted-foreground">Events Tracked</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleTrackEvent("button_click")}>Track Button Click</Button>
                  <Button variant="outline" onClick={() => handleTrackEvent("form_submission")}>
                    Track Form Submission
                  </Button>
                  <Button variant="secondary" onClick={() => handleTrackEvent("page_view")}>
                    Track Page View
                  </Button>
                  <Button variant="destructive" onClick={() => handleTrackEvent("error_event")}>
                    Track Error Event
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Event Tracking Demo</h4>
                  <p className="text-sm text-muted-foreground">
                    This demo simulates tracking events in a web application. When you click the buttons above, real
                    events are sent to Segment, Google Tag Manager, and Amplitude. You can verify this by checking your
                    browser's network tab.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Integration Examples</CardTitle>
          <CardDescription>Code snippets for popular analytics integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="amplitude">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="amplitude">Amplitude</TabsTrigger>
              <TabsTrigger value="segment">Segment</TabsTrigger>
              <TabsTrigger value="ga4">Google Analytics 4</TabsTrigger>
              <TabsTrigger value="gtm">Google Tag Manager</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="amplitude" className="pt-4">
              <div className="p-4 bg-muted rounded-lg overflow-auto">
                <pre className="text-sm">
                  {`// Amplitude Implementation
import { Amplitude } from '@amplitude/analytics-browser';

// Initialize Amplitude
const amplitude = Amplitude.getInstance();
amplitude.init('YOUR_API_KEY');

// Set user properties
amplitude.setUserId('user-123');
amplitude.setUserProperties({
  'Plan': 'Premium',
  'Signup Date': '2024-01-15'
});

// Track events with properties
function trackFeatureUsage(feature) {
  amplitude.logEvent('Feature Used', {
    'Feature Name': feature.name,
    'Feature Category': feature.category,
    'User Segment': 'Power User',
    'Session Duration': 1200
  });
}

// Track revenue events
function trackPurchase(purchase) {
  amplitude.logRevenue({
    price: purchase.amount,
    productId: purchase.productId,
    quantity: 1
  });
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="segment" className="pt-4">
              <div className="p-4 bg-muted rounded-lg overflow-auto">
                <pre className="text-sm">
                  {`// Segment Implementation
import { Analytics } from '@segment/analytics-node';

// Initialize Segment
const analytics = new Analytics({
  writeKey: 'YOUR_SEGMENT_WRITE_KEY'
});

// Identify users
analytics.identify({
  userId: 'user-123',
  traits: {
    email: 'user@example.com',
    plan: 'premium',
    company: 'Acme Corp'
  }
});

// Track events
analytics.track({
  userId: 'user-123',
  event: 'Product Feature Used',
  properties: {
    feature_name: 'Advanced Analytics',
    feature_category: 'Analytics',
    plan_type: 'premium'
  }
});

// Track page views
analytics.page({
  userId: 'user-123',
  name: 'Dashboard',
  properties: {
    path: '/dashboard',
    referrer: 'https://app.example.com/login'
  }
});`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="ga4" className="pt-4">
              <div className="p-4 bg-muted rounded-lg overflow-auto">
                <pre className="text-sm">
                  {`// Google Analytics 4 Implementation
import { Analytics } from '@vercel/analytics/next';

// In your root layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

// Track custom events
import { track } from '@vercel/analytics';

function handleClick() {
  track('button_click', { location: 'hero', id: 'signup' });
}`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="gtm" className="pt-4">
              <div className="p-4 bg-muted rounded-lg overflow-auto">
                <pre className="text-sm">
                  {`// Google Tag Manager Implementation

// 1. Add GTM script to your head
// In your document head or a component that renders in the head
<script
  dangerouslySetInnerHTML={{
    __html: \`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-XXXXXXX');
    \`
  }}
/>

// 2. Add noscript fallback right after body open tag
<noscript>
  <iframe 
    src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" 
    width="0" 
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>

// 3. Push events to the data layer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'button_click',
  buttonId: 'signup',
  buttonLocation: 'hero',
  userType: 'new_visitor'
});

// 4. Push page view events
window.dataLayer.push({
  event: 'page_view',
  page: {
    title: document.title,
    location: window.location.href,
    path: window.location.pathname
  }
});`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="pt-4">
              <div className="p-4 bg-muted rounded-lg overflow-auto">
                <pre className="text-sm">
                  {`// Custom Analytics Implementation
// server-action.js
'use server'

import { sql } from '@vercel/postgres';

export async function trackEvent(event) {
  try {
    await sql\`
      INSERT INTO analytics_events (
        event_name, 
        event_properties, 
        user_id, 
        session_id, 
        timestamp
      ) VALUES (
        \${event.name}, 
        \${JSON.stringify(event.properties)}, 
        \${event.userId}, 
        \${event.sessionId}, 
        NOW()
      )
    \`;
    return { success: true };
  } catch (error) {
    console.error('Failed to track event:', error);
    return { success: false, error };
  }
}

// client-side usage
'use client'
import { trackEvent } from './server-action';

function handleClick() {
  trackEvent({
    name: 'button_click',
    properties: { location: 'hero' },
    userId: 'user-123',
    sessionId: 'session-456'
  });
}`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
