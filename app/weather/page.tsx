import type { Metadata } from "next"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"
import { getWeatherDashboard, getWeatherProjectExplorer } from "@/lib/weather/data"

export const metadata: Metadata = {
  title: "South Alabama Tornado Watch | Chase Burkhalter",
  description: "A dbt and NOAA analytics-engineering portfolio project with a tornado event explorer and inspectable dbt lineage.",
  alternates: { canonical: "/weather" },
}

export default async function WeatherPage() {
  const [payload, projectExplorer] = await Promise.all([getWeatherDashboard(), getWeatherProjectExplorer()])
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader isPortfolioHome={false} />
      <WeatherDashboard initialPayload={payload} initialProjectExplorer={projectExplorer} />
      <SiteFooter />
    </div>
  )
}
