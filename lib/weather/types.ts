export const WEATHER_REGIONS = ["alabama", "dixie", "tornado"] as const

export type WeatherRegion = (typeof WEATHER_REGIONS)[number]
export type WeatherSourceMode = "pipeline" | "fixture"
export type WeatherEventStatus = "confirmed" | "preliminary"
export type WeatherEventSourceSystem = "ncei_storm_events" | "iem_lsr"

export interface WeatherEvent {
  eventKey: string
  eventId: string
  regionIds: WeatherRegion[]
  occurredAt: string
  state: string
  county: string
  beginLocation: string | null
  endLocation: string | null
  ratingCode: string | null
  scaleSystem: "F" | "EF" | "Unknown" | null
  ratingValue: number | null
  windEstimateLowMph: number | null
  windEstimateHighMph: number | null
  windEstimateNote: string
  pathLengthMiles: number | null
  pathWidthYards: number | null
  beginLatitude: number | null
  beginLongitude: number | null
  endLatitude: number | null
  endLongitude: number | null
  injuries: number | null
  fatalities: number | null
  propertyDamageUsd: number | null
  cropDamageUsd: number | null
  narrative: string | null
  sourceUrl: string
  sourceAttribution?: string | null
  wfo?: string | null
  recordStatus: WeatherEventStatus
  sourceSystem: WeatherEventSourceSystem
  isSurveyedTrack: boolean
}

export interface EventYearCount {
  year: number
  count: number
}

export interface WeatherDashboardPayload {
  schemaVersion: "2.0"
  sourceMode: WeatherSourceMode
  generatedAt: string
  sourceCoverage: string
  eventCoverage: {
    confirmedThrough: string | null
    preliminaryFrom: string | null
    preliminaryThrough: string | null
    preliminaryCount: number
  }
  eventYearIndex: EventYearCount[]
}

export interface WeatherEventYearShard {
  schemaVersion: "2.0"
  year: number
  events: WeatherEvent[]
}

export interface DbtProjectExplorerFile {
  path: string
  category: string
  language: string
  content: string
  githubUrl: string
  relatedNodeIds: string[]
}

export interface DbtProjectExplorerNode {
  id: string
  name: string
  resourceType: "model" | "source" | "seed" | "exposure"
  layer: string
  path: string
  description: string
  relation: string | null
  columns: Array<{ name: string; description: string; dataType: string | null }>
  upstream: string[]
  downstream: string[]
  tests: Array<{ name: string; status: string }>
  buildStatus: string | null
  materialization: string | null
  contractEnforced: boolean
  owner: string | { name?: string } | null
  maturity: string | null
  meta: Record<string, unknown>
}

export interface DbtProjectExplorerPayload {
  schemaVersion: "2.0"
  generatedAt: string
  project: {
    name: string
    dbtVersion: string
    commitSha: string
    repositoryUrl: string
    docsPath: string
    docsUrl?: string
  }
  summary: {
    modelCount: number
    sourceCount: number
    seedCount: number
    exposureCount: number
    contractedModelCount: number
    documentedColumnCount: number
    columnCount: number
    testCount: number
    passingTestCount: number
    successfulModelCount: number
  }
  files: DbtProjectExplorerFile[]
  nodes: DbtProjectExplorerNode[]
}

export interface WeatherEventsResponse {
  events: WeatherEvent[]
  count: number
  totalMatched: number
  truncated: boolean
  sourceMode: WeatherSourceMode
}
