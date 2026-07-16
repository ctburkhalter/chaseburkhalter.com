import { describe, expect, it } from "vitest"
import {
  createContactClickedEvent,
  createEventExplorerInteractionEvent,
  createExternalLinkClickedEvent,
  createProjectExplorerInteractionEvent,
  createResumeDownloadedEvent,
  createSectionClickedEvent,
  createSectionViewedEvent,
  createWeatherPageViewedEvent,
} from "./analytics-events"

describe("createSectionViewedEvent", () => {
  it("returns section_viewed with the given section id and name", () => {
    const event = createSectionViewedEvent("projects", "Projects")
    expect(event.name).toBe("section_viewed")
    expect(event.properties).toMatchObject({
      section_id: "projects",
      section_name: "Projects",
      interaction_type: "scroll",
    })
    // window is undefined under the vitest "node" environment, so the url
    // fallback branch is what's under test here, not a real browser URL.
    expect(event.properties?.url).toBe("")
  })
})

describe("createSectionClickedEvent", () => {
  it("defaults click_source to navigation", () => {
    const event = createSectionClickedEvent("contact", "Contact")
    expect(event.name).toBe("section_clicked")
    expect(event.properties).toMatchObject({
      section_id: "contact",
      section_name: "Contact",
      click_source: "navigation",
    })
  })

  it("accepts a custom click_source", () => {
    const event = createSectionClickedEvent("contact", "Contact", "footer")
    expect(event.properties?.click_source).toBe("footer")
  })
})

describe("createResumeDownloadedEvent", () => {
  it("returns resume_downloaded with the download source and pinned file name", () => {
    const event = createResumeDownloadedEvent("hero")
    expect(event.name).toBe("resume_downloaded")
    expect(event.properties).toMatchObject({
      download_source: "hero",
      file_name: "Chase_Burkhalter_Resume_2026-07.pdf",
    })
  })
})

describe("createExternalLinkClickedEvent", () => {
  it("returns external_link_clicked with link type, destination, and location", () => {
    const event = createExternalLinkClickedEvent("github", "https://github.com/ctburkhalter", "footer")
    expect(event.name).toBe("external_link_clicked")
    expect(event.properties).toMatchObject({
      link_type: "github",
      destination: "https://github.com/ctburkhalter",
      link_location: "footer",
    })
  })
})

describe("createContactClickedEvent", () => {
  it("returns contact_clicked with contact method and location", () => {
    const event = createContactClickedEvent("email", "contact")
    expect(event.name).toBe("contact_clicked")
    expect(event.properties).toMatchObject({
      contact_method: "email",
      link_location: "contact",
    })
  })
})

describe("createWeatherPageViewedEvent", () => {
  it("returns weather_page_viewed with the data source mode", () => {
    const event = createWeatherPageViewedEvent({ dataSourceMode: "fixture" })
    expect(event.name).toBe("weather_page_viewed")
    expect(event.properties).toEqual({ data_source_mode: "fixture" })
  })

  it("passes through pipeline mode unchanged", () => {
    const event = createWeatherPageViewedEvent({ dataSourceMode: "pipeline" })
    expect(event.properties).toEqual({ data_source_mode: "pipeline" })
  })
})

describe("createEventExplorerInteractionEvent", () => {
  it("returns event_explorer_interaction with just the interaction type by default", () => {
    const event = createEventExplorerInteractionEvent("region_filter_changed")
    expect(event.name).toBe("event_explorer_interaction")
    expect(event.properties).toEqual({ interaction_type: "region_filter_changed" })
  })

  it("merges through additional properties", () => {
    const event = createEventExplorerInteractionEvent("event_inspected", {
      selected_region: "alabama",
      event_rating: "EF3",
      event_state: "AL",
    })
    expect(event.properties).toEqual({
      interaction_type: "event_inspected",
      selected_region: "alabama",
      event_rating: "EF3",
      event_state: "AL",
    })
  })
})

describe("createProjectExplorerInteractionEvent", () => {
  it("returns project_explorer_interaction with just the interaction type by default", () => {
    const event = createProjectExplorerInteractionEvent("pipeline_explorer_viewed")
    expect(event.name).toBe("project_explorer_interaction")
    expect(event.properties).toEqual({ interaction_type: "pipeline_explorer_viewed" })
  })

  it("merges through additional properties, with no event-explorer filter state", () => {
    const event = createProjectExplorerInteractionEvent("pipeline_file_inspected", {
      pipeline_file_category: "marts",
    })
    expect(event.properties).toEqual({
      interaction_type: "pipeline_file_inspected",
      pipeline_file_category: "marts",
    })
  })
})
