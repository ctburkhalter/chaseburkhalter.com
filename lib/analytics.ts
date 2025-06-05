// This file contains all analytics integrations for the portfolio site

// Polyfill for global to prevent "global is not defined" error in the browser
if (typeof window !== "undefined" && !window.global) {
  window.global = window
}

// Placeholder for your actual Segment, GTM, and Amplitude keys
const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "YOUR_SEGMENT_WRITE_KEY"
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || "GTM-XXXXXXX"
const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || "YOUR_AMPLITUDE_API_KEY"

// Types for our analytics events
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

// Analytics provider interface
export interface AnalyticsProvider {
  initialize(): void
  trackEvent(event: AnalyticsEvent): void
  trackPageView(pageView: PageViewEvent): void
  identify(userId: string, traits?: Record<string, any>): void
}

// Segment Analytics Provider
class SegmentProvider implements AnalyticsProvider {
  private isInitialized = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") return

    // Load Segment snippet
    !(() => {
      var analytics = (window.analytics = window.analytics || [])
      if (!analytics.initialize) {
        if (analytics.invoked) window.console && console.error && console.error("Segment snippet included twice.")
        else {
          analytics.invoked = true
          analytics.methods = [
            "trackSubmit",
            "trackClick",
            "trackLink",
            "trackForm",
            "pageview",
            "identify",
            "reset",
            "group",
            "track",
            "ready",
            "alias",
            "debug",
            "page",
            "once",
            "off",
            "on",
            "addSourceMiddleware",
            "addIntegrationMiddleware",
            "setAnonymousId",
            "addDestinationMiddleware",
          ]
          analytics.factory = (e: any) => () => {
            var t = Array.prototype.slice.call(arguments)
            t.unshift(e)
            analytics.push(t)
            return analytics
          }
          for (var e = 0; e < analytics.methods.length; e++) {
            var key = analytics.methods[e]
            analytics[key] = analytics.factory(key)
          }
          analytics.load = (key: string, e?: any) => {
            var t = document.createElement("script")
            t.type = "text/javascript"
            t.async = !0
            t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js"
            var n = document.getElementsByTagName("script")[0]
            n.parentNode?.insertBefore(t, n)
            analytics._loadOptions = e
          }
          analytics._writeKey = SEGMENT_WRITE_KEY
          analytics.SNIPPET_VERSION = "4.15.3"
          analytics.load(SEGMENT_WRITE_KEY)
        }
      }
    })()

    this.isInitialized = true
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.analytics) return
    window.analytics.track(event.name, event.properties)
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.analytics) return
    window.analytics.page(pageView.title, {
      path: pageView.path,
      url: typeof window !== "undefined" ? window.location.href : "",
      referrer: pageView.referrer,
      ...pageView.properties,
    })
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.analytics) return
    window.analytics.identify(userId, traits)
  }
}

// Google Tag Manager Provider
class GTMProvider implements AnalyticsProvider {
  private isInitialized = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") return

    // Initialize data layer
    window.dataLayer = window.dataLayer || []

    // Load GTM script
    ;((w, d, s, l, i) => {
      w[l] = w[l] || []
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s) as HTMLScriptElement,
        dl = l != "dataLayer" ? "&l=" + l : ""
      j.async = true
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl
      f.parentNode?.insertBefore(j, f)
    })(window, document, "script", "dataLayer", GTM_CONTAINER_ID)

    this.isInitialized = true
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) return
    window.dataLayer.push({
      event: event.name,
      ...event.properties,
    })
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) return
    window.dataLayer.push({
      event: "page_view",
      page_path: pageView.path,
      page_title: pageView.title,
      page_referrer: pageView.referrer,
      ...pageView.properties,
    })
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.dataLayer) return
    window.dataLayer.push({
      event: "user_identify",
      user_id: userId,
      user_traits: traits,
    })
  }
}

// Amplitude Provider
class AmplitudeProvider implements AnalyticsProvider {
  private isInitialized = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") return

    // Load Amplitude script - using a safer approach to avoid global references
    try {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.src = "https://cdn.amplitude.com/libs/amplitude-8.5.0-min.js"
      script.onload = () => {
        if (window.amplitude) {
          window.amplitude.getInstance().init(AMPLITUDE_API_KEY)
        }
      }
      document.head.appendChild(script)
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to load Amplitude:", error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.amplitude) return
    try {
      window.amplitude.getInstance().logEvent(event.name, event.properties)
    } catch (error) {
      console.error("Failed to track event with Amplitude:", error)
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.amplitude) return
    try {
      window.amplitude.getInstance().logEvent("Page Viewed", {
        page_path: pageView.path,
        page_title: pageView.title,
        page_referrer: pageView.referrer,
        ...pageView.properties,
      })
    } catch (error) {
      console.error("Failed to track page view with Amplitude:", error)
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.amplitude) return
    try {
      window.amplitude.getInstance().setUserId(userId)

      if (traits && window.amplitude.Identify) {
        const identify = new window.amplitude.Identify()
        Object.entries(traits).forEach(([key, value]) => {
          identify.set(key, value)
        })
        window.amplitude.getInstance().identify(identify)
      }
    } catch (error) {
      console.error("Failed to identify user with Amplitude:", error)
    }
  }
}

// Main Analytics Manager
class AnalyticsManager {
  private providers: AnalyticsProvider[] = []
  private isInitialized = false

  constructor() {
    // We'll initialize providers on demand to avoid issues with SSR
  }

  initialize(): void {
    if (this.isInitialized) return

    // Only initialize in browser environment
    if (typeof window === "undefined") return

    // Add providers
    if (this.providers.length === 0) {
      this.providers.push(new SegmentProvider())
      this.providers.push(new GTMProvider())
      this.providers.push(new AmplitudeProvider())
    }

    // Initialize all providers
    this.providers.forEach((provider) => provider.initialize())
    this.isInitialized = true

    // Track initial page view if in browser
    if (typeof window !== "undefined") {
      this.trackPageView({
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
      })
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    this.providers.forEach((provider) => provider.trackEvent(event))
  }

  trackPageView(pageView: PageViewEvent): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    this.providers.forEach((provider) => provider.trackPageView(pageView))
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    this.providers.forEach((provider) => provider.identify(userId, traits))
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager()

// Type definitions for window
declare global {
  interface Window {
    analytics: any
    dataLayer: any[]
    amplitude: any
    global: any // Add global to the Window interface
  }
}
