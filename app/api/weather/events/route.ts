import { NextRequest, NextResponse } from "next/server"
import { filterWeatherEvents, getWeatherEventsForYears } from "@/lib/weather/data"
import { WEATHER_REGIONS } from "@/lib/weather/types"

export const runtime = "nodejs"

const earliestYear = 1950
const maxRangeSpan = 20

function isValidYear(value: string): boolean {
  return /^\d{4}$/.test(value) && Number(value) >= earliestYear && Number(value) <= new Date().getFullYear()
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const region = searchParams.get("region")
  const year = searchParams.get("year")
  const yearFrom = searchParams.get("yearFrom")
  const yearTo = searchParams.get("yearTo")
  const month = searchParams.get("month")
  const rating = searchParams.get("rating")
  const eventId = searchParams.get("event_id")

  if (region && !WEATHER_REGIONS.includes(region as (typeof WEATHER_REGIONS)[number])) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 })
  }
  if (rating && !/^[0-5]$/.test(rating)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
  }
  if (month && !/^([1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 })
  }

  let years: number[]
  if (yearFrom || yearTo) {
    if (!yearFrom || !yearTo || !isValidYear(yearFrom) || !isValidYear(yearTo) || Number(yearFrom) > Number(yearTo)) {
      return NextResponse.json({ error: "Invalid year range" }, { status: 400 })
    }
    if (Number(yearTo) - Number(yearFrom) + 1 > maxRangeSpan) {
      return NextResponse.json({ error: `Year range cannot exceed ${maxRangeSpan} years` }, { status: 400 })
    }
    years = Array.from({ length: Number(yearTo) - Number(yearFrom) + 1 }, (_, index) => Number(yearFrom) + index)
  } else if (year) {
    if (!isValidYear(year)) return NextResponse.json({ error: "Invalid year" }, { status: 400 })
    years = [Number(year)]
  } else {
    years = [new Date().getFullYear()]
  }

  const { events: yearEvents, sourceMode } = await getWeatherEventsForYears(years)

  if (eventId) {
    const match = yearEvents.filter((event) => event.eventId === eventId).slice(0, 1)
    return NextResponse.json(
      { events: match, count: match.length, totalMatched: match.length, truncated: false, sourceMode },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
    )
  }

  const { events, totalMatched } = filterWeatherEvents(yearEvents, { region, month, rating })

  return NextResponse.json(
    { events, count: events.length, totalMatched, truncated: totalMatched > events.length, sourceMode },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
  )
}
