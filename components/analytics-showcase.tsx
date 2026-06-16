"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface LiveEvent {
  id: number
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
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [, setTick] = useState(0)
  const counterRef = useRef(0)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AnalyticsEventDetail>).detail
      const section = (detail.properties?.section_id as string) || (detail.properties?.path as string) || undefined
      counterRef.current += 1
      setEvents((prev) => [
        { id: counterRef.current, name: detail.name, section, ts: detail.timestamp, properties: detail.properties },
        ...prev.slice(0, 5),
      ])
    }
    window.addEventListener("analytics:event", handler)
    return () => window.removeEventListener("analytics:event", handler)
  }, [])

  // Tick every 5s so elapsed times stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const now = Date.now()

  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground gap-2">
          <span className="text-2xl">↕</span>
          <p>Scroll or click a nav link to see events fire in real time.</p>
        </div>
      ) : (
        events.map((ev) => {
          const isExpanded = expandedId === ev.id
          const props = ev.properties ? Object.entries(ev.properties) : []
          return (
            <div key={ev.id} className="overflow-hidden rounded-md border border-border/70 bg-background/40">
              <button
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                className="w-full flex items-center justify-between gap-3 bg-muted/30 px-3 py-2 hover:bg-primary/5 transition-colors text-left"
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
                    {formatElapsed(now - ev.ts)}
                  </span>
                  <span className="text-muted-foreground text-xs">{isExpanded ? "▲" : "▼"}</span>
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
    trigger: "Initial page load",
    properties: "path, title, referrer, initial_load: true",
    route: "Segment → Amplitude",
  },
  {
    event: "section_viewed",
    trigger: "50% in viewport",
    properties: "section_id, section_name, interaction_type: scroll",
    route: "Segment → Amplitude",
  },
  {
    event: "section_clicked",
    trigger: "Nav link click",
    properties: "section_id, section_name, click_source: navigation",
    route: "Segment → Amplitude",
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
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Event</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Trigger</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground hidden sm:table-cell">Properties</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Route</th>
            </tr>
          </thead>
          <tbody>
            {trackingPlanRows.map((row) => (
              <tr key={row.event} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/25">
                    {row.event}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground align-top">{row.trigger}</td>
                <td className="px-3 py-2.5 text-muted-foreground align-top hidden sm:table-cell font-mono text-[11px]">
                  {row.properties}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground align-top whitespace-nowrap">{row.route}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pipeline diagram */}
      <div className="flex items-start justify-center gap-0 text-xs flex-wrap sm:flex-nowrap">
        {[
          { label: "Browser Events", sub: "Intersection Observer + click listeners" },
          { label: "Segment CDP", sub: "Write key · TypeScript tracking plan" },
          { label: "Amplitude", sub: "Analytics destination" },
        ].map((node, i, arr) => (
          <div key={node.label} className="flex items-center">
            <div className="flex min-w-[90px] flex-col items-center rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-center">
              <span className="font-medium text-foreground text-[11px]">{node.label}</span>
              <span className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{node.sub}</span>
            </div>
            {i < arr.length - 1 && (
              <span className="text-muted-foreground px-1 text-base shrink-0">→</span>
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
              This portfolio is instrumented with the same CDP-to-destination pattern I implement for clients —{" "}
              <strong>Segment</strong> as the CDP routing events directly to{" "}
              <strong>Amplitude</strong> as the destination. Watch the tracking plan run live below.
            </p>
          </div>

          <div className="engine-panel overflow-hidden rounded-lg">
            {/* Tab bar */}
            <div className="flex border-b border-border/70">
              <button
                onClick={() => setActiveTab("events")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "events"
                    ? "bg-background/70 text-foreground border-b-2 border-primary"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Events
              </button>
              <button
                onClick={() => setActiveTab("plan")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
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
                Events are anonymized and routed to Amplitude via Segment. DNT / GPC signals disable tracking.
              </p>
              <Link
                href="https://github.com/ctburkhalter/chaseburkhalter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
              >
                View source <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
