// Analytics system — Segment only, single initialization, no duplicate events

import { canLoadAnalytics } from "@/lib/analytics-consent"
import { getEventContext } from "@/lib/analytics-events"

// Polyfill for global to prevent "global is not defined" error in the browser
if (typeof window !== "undefined" && !window.global) {
  window.global = window
}

// Environment variables
const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? ""
const SEGMENT_METHODS = [
  "trackSubmit", "trackClick", "trackLink", "trackForm",
  "pageview", "identify", "reset", "group", "track",
  "ready", "alias", "debug", "page", "once", "off", "on",
  "addSourceMiddleware", "addIntegrationMiddleware",
  "setAnonymousId", "addDestinationMiddleware"
]

export type AnalyticsProperties = object
type SegmentQueuedCall = [string, ...unknown[]]
type SegmentIntegrationSettings = Record<string, Record<string, unknown>>
type SegmentPayloadObject = {
  userId?: string | null
  anonymousId?: string
  type?: string
  integrations?: SegmentIntegrationSettings
}
type SegmentMiddlewareArgs = {
  payload: {
    obj?: SegmentPayloadObject
  }
  next: (payload: SegmentMiddlewareArgs["payload"]) => void
}
type SegmentAnalytics = SegmentQueuedCall[] & {
  [key: string]: unknown
  invoked?: boolean
  methods?: string[]
  factory?: (method: string) => (...args: unknown[]) => SegmentAnalytics
  _writeKey?: string
  SNIPPET_VERSION?: string
  ready?: (callback: () => void) => void
  track?: (eventName: string, properties?: AnalyticsProperties) => void
  page?: (pageName: string, properties?: AnalyticsProperties) => void
  identify?: (userId: string, traits?: AnalyticsProperties) => void
  reset?: () => void
  user?: () => {
    anonymousId?: () => string
    id?: () => string
  }
  addSourceMiddleware?: (middleware: (args: SegmentMiddlewareArgs) => void) => void
}

// Types
export type AnalyticsEvent = {
  name: string
  properties?: AnalyticsProperties
}

export type PageViewEvent = {
  path: string
  title: string
  referrer?: string
  properties?: AnalyticsProperties
}

// Development logging
class AnalyticsLogger {
  private static shouldLog = process.env.NODE_ENV === 'development'

  static info(message: string, data?: unknown) {
    if (this.shouldLog) {
      console.log(`[Analytics] ${message}`, data || '')
    }
  }

  static warn(message: string, data?: unknown) {
    if (this.shouldLog) {
      console.warn(`[Analytics] ${message}`, data || '')
    }
  }

  static error(message: string, data?: unknown) {
    if (this.shouldLog) {
      console.error(`[Analytics] ${message}`, data || '')
    }
  }
}

// Segment Analytics Provider
class SegmentProvider {
  private isInitialized = false
  private isReady = false
  private middlewareInstalled = false
  private readyCallbacks: (() => void)[] = []

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") {
      return
    }

    if (!SEGMENT_WRITE_KEY) {
      AnalyticsLogger.warn("Segment write key not provided")
      return
    }

    try {
      // Create Segment's queue/stub. The real library is loaded via next/script.
      const analytics = (window.analytics || []) as SegmentAnalytics
      window.analytics = analytics
      const isQueuedAnalytics = Array.isArray(analytics)
      if (!analytics.invoked && isQueuedAnalytics) {
        analytics.invoked = true
        analytics.methods = SEGMENT_METHODS

        analytics.factory = (method: string) => (...args: unknown[]) => {
          const params: SegmentQueuedCall = [method, ...args]
          analytics.push(params)
          return analytics
        }

        for (let i = 0; i < analytics.methods.length; i++) {
          const key = analytics.methods[i]
          analytics[key] = analytics.factory(key)
        }

        analytics._writeKey = SEGMENT_WRITE_KEY
        analytics.SNIPPET_VERSION = "4.15.3"
      }

      // Wait for Segment to be ready with anonymousId
      if (typeof analytics.ready === "function") {
        analytics.ready(() => {
          this.isReady = true
          const anonymousId = window.analytics?.user?.()?.anonymousId?.()
          const currentUserId = window.analytics?.user?.()?.id?.()
          AnalyticsLogger.info("Segment ready", { anonymousId, currentUserId })

          // Check if there's an invalid userId stored and reset if needed
          // This clears any previously stored invalid userIds like "me"
          if (currentUserId && (currentUserId === "me" || currentUserId.length < 5)) {
            AnalyticsLogger.warn("Found invalid stored userId, resetting identity", { currentUserId })
            window.analytics.reset?.()
            AnalyticsLogger.info("Identity reset complete, will use anonymousId only")
          }

          // Add middleware to filter out invalid userId values and ensure Amplitude gets proper IDs
          // This prevents "me" or other invalid userIds from being sent to destinations
          if (!this.middlewareInstalled && typeof window.analytics.addSourceMiddleware === "function") {
            window.analytics.addSourceMiddleware(({ payload, next }: SegmentMiddlewareArgs) => {
              // Check if userId exists and is invalid
              if (payload.obj?.userId) {
                const userId = payload.obj.userId

                // Filter out invalid userIds (like "me", empty strings, etc.)
                // Amplitude requires minimum 5 characters for userId
                if (userId === "me" || userId === "" || userId === null || userId === undefined || userId.length < 5) {
                  AnalyticsLogger.info("Filtering out invalid userId", { userId, eventType: payload.obj.type })
                  // Remove userId from the payload
                  delete payload.obj.userId
                }
              }

              // Ensure Amplitude receives deviceId from anonymousId when userId is not present
              // Amplitude requires either userId OR deviceId - we use anonymousId as deviceId
              if (!payload.obj?.userId && payload.obj?.anonymousId) {
                // Configure Amplitude-specific integration settings
                if (!payload.obj.integrations) {
                  payload.obj.integrations = {}
                }
                if (!payload.obj.integrations['Actions Amplitude']) {
                  payload.obj.integrations['Actions Amplitude'] = {}
                }

                // Ensure anonymousId is used as deviceId for Amplitude
                // This is critical when userId is not set
                payload.obj.integrations['Actions Amplitude'].device_id = payload.obj.anonymousId

                AnalyticsLogger.info("Mapped anonymousId to Amplitude deviceId", {
                  anonymousId: payload.obj.anonymousId,
                  eventType: payload.obj.type
                })
              }

              next(payload)
            })

            this.middlewareInstalled = true
            AnalyticsLogger.info("Segment middleware installed to filter invalid userIds and map anonymousId to Amplitude deviceId")
          }

          // Execute any queued callbacks
          this.readyCallbacks.forEach(cb => cb())
          this.readyCallbacks = []
        })
      } else {
        this.isReady = true
        this.readyCallbacks.forEach(cb => cb())
        this.readyCallbacks = []
      }

      this.isInitialized = true
      AnalyticsLogger.info("Segment initialized")
    } catch (error) {
      AnalyticsLogger.error("Failed to initialize Segment", error)
    }
  }

  private whenReady(callback: () => void): void {
    if (this.isReady) {
      callback()
    } else {
      this.readyCallbacks.push(callback)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.analytics?.track) {
      return
    }
    const track = window.analytics.track

    this.whenReady(() => {
      try {
        const properties = {
          ...event.properties,
          timestamp: new Date().toISOString(),
          source: 'portfolio'
        }
        track(event.name, properties)
        window.dispatchEvent(new CustomEvent('analytics:event', {
          detail: { name: event.name, properties, timestamp: Date.now() }
        }))
        AnalyticsLogger.info("Segment event tracked", event)
      } catch (error) {
        AnalyticsLogger.error("Failed to track Segment event", error)
      }
    })
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.analytics?.page) {
      return
    }
    const page = window.analytics.page

    this.whenReady(() => {
      try {
        const properties = {
          path: pageView.path,
          url: window.location.href,
          referrer: pageView.referrer || 'direct',
          timestamp: new Date().toISOString(),
          source: 'portfolio',
          ...pageView.properties
        }
        page(pageView.title, properties)
        window.dispatchEvent(new CustomEvent('analytics:event', {
          detail: { name: 'page_view', properties: { ...properties, title: pageView.title }, timestamp: Date.now() }
        }))
        AnalyticsLogger.info("Segment page view tracked", pageView)
      } catch (error) {
        AnalyticsLogger.error("Failed to track Segment page view", error)
      }
    })
  }

  identify(userId: string, traits?: AnalyticsProperties): void {
    if (typeof window === "undefined" || !window.analytics?.identify) {
      return
    }
    const identify = window.analytics.identify

    // Validate userId before calling identify
    // This prevents invalid userIds from being stored in Segment
    // Amplitude requires minimum 5 characters for userId
    if (!userId || userId.trim().length < 5) {
      AnalyticsLogger.warn("Invalid userId provided to identify() - must be at least 5 characters", { userId })
      return
    }

    this.whenReady(() => {
      try {
        identify(userId, {
          ...traits,
          identified_at: new Date().toISOString(),
          source: 'portfolio'
        })
        AnalyticsLogger.info("Segment user identified", { userId, traits })
      } catch (error) {
        AnalyticsLogger.error("Failed to identify Segment user", error)
      }
    })
  }
}

// Main Analytics Manager (Singleton)
class AnalyticsManager {
  private segment: SegmentProvider
  private isInitialized = false
  private isDisabled = false
  private lastPageView: { path: string; timestamp: number } | null = null

  constructor() {
    this.segment = new SegmentProvider()
  }

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") {
      return
    }

    if (!canLoadAnalytics()) {
      this.isDisabled = true
      this.isInitialized = true
      AnalyticsLogger.info("Analytics disabled by browser privacy signal")
      return
    }

    AnalyticsLogger.info("Initializing analytics...")

    this.segment.initialize()

    this.isInitialized = true
    AnalyticsLogger.info("Analytics initialized successfully")
  }

  trackEvent(event: AnalyticsEvent): void {
    if (this.isDisabled || !canLoadAnalytics()) {
      this.isDisabled = true
      return
    }

    if (!this.isInitialized) {
      this.initialize()
    }

    const enriched: AnalyticsEvent = {
      ...event,
      properties: { ...getEventContext(), ...event.properties },
    }

    this.segment.trackEvent(enriched)
  }

  trackPageView(pageView: PageViewEvent): void {
    if (this.isDisabled || !canLoadAnalytics()) {
      this.isDisabled = true
      return
    }

    if (!this.isInitialized) {
      this.initialize()
    }

    // Deduplication: prevent identical page views within 1 second
    const now = Date.now()
    if (this.lastPageView &&
        this.lastPageView.path === pageView.path &&
        (now - this.lastPageView.timestamp) < 1000) {
      AnalyticsLogger.warn("Duplicate page view prevented", {
        path: pageView.path,
        timeSinceLastView: now - this.lastPageView.timestamp
      })
      return
    }

    this.lastPageView = { path: pageView.path, timestamp: now }

    const enriched: PageViewEvent = {
      ...pageView,
      properties: { ...getEventContext(), ...pageView.properties },
    }

    this.segment.trackPageView(enriched)
  }

  identify(userId: string, traits?: AnalyticsProperties): void {
    if (this.isDisabled || !canLoadAnalytics()) {
      this.isDisabled = true
      return
    }

    if (!this.isInitialized) {
      this.initialize()
    }

    // Validate userId at the manager level
    // Amplitude requires minimum 5 characters for userId
    if (!userId || userId.trim().length < 5) {
      AnalyticsLogger.warn("Invalid userId provided to AnalyticsManager.identify() - must be at least 5 characters", { userId })
      return
    }

    this.segment.identify(userId, traits)
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager()

// Type definitions for window
declare global {
  interface Window {
    analytics: SegmentAnalytics
    global: Window
  }
}
