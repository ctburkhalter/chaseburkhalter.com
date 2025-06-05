import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsDashboardPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Live analytics data from Segment, Google Tag Manager, and Amplitude</p>
      </div>

      <Tabs defaultValue="segment">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segment">Segment</TabsTrigger>
          <TabsTrigger value="gtm">Google Tag Manager</TabsTrigger>
          <TabsTrigger value="amplitude">Amplitude</TabsTrigger>
        </TabsList>

        <TabsContent value="segment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Segment Dashboard</CardTitle>
              <CardDescription>View your Segment data in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Segment dashboard will be embedded here when connected to your Segment account
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gtm" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Tag Manager Dashboard</CardTitle>
              <CardDescription>View your GTM data in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Google Tag Manager dashboard will be embedded here when connected to your GTM account
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amplitude" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Amplitude Dashboard</CardTitle>
              <CardDescription>View your Amplitude data in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Amplitude dashboard will be embedded here when connected to your Amplitude account
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Note: This is a placeholder dashboard. In a real implementation, you would embed actual dashboards from your
          analytics providers.
        </p>
      </div>
    </div>
  )
}
