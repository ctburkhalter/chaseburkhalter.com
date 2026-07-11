import { weatherFixture, weatherFixtureEventsByYear } from "@/lib/weather/fixture"
import { WEATHER_REGIONS } from "@/lib/weather/types"
import type {
  DbtProjectExplorerPayload,
  EventYearCount,
  WeatherDashboardPayload,
  WeatherEvent,
  WeatherEventYearShard,
  WeatherRegion,
  WeatherSourceMode,
} from "@/lib/weather/types"

const refreshSeconds = 900
const maxEventResults = 100
const isNullableString = (value: unknown): value is string | null => value === null || typeof value === "string"
const isOptionalNullableString = (value: unknown): value is string | null | undefined => value === undefined || isNullableString(value)
const isNullableNumber = (value: unknown): value is number | null => value === null || (typeof value === "number" && Number.isFinite(value))
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string")

// Checks every field the weather page actually dereferences from the
// initial payload (components/weather/weather-dashboard.tsx: generatedAt
// feeds formatDateTime(), each eventYearIndex entry's year feeds the
// From/Through year selects) so a malformed or partially-written artifact
// fails this guard and falls back to the fixture, instead of passing
// validation and throwing during render (Intl.DateTimeFormat throws on an
// Invalid Date, which is what `new Date(undefined)` produces).
export function isWeatherPayload(value: unknown): value is WeatherDashboardPayload {
  if (!value || typeof value !== "object") return false
  const payload = value as Partial<WeatherDashboardPayload>
  return (
    payload.schemaVersion === "2.0" &&
    payload.sourceMode === "pipeline" &&
    typeof payload.generatedAt === "string" &&
    !Number.isNaN(Date.parse(payload.generatedAt)) &&
    typeof payload.sourceCoverage === "string" &&
    Array.isArray(payload.eventYearIndex) &&
    payload.eventYearIndex.every((entry) => isFiniteNumber((entry as Partial<EventYearCount> | null)?.year) && isFiniteNumber((entry as Partial<EventYearCount>).count)) &&
    !!payload.eventCoverage &&
    isNullableString(payload.eventCoverage.confirmedThrough) &&
    isNullableString(payload.eventCoverage.preliminaryFrom) &&
    isNullableString(payload.eventCoverage.preliminaryThrough) &&
    typeof payload.eventCoverage.preliminaryCount === "number"
  )
}

export async function getWeatherDashboard(): Promise<WeatherDashboardPayload> {
  const sourceUrl = process.env.WEATHER_DATA_URL
  if (!sourceUrl) return weatherFixture

  try {
    const response = await fetch(sourceUrl, { next: { revalidate: refreshSeconds } })
    if (!response.ok) throw new Error(`Weather artifact returned ${response.status}`)
    const payload: unknown = await response.json()
    if (!isWeatherPayload(payload)) throw new Error("Weather artifact does not match schema version 2.0")
    return { ...payload, sourceMode: "pipeline" }
  } catch (error) {
    console.error("[Weather] Failed to load dashboard artifact from WEATHER_DATA_URL, falling back to fixture", error)
    return weatherFixture
  }
}

function deriveEventYearShardUrl(dashboardUrl: string, year: number): string {
  return new URL(`events/${year}.json`, dashboardUrl).toString()
}

function deriveProjectExplorerUrl(dashboardUrl: string): string {
  return new URL("dbt-project.json", dashboardUrl).toString()
}

function deriveDocsUrl(dashboardUrl: string, docsPath: string): string {
  return new URL(`../../${docsPath}`, dashboardUrl).toString()
}

export function isProjectExplorerPayload(value: unknown): value is DbtProjectExplorerPayload {
  if (!value || typeof value !== "object") return false
  const payload = value as Partial<DbtProjectExplorerPayload>
  const project = payload.project
  const summary = payload.summary
  return (
    payload.schemaVersion === "2.0" &&
    typeof payload.generatedAt === "string" &&
    !Number.isNaN(Date.parse(payload.generatedAt)) &&
    !!project &&
    typeof project.name === "string" &&
    typeof project.dbtVersion === "string" &&
    typeof project.commitSha === "string" &&
    typeof project.repositoryUrl === "string" &&
    typeof project.docsPath === "string" &&
    !!summary &&
    isFiniteNumber(summary.modelCount) &&
    isFiniteNumber(summary.sourceCount) &&
    isFiniteNumber(summary.seedCount) &&
    isFiniteNumber(summary.exposureCount) &&
    isFiniteNumber(summary.contractedModelCount) &&
    isFiniteNumber(summary.documentedColumnCount) &&
    isFiniteNumber(summary.columnCount) &&
    isFiniteNumber(summary.testCount) &&
    isFiniteNumber(summary.passingTestCount) &&
    isFiniteNumber(summary.successfulModelCount) &&
    Array.isArray(payload.files) &&
    payload.files.every((file) => !!file && typeof file.path === "string" && typeof file.category === "string" && typeof file.language === "string" && typeof file.content === "string" && typeof file.githubUrl === "string" && isStringArray(file.relatedNodeIds)) &&
    Array.isArray(payload.nodes) &&
    payload.nodes.every((node) => !!node &&
      typeof node.id === "string" &&
      typeof node.name === "string" &&
      (node.resourceType === "model" || node.resourceType === "source" || node.resourceType === "seed" || node.resourceType === "exposure") &&
      typeof node.layer === "string" &&
      typeof node.path === "string" &&
      typeof node.description === "string" &&
      isNullableString(node.relation) &&
      Array.isArray(node.columns) && node.columns.every((column) => !!column && typeof column.name === "string" && typeof column.description === "string" && isNullableString(column.dataType)) &&
      isStringArray(node.upstream) &&
      isStringArray(node.downstream) &&
      Array.isArray(node.tests) && node.tests.every((test) => !!test && typeof test.name === "string" && typeof test.status === "string") &&
      isNullableString(node.buildStatus) &&
      isNullableString(node.materialization) &&
      typeof node.contractEnforced === "boolean" &&
      (node.owner === null || typeof node.owner === "string" || (typeof node.owner === "object" && !Array.isArray(node.owner) && (node.owner.name === undefined || typeof node.owner.name === "string"))) &&
      isNullableString(node.maturity) &&
      !!node.meta && typeof node.meta === "object" && !Array.isArray(node.meta))
  )
}

export async function getWeatherProjectExplorer(): Promise<DbtProjectExplorerPayload | null> {
  const dashboardUrl = process.env.WEATHER_DATA_URL
  if (!dashboardUrl) return null

  try {
    const response = await fetch(deriveProjectExplorerUrl(dashboardUrl), { next: { revalidate: refreshSeconds } })
    if (!response.ok) throw new Error(`dbt project artifact returned ${response.status}`)
    const payload: unknown = await response.json()
    if (!isProjectExplorerPayload(payload)) throw new Error("dbt project artifact does not match schema version 2.0")
    return { ...payload, project: { ...payload.project, docsUrl: deriveDocsUrl(dashboardUrl, payload.project.docsPath) } }
  } catch (error) {
    console.error("[Weather] Failed to load dbt project explorer artifact from WEATHER_DATA_URL, falling back to null", error)
    return null
  }
}

export function isEventYearShard(value: unknown): value is WeatherEventYearShard {
  if (!value || typeof value !== "object") return false
  const shard = value as Partial<WeatherEventYearShard>
  if (shard.schemaVersion !== "2.0" || typeof shard.year !== "number" || !Array.isArray(shard.events)) return false
  const keys = new Set<string>()
  return shard.events.every((candidate) => {
    const event = candidate as Partial<WeatherEvent>
    const valid = typeof event.eventKey === "string" && event.eventKey.length > 0 &&
      typeof event.eventId === "string" && typeof event.occurredAt === "string" && !Number.isNaN(Date.parse(event.occurredAt)) &&
      typeof event.state === "string" && isNullableString(event.county) && Array.isArray(event.regionIds) && event.regionIds.every((region) => WEATHER_REGIONS.includes(region)) &&
      isNullableString(event.beginLocation) && isNullableString(event.endLocation) && isNullableString(event.ratingCode) &&
      (event.scaleSystem === "F" || event.scaleSystem === "EF" || event.scaleSystem === "Unknown" || event.scaleSystem === null) &&
      isNullableNumber(event.ratingValue) && isNullableNumber(event.windEstimateLowMph) && isNullableNumber(event.windEstimateHighMph) &&
      typeof event.windEstimateNote === "string" && isNullableNumber(event.pathLengthMiles) && isNullableNumber(event.pathWidthYards) &&
      isNullableNumber(event.beginLatitude) && isNullableNumber(event.beginLongitude) && isNullableNumber(event.endLatitude) && isNullableNumber(event.endLongitude) &&
      isNullableNumber(event.injuries) && isNullableNumber(event.fatalities) && isNullableNumber(event.propertyDamageUsd) && isNullableNumber(event.cropDamageUsd) &&
      isNullableString(event.narrative) && typeof event.sourceUrl === "string" && isOptionalNullableString(event.sourceAttribution) && isOptionalNullableString(event.wfo) &&
      ((event.recordStatus === "confirmed" && event.sourceSystem === "ncei_storm_events") || (event.recordStatus === "preliminary" && event.sourceSystem === "iem_lsr")) &&
      event.isSurveyedTrack === false && !keys.has(event.eventKey)
    if (valid) keys.add(event.eventKey as string)
    return valid
  })
}

async function fetchEventYear(year: number): Promise<{ events: WeatherEvent[]; sourceMode: WeatherSourceMode }> {
  const dashboardUrl = process.env.WEATHER_DATA_URL
  if (!dashboardUrl) return { events: weatherFixtureEventsByYear[year] ?? [], sourceMode: "fixture" }

  try {
    const response = await fetch(deriveEventYearShardUrl(dashboardUrl, year), { next: { revalidate: refreshSeconds } })
    if (!response.ok) throw new Error(`Event year artifact returned ${response.status}`)
    const payload: unknown = await response.json()
    if (!isEventYearShard(payload)) throw new Error("Event year artifact does not match schema version 2.0")
    return { events: payload.events, sourceMode: "pipeline" }
  } catch (error) {
    console.error(`[Weather] Failed to load event year ${year} artifact from WEATHER_DATA_URL, falling back to fixture`, error)
    return { events: weatherFixtureEventsByYear[year] ?? [], sourceMode: "fixture" }
  }
}

export async function getWeatherEventsForYears(years: number[]): Promise<{ events: WeatherEvent[]; sourceMode: WeatherSourceMode }> {
  const results = await Promise.all(years.map(fetchEventYear))
  if (results.every((result) => result.sourceMode === "pipeline")) {
    return { events: results.flatMap((result) => result.events), sourceMode: "pipeline" }
  }

  // Do not mix a successful published shard with local fixture rows. The
  // response has a single sourceMode, so mixed rows would make its
  // provenance label inaccurate. If any requested shard is unavailable,
  // return the complete requested range from the fixture instead.
  return {
    events: years.flatMap((year) => weatherFixtureEventsByYear[year] ?? []),
    sourceMode: "fixture",
  }
}

// Matches the timezone the dashboard displays event dates in
// (components/weather/weather-dashboard.tsx's formatDate/formatDateTime use
// timeZone: "America/Chicago"). Deriving the filter month via
// `new Date(occurredAt).getMonth()` instead resolves in the server's
// timezone (UTC on Vercel), so an event at 2023-03-31T23:30:00-05:00 would
// display as "Mar 31" but filter as April; Intl.DateTimeFormat keeps the
// two in agreement regardless of server timezone.
const WEATHER_DISPLAY_TIME_ZONE = "America/Chicago"

function localMonth(occurredAt: string): number {
  return Number.parseInt(
    new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: WEATHER_DISPLAY_TIME_ZONE }).format(new Date(occurredAt)),
    10,
  )
}

export function filterWeatherEvents(
  events: WeatherEvent[],
  { region, month, rating }: { region?: string | null; month?: string | null; rating?: string | null },
): { events: WeatherEvent[]; totalMatched: number } {
  const selectedRegion = region as WeatherRegion | undefined
  const selectedMonth = month ? Number.parseInt(month, 10) : undefined
  // `rating` absent/null/empty means "no rating filter" (matches the
  // dashboard's "Any rating" option, which now omits the param entirely
  // rather than sending "0"). An explicitly passed rating of "0" is a
  // deliberate filter value: "must have a reported rating of F0/EF0 or
  // higher," which excludes unrated events (ratingValue null). Coercing
  // "no param" and "param=0" together was accidental, not deliberate; this
  // keeps the two cases distinct regardless of what a caller sends.
  const minimumRating = rating !== undefined && rating !== null && rating !== "" ? Number.parseInt(rating, 10) : undefined

  const matched = events
    .filter((event) => !selectedRegion || event.regionIds.includes(selectedRegion))
    .filter((event) => !selectedMonth || localMonth(event.occurredAt) === selectedMonth)
    .filter((event) => minimumRating === undefined || (event.ratingValue ?? -1) >= minimumRating)
    .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))

  return { events: matched.slice(0, maxEventResults), totalMatched: matched.length }
}
