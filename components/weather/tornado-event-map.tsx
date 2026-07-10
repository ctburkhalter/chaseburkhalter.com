"use client"

import { useEffect } from "react"
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet"
import type { WeatherEvent } from "@/lib/weather/types"

const defaultCenter: [number, number] = [32.8, -87.8]

function formatRatingCode(event: WeatherEvent) {
  return event.ratingCode ?? "Not rated"
}

function EventSelection({ event }: { event: WeatherEvent | null }) {
  const map = useMap()

  useEffect(() => {
    if (!event || event.beginLatitude === null || event.beginLongitude === null) return
    const points: [number, number][] = [[event.beginLatitude, event.beginLongitude]]
    if (event.endLatitude !== null && event.endLongitude !== null) points.push([event.endLatitude, event.endLongitude])
    map.fitBounds(points, { padding: [44, 44], maxZoom: 9 })
  }, [event, map])

  return null
}

function hasBeginPoint(event: WeatherEvent): event is WeatherEvent & { beginLatitude: number; beginLongitude: number } {
  return event.beginLatitude !== null && event.beginLongitude !== null
}

function hasEndpoints(event: WeatherEvent | null): event is WeatherEvent & { beginLatitude: number; beginLongitude: number; endLatitude: number; endLongitude: number } {
  return !!event && event.beginLatitude !== null && event.beginLongitude !== null && event.endLatitude !== null && event.endLongitude !== null
}

export function TornadoEventMap({
  events,
  selectedEvent,
  onSelectEvent,
  heightClassName = "h-[480px]",
}: {
  events: WeatherEvent[]
  selectedEvent: WeatherEvent | null
  onSelectEvent: (event: WeatherEvent) => void
  heightClassName?: string
}) {
  const mappedEvents = events.filter(hasBeginPoint)
  const selectedHasEndpoints = hasEndpoints(selectedEvent)

  return (
    <div>
      <div className={`${heightClassName} overflow-hidden rounded-md border border-border/70`}>
        <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom className="h-full w-full" aria-label="Interactive map of reported tornado event endpoints">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedEvents.map((event) => (
            <CircleMarker
              key={event.eventId}
              center={[event.beginLatitude, event.beginLongitude]}
              radius={selectedEvent?.eventId === event.eventId ? 9 : 6}
              pathOptions={{ color: selectedEvent?.eventId === event.eventId ? "hsl(var(--primary))" : "hsl(var(--chart-2))", fillColor: selectedEvent?.eventId === event.eventId ? "hsl(var(--primary))" : "hsl(var(--chart-2))", fillOpacity: 0.86, weight: 2 }}
              eventHandlers={{ click: () => onSelectEvent(event) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <strong>{formatRatingCode(event)}</strong> · {event.county}, {event.state}<br />
                {event.recordStatus === "preliminary" ? "Preliminary point report" : event.pathLengthMiles === null ? "Path length not reported" : `${event.pathLengthMiles} mi reported path`}
              </Tooltip>
            </CircleMarker>
          ))}
          {selectedHasEndpoints && (
            <Polyline
              positions={[[selectedEvent.beginLatitude, selectedEvent.beginLongitude], [selectedEvent.endLatitude, selectedEvent.endLongitude]]}
              pathOptions={{ color: "hsl(var(--chart-3))", weight: 3 }}
            />
          )}
          <EventSelection event={selectedEvent} />
        </MapContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Markers use published beginning coordinates for confirmed records and point coordinates for preliminary reports. The amber line connects published beginning and ending coordinates when available, it is not a reconstructed survey track.</p>
    </div>
  )
}
