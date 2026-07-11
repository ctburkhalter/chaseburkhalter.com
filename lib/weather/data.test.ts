import { describe, expect, it } from "vitest"
import { filterWeatherEvents, isEventYearShard, isProjectExplorerPayload, isWeatherPayload } from "./data"
import type { WeatherEvent } from "./types"

function buildEvent(overrides: Partial<WeatherEvent> = {}): WeatherEvent {
  return {
    eventId: "test-event",
    regionIds: ["alabama"],
    occurredAt: "2023-01-15T12:00:00-06:00",
    state: "AL",
    county: "Houston",
    beginLocation: null,
    endLocation: null,
    ratingCode: "EF1",
    scaleSystem: "EF",
    ratingValue: 1,
    windEstimateLowMph: 86,
    windEstimateHighMph: 110,
    windEstimateNote: "Test estimate",
    pathLengthMiles: null,
    pathWidthYards: null,
    beginLatitude: null,
    beginLongitude: null,
    endLatitude: null,
    endLongitude: null,
    injuries: null,
    fatalities: null,
    propertyDamageUsd: null,
    cropDamageUsd: null,
    narrative: null,
    sourceUrl: "https://example.com",
    recordStatus: "confirmed",
    sourceSystem: "ncei_storm_events",
    isSurveyedTrack: false,
    ...overrides,
  }
}

describe("filterWeatherEvents", () => {
  it("filters by region", () => {
    const events = [
      buildEvent({ eventId: "a", regionIds: ["alabama"] }),
      buildEvent({ eventId: "b", regionIds: ["dixie"] }),
    ]
    const { events: result } = filterWeatherEvents(events, { region: "dixie" })
    expect(result.map((e) => e.eventId)).toEqual(["b"])
  })

  it("does not filter by region when region is omitted", () => {
    const events = [
      buildEvent({ eventId: "a", regionIds: ["alabama"] }),
      buildEvent({ eventId: "b", regionIds: ["dixie"] }),
    ]
    const { events: result } = filterWeatherEvents(events, {})
    expect(result).toHaveLength(2)
  })

  it("filters by month, extracted from occurredAt", () => {
    const events = [
      buildEvent({ eventId: "jan", occurredAt: "2023-01-15T12:00:00-06:00" }),
      buildEvent({ eventId: "mar", occurredAt: "2023-03-15T12:00:00-06:00" }),
    ]
    const { events: result } = filterWeatherEvents(events, { month: "3" })
    expect(result.map((e) => e.eventId)).toEqual(["mar"])
  })

  describe("rating filter", () => {
    const rated = buildEvent({ eventId: "rated-ef2", ratingValue: 2 })
    const unrated = buildEvent({ eventId: "unrated", ratingValue: null, ratingCode: null })

    it("omitted rating (undefined) applies no filter, includes unrated events", () => {
      const { events: result } = filterWeatherEvents([rated, unrated], {})
      expect(result.map((e) => e.eventId).sort()).toEqual(["rated-ef2", "unrated"])
    })

    it("null rating applies no filter, includes unrated events", () => {
      const { events: result } = filterWeatherEvents([rated, unrated], { rating: null })
      expect(result.map((e) => e.eventId).sort()).toEqual(["rated-ef2", "unrated"])
    })

    it("empty-string rating applies no filter, includes unrated events", () => {
      const { events: result } = filterWeatherEvents([rated, unrated], { rating: "" })
      expect(result.map((e) => e.eventId).sort()).toEqual(["rated-ef2", "unrated"])
    })

    it("explicit rating=0 is a deliberate filter: excludes unrated events", () => {
      // This is the edge case that used to be accidental: rating "0" (the
      // dashboard's old literal "Any rating" value) must not be treated the
      // same as "no rating param at all" now that the two are semantically
      // different (see lib/weather/data.ts filterWeatherEvents comment).
      const { events: result } = filterWeatherEvents([rated, unrated], { rating: "0" })
      expect(result.map((e) => e.eventId)).toEqual(["rated-ef2"])
    })

    it("rating=2 excludes events below the threshold and unrated events", () => {
      const below = buildEvent({ eventId: "ef1", ratingValue: 1 })
      const { events: result } = filterWeatherEvents([rated, below, unrated], { rating: "2" })
      expect(result.map((e) => e.eventId)).toEqual(["rated-ef2"])
    })
  })

  it("caps results at 100 and reports totalMatched separately", () => {
    const events = Array.from({ length: 150 }, (_, i) =>
      buildEvent({ eventId: `evt-${i}`, occurredAt: new Date(2020, 0, i + 1).toISOString() }),
    )
    const { events: result, totalMatched } = filterWeatherEvents(events, {})
    expect(result).toHaveLength(100)
    expect(totalMatched).toBe(150)
  })

  it("sorts matched events by occurredAt descending", () => {
    const events = [
      buildEvent({ eventId: "earliest", occurredAt: "2020-01-01T00:00:00-06:00" }),
      buildEvent({ eventId: "latest", occurredAt: "2023-06-01T00:00:00-06:00" }),
      buildEvent({ eventId: "middle", occurredAt: "2021-03-01T00:00:00-06:00" }),
    ]
    const { events: result } = filterWeatherEvents(events, {})
    expect(result.map((e) => e.eventId)).toEqual(["latest", "middle", "earliest"])
  })
})

describe("isWeatherPayload", () => {
  const validBase = {
    schemaVersion: "1.0" as const,
    eventYearIndex: [] as unknown[],
    eventCoverage: { preliminaryCount: 0 },
  }

  it("accepts a minimally valid payload", () => {
    expect(isWeatherPayload(validBase)).toBe(true)
  })

  it("rejects null, undefined, and non-objects", () => {
    expect(isWeatherPayload(null)).toBe(false)
    expect(isWeatherPayload(undefined)).toBe(false)
    expect(isWeatherPayload("a string")).toBe(false)
  })

  it("rejects the wrong schema version", () => {
    expect(isWeatherPayload({ ...validBase, schemaVersion: "2.0" })).toBe(false)
  })

  it("rejects a non-array eventYearIndex", () => {
    expect(isWeatherPayload({ ...validBase, eventYearIndex: "not-an-array" })).toBe(false)
  })

  it("rejects a missing eventCoverage", () => {
    const { schemaVersion, eventYearIndex } = validBase
    expect(isWeatherPayload({ schemaVersion, eventYearIndex })).toBe(false)
  })

  it("rejects a non-numeric preliminaryCount", () => {
    expect(isWeatherPayload({ ...validBase, eventCoverage: { preliminaryCount: "0" } })).toBe(false)
  })
})

describe("isProjectExplorerPayload", () => {
  const valid = {
    schemaVersion: "1.0" as const,
    project: {
      repositoryUrl: "https://github.com/ctburkhalter/dbt-portfolio-weather",
      docsPath: "dbt-docs/index.html",
    },
    summary: { modelCount: 9 },
    files: [] as unknown[],
    nodes: [] as unknown[],
  }

  it("accepts a minimally valid payload", () => {
    expect(isProjectExplorerPayload(valid)).toBe(true)
  })

  it("rejects a payload missing files", () => {
    const { schemaVersion, project, summary, nodes } = valid
    expect(isProjectExplorerPayload({ schemaVersion, project, summary, nodes })).toBe(false)
  })

  it("rejects a payload with a non-string docsPath", () => {
    expect(
      isProjectExplorerPayload({ ...valid, project: { ...valid.project, docsPath: 12 } }),
    ).toBe(false)
  })

  it("rejects null", () => {
    expect(isProjectExplorerPayload(null)).toBe(false)
  })
})

describe("isEventYearShard", () => {
  it("accepts a minimally valid shard", () => {
    expect(isEventYearShard({ schemaVersion: "1.0", events: [] })).toBe(true)
  })

  it("rejects a shard with a non-array events field", () => {
    expect(isEventYearShard({ schemaVersion: "1.0", events: "nope" })).toBe(false)
  })

  it("rejects a shard with the wrong schema version", () => {
    expect(isEventYearShard({ schemaVersion: "2.0", events: [] })).toBe(false)
  })

  it("rejects null", () => {
    expect(isEventYearShard(null)).toBe(false)
  })
})
