// This file contains all analytics integrations for the portfolio site

// Polyfill for global to prevent "global is not defined" error in the browser
if (typeof window !== "undefined" && !window.global) {
  window.global = window
}

// Segment and GTM credentials are expected to be provided via environment variables
const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? ""
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? ""

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
    (() => {
      var analytics = (window.analytics = window.analytics || [])
      if (!analytics.initialize) {
        if (analytics.invoked) {
          if (window.console && console.error && process.env.NODE_ENV === 'development') {
            console.error("Segment snippet included twice.")
          }
        } else {
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
    ;(<T extends Record<string, any>>(w: T, d: Document, s: string, l: string, i: string) => {
      ;(w as any)[l] = (w as any)[l] || []
      ;(w as any)[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      const f = d.getElementsByTagName(s)[0],
        j = d.createElement(s) as HTMLScriptElement,
        dl = l !== 'dataLayer' ? '&l=' + l : ''
      j.async = true
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
      f.parentNode?.insertBefore(j, f)
    })(window, document, 'script', 'dataLayer', GTM_CONTAINER_ID)

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
    global: any
  }
  
  // Add type definitions for GTM dataLayer
  interface DataLayerObject {
    [key: string]: any;
    'gtm.start'?: number;
    event?: string;
  }
  
  interface DataLayer extends Array<DataLayerObject> {
    push: (...args: DataLayerObject[]) => number;
  }
  
  var dataLayer: DataLayer;
}
