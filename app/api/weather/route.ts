import { NextResponse } from "next/server"
import { getWeatherDashboard } from "@/lib/weather/data"

export const runtime = "nodejs"

export async function GET() {
  const payload = await getWeatherDashboard()
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  })
}
