// Simplified analytics system with Segment and GTM only
// Single initialization, no duplicate events

// Polyfill for global to prevent "global is not defined" error in the browser
if (typeof window !== "undefined" && !window.global) {
  window.global = window
}

// Environment variables
const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? ""
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? ""

// Types
export type AnalyticsEvent = {
  name: string
  properties?: Record<string, any>
}

export type PageViewEvent = {
  path: string
  title: string
  referrer?: string
  properties?: Record<string, any>
}

// Development logging
class AnalyticsLogger {
  private static shouldLog = process.env.NODE_ENV === 'development'

  static info(message: string, data?: any) {
    if (this.shouldLog) {
      console.log(`[Analytics] ${message}`, data || '')
    }
  }

  static warn(message: string, data?: any) {
    if (this.shouldLog) {
      console.warn(`[Analytics] ${message}`, data || '')
    }
  }

  static error(message: string, data?: any) {
    if (this.shouldLog) {
      console.error(`[Analytics] ${message}`, data || '')
    }
  }
}

// Segment Analytics Provider
class SegmentProvider {
  private isInitialized = false
  private isReady = false
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
      // Load Segment snippet
      const analytics = (window.analytics = window.analytics || [])
      if (!analytics.initialize && !analytics.invoked) {
        analytics.invoked = true
        analytics.methods = [
          "trackSubmit", "trackClick", "trackLink", "trackForm",
          "pageview", "identify", "reset", "group", "track",
          "ready", "alias", "debug", "page", "once", "off", "on",
          "addSourceMiddleware", "addIntegrationMiddleware",
          "setAnonymousId", "addDestinationMiddleware"
        ]

        analytics.factory = (method: any) => (...args: any[]) => {
          const params = Array.prototype.slice.call(args)
          params.unshift(method)
          analytics.push(params)
          return analytics
        }

        for (let i = 0; i < analytics.methods.length; i++) {
          const key = analytics.methods[i]
          analytics[key] = analytics.factory(key)
        }

        analytics.load = (key: string) => {
          const script = document.createElement("script")
          script.type = "text/javascript"
          script.async = true
          script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`
          const first = document.getElementsByTagName("script")[0]
          first.parentNode?.insertBefore(script, first)
        }

        analytics._writeKey = SEGMENT_WRITE_KEY
        analytics.SNIPPET_VERSION = "4.15.3"
        analytics.load(SEGMENT_WRITE_KEY)

        // Wait for Segment to be ready with anonymousId
        analytics.ready(() => {
          this.isReady = true
          const anonymousId = window.analytics?.user?.()?.anonymousId?.()
          const currentUserId = window.analytics?.user?.()?.id?.()
          AnalyticsLogger.info("Segment ready", { anonymousId, currentUserId })

          // Check if there's an invalid userId stored and reset if needed
          // This clears any previously stored invalid userIds like "me"
          if (currentUserId && (currentUserId === "me" || currentUserId.length < 5)) {
            AnalyticsLogger.warn("Found invalid stored userId, resetting identity", { currentUserId })
            window.analytics.reset()
            AnalyticsLogger.info("Identity reset complete, will use anonymousId only")
          }

          // Add middleware to filter out invalid userId values and ensure Amplitude gets proper IDs
          // This prevents "me" or other invalid userIds from being sent to destinations
          window.analytics.addSourceMiddleware(({ payload, next }: any) => {
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

          AnalyticsLogger.info("Segment middleware installed to filter invalid userIds and map anonymousId to Amplitude deviceId")

          // Execute any queued callbacks
          this.readyCallbacks.forEach(cb => cb())
          this.readyCallbacks = []
        })
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

    this.whenReady(() => {
      try {
        window.analytics.track(event.name, {
          ...event.properties,
          timestamp: new Date().toISOString(),
          source: 'portfolio'
        })
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

    this.whenReady(() => {
      try {
        window.analytics.page(pageView.title, {
          path: pageView.path,
          url: window.location.href,
          referrer: pageView.referrer,
          timestamp: new Date().toISOString(),
          source: 'portfolio',
          ...pageView.properties
        })
        AnalyticsLogger.info("Segment page view tracked", pageView)
      } catch (error) {
        AnalyticsLogger.error("Failed to track Segment page view", error)
      }
    })
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.analytics?.identify) {
      return
    }

    // Validate userId before calling identify
    // This prevents invalid userIds from being stored in Segment
    // Amplitude requires minimum 5 characters for userId
    if (!userId || userId.trim().length < 5) {
      AnalyticsLogger.warn("Invalid userId provided to identify() - must be at least 5 characters", { userId })
      return
    }

    this.whenReady(() => {
      try {
        window.analytics.identify(userId, {
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

// Google Tag Manager Provider
class GTMProvider {
  private isInitialized = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") {
      return
    }

    if (!GTM_CONTAINER_ID) {
      AnalyticsLogger.warn("GTM container ID not provided")
      return
    }

    try {
      // Initialize data layer
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      })

      // Load GTM script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
      const firstScript = document.getElementsByTagName('script')[0]
      firstScript.parentNode?.insertBefore(script, firstScript)

      this.isInitialized = true
      AnalyticsLogger.info("GTM initialized")
    } catch (error) {
      AnalyticsLogger.error("Failed to initialize GTM", error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      return
    }

    try {
      window.dataLayer.push({
        event: event.name,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
        ...event.properties
      })
      AnalyticsLogger.info("GTM event tracked", event)
    } catch (error) {
      AnalyticsLogger.error("Failed to track GTM event", error)
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      return
    }

    try {
      window.dataLayer.push({
        event: "page_view",
        page_path: pageView.path,
        page_title: pageView.title,
        page_referrer: pageView.referrer,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
        ...pageView.properties
      })
      AnalyticsLogger.info("GTM page view tracked", pageView)
    } catch (error) {
      AnalyticsLogger.error("Failed to track GTM page view", error)
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      return
    }

    // Validate userId before calling identify
    // Amplitude requires minimum 5 characters for userId
    if (!userId || userId.trim().length < 5) {
      AnalyticsLogger.warn("Invalid userId provided to GTM identify() - must be at least 5 characters", { userId })
      return
    }

    try {
      window.dataLayer.push({
        event: "user_identify",
        user_id: userId,
        user_traits: traits,
        identified_at: new Date().toISOString(),
        source: 'portfolio'
      })
      AnalyticsLogger.info("GTM user identified", { userId, traits })
    } catch (error) {
      AnalyticsLogger.error("Failed to identify GTM user", error)
    }
  }
}

// Main Analytics Manager (Singleton)
class AnalyticsManager {
  private segment: SegmentProvider
  private gtm: GTMProvider
  private isInitialized = false
  private lastPageView: { path: string; timestamp: number } | null = null

  constructor() {
    this.segment = new SegmentProvider()
    this.gtm = new GTMProvider()
  }

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") {
      return
    }

    AnalyticsLogger.info("Initializing analytics...")

    this.segment.initialize()
    this.gtm.initialize()

    this.isInitialized = true
    AnalyticsLogger.info("Analytics initialized successfully")
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      this.initialize()
    }

    this.segment.trackEvent(event)
    this.gtm.trackEvent(event)
  }

  trackPageView(pageView: PageViewEvent): void {
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

    this.segment.trackPageView(pageView)
    this.gtm.trackPageView(pageView)
  }

  identify(userId: string, traits?: Record<string, any>): void {
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
    this.gtm.identify(userId, traits)
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager()

// Type definitions for window
declare global {
  interface Window {
    analytics: any
    dataLayer: any[]
    global: any
  }
}
