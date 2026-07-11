"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { TrackedLink } from "@/components/tracked-link"
import { IDENTITY } from "@/lib/content"
import { hasPrivacySignalEnabled } from "@/lib/analytics-consent"

interface LiveEvent {
  id: string
  name: string
  section?: string
  ts: number
  properties?: Record<string, unknown>
}

interface AnalyticsEventDetail {
  name: string
  properties?: Record<string, unknown>
  timestamp: number
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 2) return "just now"
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}

function EventBadge({ name }: { name: string }) {
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/25">
      {name}
    </span>
  )
}

function LiveEventsTab() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const [privacySignalActive, setPrivacySignalActive] = useState(false)

  // Both privacySignalActive and now read browser-only state (navigator
  // signals, wall-clock time) that is unavailable, or would differ from the
  // server-rendered markup, during SSR. They start at an SSR-matching
  // default (false/null) and are set for real here, once, after mount. This
  // is the standard SSR-safe pattern for client-only initial values; it
  // necessarily calls setState synchronously in an effect, which
  // react-hooks/set-state-in-effect flags on principle, but computing either
  // value inline during render would reintroduce a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrivacySignalActive(hasPrivacySignalEnabled())
    setNow(Date.now())
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AnalyticsEventDetail>).detail
      const section = (detail.properties?.section_id as string) || (detail.properties?.path as string) || undefined
      setEvents((prev) => [
        // crypto.randomUUID() rather than an incrementing ref counter: this
        // component unmounts on /weather (it isn't rendered on that route)
        // and remounts on return to /, which resets a ref-based counter back
        // to 0. Next.js 16's route-transition handling can keep the
        // departing and arriving trees briefly alive together, so two
        // independently-zeroed counters could produce the same small
        // integer and collide on key={ev.id}, which surfaced as a real
        // "two children with the same key" React warning under rapid
        // navigation. A random id can't collide regardless of how many
        // instances exist or how they overlap.
        { id: crypto.randomUUID(), name: detail.name, section, ts: detail.timestamp, properties: detail.properties },
        ...prev.slice(0, 5),
      ])
    }
    window.addEventListener("analytics:event", handler)
    return () => window.removeEventListener("analytics:event", handler)
  }, [])

  // Tick every 5s so elapsed times stay fresh. Updating state from inside
  // the interval callback, rather than the effect body itself, is the
  // pattern react-hooks/set-state-in-effect recommends: "subscribe to an
  // external system, call setState in a callback."
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground gap-2">
          {privacySignalActive ? (
            <>
              <span className="text-2xl" aria-hidden="true">⛔</span>
              <p>Tracking disabled by a browser privacy signal (Do Not Track or Global Privacy Control). This is working as intended: no events are sent while either signal is on.</p>
            </>
          ) : (
            <>
              <span className="text-2xl" aria-hidden="true">↕</span>
              <p>Scroll or click a nav link to see events fire in real time.</p>
            </>
          )}
        </div>
      ) : (
        events.map((ev) => {
          const isExpanded = expandedId === ev.id
          const props = ev.properties ? Object.entries(ev.properties) : []
          return (
            <div key={ev.id} className="overflow-hidden rounded-md border border-border/70 bg-background/40">
              <button
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between gap-3 bg-muted/30 px-3 py-2 hover:bg-primary/5 transition-colors text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <EventBadge name={ev.name} />
                  {ev.section && (
                    <span className="text-xs text-muted-foreground truncate">
                      section → {ev.section}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {/* now is null only in the instant between mount and the
                        effect above running; events can't exist yet at that
                        point (they arrive via a listener registered in that
                        same render), so this fallback is never actually
                        visible, just a type-safe placeholder. */}
                    {formatElapsed((now ?? 0) - ev.ts)}
                  </span>
                  <span className="text-muted-foreground text-xs" aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>
              {isExpanded && props.length > 0 && (
                <div className="border-t border-border/50 bg-muted/10 px-3 py-2.5">
                  <table className="w-full text-xs">
                    <tbody>
                      {props.map(([key, val]) => (
                        <tr key={key} className="align-top">
                          <td className="pr-3 py-0.5 font-mono text-muted-foreground whitespace-nowrap">{key}</td>
                          <td className="py-0.5 text-foreground break-all">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })
      )}
      {events.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pt-1">Click any event to inspect its properties.</p>
      )}
    </div>
  )
}

const trackingPlanRows = [
  {
    event: "page_view",
    trigger: "Initial page load and every client-side route change",
    properties: "path, title, referrer, is_page_reload, navigation_type",
  },
  {
    event: "section_viewed",
    trigger: "Section reaches 20% above viewport bottom",
    properties: "section_id, section_name, interaction_type",
  },
  {
    event: "section_clicked",
    trigger: "Internal nav link click",
    properties: "section_id, section_name, click_source",
  },
  {
    event: "resume_downloaded",
    trigger: "Resume PDF click (nav, hero, contact)",
    properties: "download_source, file_name",
  },
  {
    event: "external_link_clicked",
    trigger: "Outbound link click",
    properties: "link_type, destination, link_location",
  },
  {
    event: "contact_clicked",
    trigger: "Email or LinkedIn contact click",
    properties: "contact_method, link_location",
  },
  {
    event: "weather_page_viewed",
    trigger: "/weather route mounts",
    properties: "data_source_mode",
  },
  {
    event: "event_explorer_interaction",
    trigger: "Tornado event explorer filter, inspection, or source-record open",
    properties: "interaction_type, selected_region, event_rating, source_type",
  },
  {
    event: "project_explorer_interaction",
    trigger: "dbt project explorer file, model, repo, or docs action",
    properties: "interaction_type, pipeline_file_category, pipeline_node_layer",
  },
]

function TrackingPlanTab() {
  return (
    <div className="space-y-6">
      {/* Event spec table */}
      <div className="overflow-x-auto rounded-md border border-border/70">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40">
              <th scope="col" className="px-3 py-2 text-left font-semibold text-muted-foreground">Event</th>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-muted-foreground">Trigger</th>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-muted-foreground hidden sm:table-cell">Properties</th>
            </tr>
          </thead>
          <tbody>
            {trackingPlanRows.map((row) => (
              <tr key={row.event} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/25">
                    {row.event}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground align-top">{row.trigger}</td>
                <td className="px-3 py-2.5 text-muted-foreground align-top hidden sm:table-cell font-mono text-xs">
                  {row.properties}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Every event routes through the same first-party proxy and carries shared device, referrer,
        and UTM context.
      </p>

      {/* Pipeline diagram */}
      <div className="flex items-start justify-center gap-0 text-xs flex-wrap sm:flex-nowrap">
        {[
          { label: "Browser Events", sub: "Intersection Observer + click listeners" },
          { label: "/api/amplitude", sub: "First-party proxy, immune to ad blockers" },
          { label: "Amplitude", sub: "Analytics destination" },
        ].map((node, i, arr) => (
          <div key={node.label} className="flex items-center">
            <div className="flex min-w-[90px] flex-col items-center rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-center">
              <span className="font-medium text-foreground text-xs">{node.label}</span>
              <span className="text-muted-foreground text-[11px] mt-0.5 leading-tight">{node.sub}</span>
            </div>
            {i < arr.length - 1 && (
              <span className="text-muted-foreground px-1 text-base shrink-0" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsShowcase() {
  const [activeTab, setActiveTab] = useState<"events" | "plan">("events")

  return (
    <section id="demos" className="w-full border-y border-border/70 bg-muted/25 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-3 mb-8 text-center">
            <p className="section-kicker">Instrumentation</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live Analytics on This Site</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              This section is a working sample of my instrumentation. A real tracking plan, real
              events, and a real first-party proxy that reaches visitors ad blockers would
              otherwise hide, all running on the page you are reading.
            </p>
          </div>

          <div className="engine-panel overflow-hidden rounded-lg">
            {/* Tab bar */}
            <div className="flex border-b border-border/70" role="tablist" aria-label="Analytics showcase tabs">
              <button
                onClick={() => setActiveTab("events")}
                role="tab"
                aria-selected={activeTab === "events"}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  activeTab === "events"
                    ? "bg-background/70 text-foreground border-b-2 border-primary"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Events
              </button>
              <button
                onClick={() => setActiveTab("plan")}
                role="tab"
                aria-selected={activeTab === "plan"}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  activeTab === "plan"
                    ? "bg-background/70 text-foreground border-b-2 border-primary"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                Tracking Plan
              </button>
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === "events" ? <LiveEventsTab /> : <TrackingPlanTab />}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Events are anonymized and routed through a first-party proxy to Amplitude. Do Not
                Track and Global Privacy Control signals disable tracking entirely.
              </p>
              <TrackedLink
                href={IDENTITY.siteRepo}
                linkType="github"
                location="demos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
              >
                View source <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
