"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import type {
  DbtProjectExplorerPayload,
  WeatherDashboardPayload,
  WeatherEvent,
  WeatherEventsResponse,
  WeatherRegion,
} from "@/lib/weather/types"
import { useAnalytics } from "@/hooks/use-analytics"
import {
  createWeatherDashboardInteractedEvent,
  createWeatherDashboardViewedEvent,
} from "@/lib/analytics-events"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DbtProjectExplorer } from "@/components/weather/dbt-project-explorer"

const TornadoEventMap = dynamic(
  () => import("@/components/weather/tornado-event-map").then((module) => module.TornadoEventMap),
  { ssr: false, loading: () => <div className="flex h-[480px] items-center justify-center rounded-md border border-border/70 bg-muted/30 text-sm text-muted-foreground">Loading interactive map...</div> },
)

const monthOptions = [
  { value: "1", label: "Jan" }, { value: "2", label: "Feb" }, { value: "3", label: "Mar" },
  { value: "4", label: "Apr" }, { value: "5", label: "May" }, { value: "6", label: "Jun" },
  { value: "7", label: "Jul" }, { value: "8", label: "Aug" }, { value: "9", label: "Sep" },
  { value: "10", label: "Oct" }, { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: "America/Chicago",
  }).format(new Date(value))
}

function formatUsd(value: number | null) {
  if (value === null) return "Not reported"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

function formatImpactCount(value: number | null) {
  return value === null ? "Not reported" : String(value)
}

function eventStatusLabel(event: WeatherEvent) {
  return event.recordStatus === "preliminary" ? "Preliminary report" : "Confirmed event"
}

function formatRatingCode(event: WeatherEvent) {
  return event.ratingCode ?? "Not rated"
}

function noop() {}

function EventDetailSheet({ event, open, onOpenChange, onSourceOpen }: {
  event: WeatherEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSourceOpen: () => void
}) {
  if (!event) return null

  const hasBeginPoint = event.beginLatitude !== null && event.beginLongitude !== null
  const details = [
    ["Status", eventStatusLabel(event)],
    ["Rating", formatRatingCode(event)],
    ["Estimated wind", event.windEstimateLowMph && event.windEstimateHighMph ? `${event.windEstimateLowMph} to ${event.windEstimateHighMph} mph` : "Not rated"],
    ["Path length", event.pathLengthMiles === null ? "Not reported" : `${event.pathLengthMiles} mi`],
    ["Path width", event.pathWidthYards === null ? "Not reported" : `${event.pathWidthYards} yd`],
    ["Injuries", formatImpactCount(event.injuries)],
    ["Fatalities", formatImpactCount(event.fatalities)],
    ["Property damage", formatUsd(event.propertyDamageUsd)],
    ["Crop damage", formatUsd(event.cropDamageUsd)],
    ["Report source", event.sourceAttribution ?? "Not reported"],
    ["WFO", event.wfo ?? "Not reported"],
  ]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{formatRatingCode(event)} · {event.county}, {event.state}</SheetTitle>
          <SheetDescription>{formatDateTime(event.occurredAt)} · {event.beginLocation ?? "Location not reported"} to {event.endLocation ?? "location not reported"}</SheetDescription>
        </SheetHeader>
        <div className="mt-5">
          {hasBeginPoint
            ? <TornadoEventMap events={[event]} selectedEvent={event} onSelectEvent={noop} heightClassName="h-64" />
            : <p className="rounded-md border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">Endpoint coordinates were not reported for this event.</p>}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {details.map(([term, value]) => <div key={term}><dt className="text-xs text-muted-foreground">{term}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}
        </dl>
        <p className="mt-5 rounded-md border border-chart-3/25 bg-chart-3/10 p-3 text-xs text-muted-foreground"><strong className="text-foreground">{eventStatusLabel(event)}:</strong> {event.windEstimateNote}</p>
        {event.narrative && <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{event.narrative}</p>}
        <a href={event.sourceUrl} target="_blank" rel="noreferrer" onClick={onSourceOpen} className="mt-5 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Source record</a>
      </SheetContent>
    </Sheet>
  )
}

export function WeatherDashboard({ initialPayload, initialProjectExplorer }: { initialPayload: WeatherDashboardPayload; initialProjectExplorer: DbtProjectExplorerPayload | null }) {
  const { trackEvent } = useAnalytics()
  const [region, setRegion] = useState<WeatherRegion>("alabama")
  const [minimumRating, setMinimumRating] = useState("0")
  const availableYears = useMemo(() => initialPayload.eventYearIndex.map((entry) => entry.year), [initialPayload.eventYearIndex])
  const defaultYear = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return availableYears.includes(currentYear) ? currentYear : (availableYears[0] ?? currentYear)
  }, [availableYears])
  const [yearFrom, setYearFrom] = useState(defaultYear)
  const [yearTo, setYearTo] = useState(defaultYear)
  const [month, setMonth] = useState("")
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalMatched, setTotalMatched] = useState(0)
  const [truncated, setTruncated] = useState(false)
  const dashboardViewTracked = useRef(false)
  const methodologyTracked = useRef(false)
  const methodologyRef = useRef<HTMLElement>(null)
  const sourceLabel = initialPayload.sourceMode === "pipeline" ? "Published pipeline data" : "Local contract fixture"

  useEffect(() => {
    if (typeof window === "undefined" || dashboardViewTracked.current || window.__weatherDashboardViewTracked) return
    dashboardViewTracked.current = true
    window.__weatherDashboardViewTracked = true
    trackEvent(createWeatherDashboardViewedEvent({
      dataSourceMode: initialPayload.sourceMode,
    }))
  }, [initialPayload, trackEvent])

  useEffect(() => {
    const element = methodologyRef.current
    if (!element) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || methodologyTracked.current) return
      methodologyTracked.current = true
      trackEvent(createWeatherDashboardInteractedEvent("methodology_viewed", { selected_region: region, minimum_rating: minimumRating, year_from: yearFrom, year_to: yearTo }))
      observer.disconnect()
    }, { threshold: 0, rootMargin: "0px 0px -20% 0px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [minimumRating, region, yearFrom, yearTo, trackEvent])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ region, rating: minimumRating })
    if (yearFrom === yearTo) params.set("year", String(yearFrom))
    else {
      params.set("yearFrom", String(Math.min(yearFrom, yearTo)))
      params.set("yearTo", String(Math.max(yearFrom, yearTo)))
    }
    if (month) params.set("month", month)
    setIsLoading(true)
    fetch(`/api/weather/events?${params}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load events")))
      .then((data: WeatherEventsResponse) => {
        setEvents(data.events)
        setSelectedEvent(data.events[0] ?? null)
        setTotalMatched(data.totalMatched)
        setTruncated(data.truncated)
      })
      .catch((error: unknown) => { if ((error as Error).name !== "AbortError") { setEvents([]); setTotalMatched(0); setTruncated(false) } })
      .finally(() => setIsLoading(false))
    return () => controller.abort()
  }, [region, minimumRating, yearFrom, yearTo, month])

  const eventCountLabel = useMemo(() => {
    if (isLoading) return "Loading records"
    if (truncated) return `Showing ${events.length} of ${totalMatched} records`
    return `${events.length} record${events.length === 1 ? "" : "s"}`
  }, [events.length, isLoading, totalMatched, truncated])

  const inspectEvent = (event: WeatherEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
    trackEvent(createWeatherDashboardInteractedEvent("event_inspected", {
      selected_region: region,
      minimum_rating: minimumRating,
      year_from: yearFrom,
      year_to: yearTo,
      event_rating: event.ratingCode ?? undefined,
      event_state: event.state,
    }))
  }

  return (
    <main className="min-h-screen">
      <div className="circuit-grid pointer-events-none absolute inset-x-0 top-0 h-[460px] opacity-60" aria-hidden="true" />
      <div className="container relative px-4 py-8 md:px-6 md:py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link>
        <header className="mt-10 max-w-3xl">
          <p className="section-kicker">dbt + NOAA data pipeline</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">South Alabama Tornado Watch</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">A working analytics-engineering portfolio build: public weather sources, dbt models, reproducible tests, and an event explorer that keeps confirmed records separate from preliminary reports.</p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1.5 font-mono">{sourceLabel}</span>
          <span>Last successful refresh: {formatDateTime(initialPayload.generatedAt)}</span>
        </div>
        {initialPayload.sourceMode === "fixture" && <p className="mt-4 rounded-md border border-chart-3/25 bg-chart-3/10 p-3 text-sm text-muted-foreground">This is a local schema preview, not current weather history. Set <code className="font-mono text-foreground">WEATHER_DATA_URL</code> after publishing the companion dbt artifact to display the automatically refreshed current data.</p>}

        <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Why this project and implementation">
          <article className="engine-panel rounded-lg p-5">
            <p className="section-kicker">Why weather</p>
            <h2 className="mt-2 text-xl font-semibold">A local interest with a real data-modeling problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">I live in Dothan, Alabama, where severe weather awareness is a practical part of the year. Tornadoes are the weather events I follow most closely. They also make an unusually useful analytics-engineering case study because an operational warning and a confirmed tornado are related, but they are not the same fact.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The project keeps those source semantics explicit: confirmed NOAA event records and preliminary Local Storm Reports are separate facts, not labels added after the analysis is finished.</p>
          </article>
          <article className="engine-panel rounded-lg p-5">
            <p className="section-kicker">Technical implementation</p>
            <h2 className="mt-2 text-xl font-semibold">A public, inspectable data product</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><span className="font-mono text-primary">01</span> Python ingests NCEI Storm Events records and preliminary IEM Local Storm Reports into a DuckDB raw schema.</li>
              <li><span className="font-mono text-primary">02</span> dbt builds typed source models, geography and intensity dimensions, and confirmed-event, preliminary-report, and current-event facts.</li>
              <li><span className="font-mono text-primary">03</span> A scheduled artifact exports versioned event data, project metadata, and dbt docs. This page reads them through a cached same-origin API, not from the browser.</li>
            </ol>
          </article>
        </section>

        <DbtProjectExplorer
          explorer={initialProjectExplorer}
          onInteraction={(interactionType, properties) => trackEvent(createWeatherDashboardInteractedEvent(interactionType, {
            selected_region: region,
            minimum_rating: minimumRating,
            ...properties,
          }))}
        />

        <section className="mt-10 grid gap-5 lg:grid-cols-3" aria-label="Data modeling methodology">
          <article className="rounded-lg border border-border/70 bg-muted/20 p-5">
            <h2 className="font-semibold">Model grain</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><span className="font-mono text-foreground">fct_tornado_events</span> is one confirmed historical event. <span className="font-mono text-foreground">fct_tornado_events_current</span> appends preliminary point reports after the NCEI cutoff without presenting them as confirmed events.</p>
          </article>
          <article className="rounded-lg border border-border/70 bg-muted/20 p-5">
            <h2 className="font-semibold">Rich event context</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The explorer preserves the original F or EF rating, rating-based wind estimate, endpoint coordinates, path length and width, reported impacts, and source narrative where the source provides them.</p>
          </article>
          <article className="rounded-lg border border-border/70 bg-muted/20 p-5">
            <h2 className="font-semibold">Data quality</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">dbt validates keys, rating values, dimensions, record status, and non-negative impact measures before an artifact can publish.</p>
          </article>
        </section>

        <section className="mt-10 border-t border-border/70 pt-10" aria-labelledby="event-explorer-title">
          <p className="section-kicker">Event-level mart</p>
          <h2 id="event-explorer-title" className="mt-2 text-3xl font-bold tracking-tight">Tornado Event Explorer</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Select a source-backed confirmed event or preliminary point report to inspect rating details where available, reported impacts, narrative, and coordinate context.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">From year<select value={yearFrom} onChange={(event) => { const nextYear = Number(event.target.value); setYearFrom(nextYear); trackEvent(createWeatherDashboardInteractedEvent("year_filter_changed", { selected_region: region, minimum_rating: minimumRating, year_from: nextYear, year_to: yearTo })) }} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground">{availableYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Through year<select value={yearTo} onChange={(event) => { const nextYear = Number(event.target.value); setYearTo(nextYear); trackEvent(createWeatherDashboardInteractedEvent("year_filter_changed", { selected_region: region, minimum_rating: minimumRating, year_from: yearFrom, year_to: nextYear })) }} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground">{availableYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Month<select value={month} onChange={(event) => { const nextMonth = event.target.value; setMonth(nextMonth); trackEvent(createWeatherDashboardInteractedEvent("month_filter_changed", { selected_region: region, minimum_rating: minimumRating, selected_month: nextMonth || "any" })) }} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground"><option value="">Any month</option>{monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Analysis region<select value={region} onChange={(event) => { const nextRegion = event.target.value as WeatherRegion; setRegion(nextRegion); trackEvent(createWeatherDashboardInteractedEvent("region_filter_changed", { selected_region: nextRegion, minimum_rating: minimumRating })) }} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground"><option value="alabama">Alabama</option><option value="dixie">Dixie cohort</option><option value="tornado">Tornado cohort</option></select></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Minimum rating<select value={minimumRating} onChange={(event) => { const nextRating = event.target.value; setMinimumRating(nextRating); trackEvent(createWeatherDashboardInteractedEvent("minimum_rating_changed", { selected_region: region, minimum_rating: nextRating })) }} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground"><option value="0">Any rating</option><option value="1">F1/EF1+</option><option value="2">F2/EF2+</option><option value="3">F3/EF3+</option></select></label>
            <p className="self-end pb-2 font-mono text-xs text-muted-foreground">{eventCountLabel}</p>
          </div>
          <div className="mt-6 max-h-[min(68vh,42rem)] overflow-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[680px] text-left text-sm"><thead className="sticky top-0 z-10 bg-muted/95 text-xs text-muted-foreground backdrop-blur"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Rating / wind estimate</th><th className="px-4 py-3 font-medium">Path</th><th className="px-4 py-3 font-medium">Impact</th><th className="px-4 py-3"><span className="sr-only">Open detail</span></th></tr></thead><tbody>{events.map((event) => <tr key={event.eventId} className="border-t border-border/60 hover:bg-primary/5"><td className="px-4 py-3 text-muted-foreground">{formatDate(event.occurredAt)}<span className="block text-xs">{eventStatusLabel(event)}</span></td><td className="px-4 py-3"><span className="font-medium">{event.county}, {event.state}</span><span className="block text-xs text-muted-foreground">{event.beginLocation ?? "Location not reported"}</span></td><td className="px-4 py-3"><span className="font-mono text-primary">{formatRatingCode(event)}</span><span className="block text-xs text-muted-foreground">{event.windEstimateLowMph && event.windEstimateHighMph ? `${event.windEstimateLowMph} to ${event.windEstimateHighMph} mph estimated` : "Not rated"}</span></td><td className="px-4 py-3 text-muted-foreground">{event.pathLengthMiles === null ? "Length not reported" : `${event.pathLengthMiles} mi`} · {event.pathWidthYards === null ? "Width not reported" : `${event.pathWidthYards} yd`}</td><td className="px-4 py-3 text-muted-foreground">{formatImpactCount(event.injuries)} injured · {formatImpactCount(event.fatalities)} fatalities</td><td className="px-4 py-3"><button type="button" onClick={() => inspectEvent(event)} className="rounded-md border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Inspect</button></td></tr>)}{!isLoading && events.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No records match this filter.</td></tr>}</tbody></table>
          </div>
        </section>

        <EventDetailSheet
          event={selectedEvent}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onSourceOpen={() => selectedEvent && trackEvent(createWeatherDashboardInteractedEvent("source_record_opened", { selected_region: region, minimum_rating: minimumRating, event_rating: selectedEvent.ratingCode ?? undefined, event_state: selectedEvent.state, source_type: selectedEvent.sourceSystem }))}
        />

        <section ref={methodologyRef} className="mt-10 rounded-lg border border-border/70 bg-muted/25 p-5 text-sm text-muted-foreground">
          <h2 className="font-semibold text-foreground">Methodology and safety note</h2>
          <p className="mt-2 leading-relaxed">NOAA Storm Events records are confirmed events. Iowa State Mesonet Local Storm Reports are preliminary point reports after the latest NCEI cutoff. “Dixie Alley” and “Tornado Alley” are project-defined state cohorts for comparison, not official boundaries. F and EF wind ranges are damage-based estimates, not instrument measurements. Endpoint connections are not surveyed tracks. This is a portfolio data demonstration, not a life-safety product.</p>
        </section>
      </div>
    </main>
  )
}

declare global {
  interface Window {
    __weatherDashboardViewTracked?: boolean
  }
}
