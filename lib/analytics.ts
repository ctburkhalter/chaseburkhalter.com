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

export type PortfolioEvent = AnalyticsEvent & {
  properties: {
    portfolio_demo: boolean
    timestamp: string
    [key: string]: any
  }
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

// Enhanced error handling and logging
class AnalyticsLogger {
  private static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      const logMessage = `[Analytics ${level.toUpperCase()}] ${timestamp}: ${message}`
      
      switch (level) {
        case 'info':
          console.log(logMessage, data || '')
          break
        case 'warn':
          console.warn(logMessage, data || '')
          break
        case 'error':
          console.error(logMessage, data || '')
          break
      }
    }
  }

  static info(message: string, data?: any) {
    this.log('info', message, data)
  }

  static warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  static error(message: string, data?: any) {
    this.log('error', message, data)
  }
}

// Segment Analytics Provider
class SegmentProvider implements AnalyticsProvider {
  private isInitialized = false
  private initializationAttempted = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") return
    
    if (this.initializationAttempted) {
      AnalyticsLogger.warn("Segment initialization already attempted")
      return
    }

    this.initializationAttempted = true

    if (!SEGMENT_WRITE_KEY) {
      AnalyticsLogger.warn("Segment write key not provided - skipping initialization")
      return
    }

    try {
      // Load Segment snippet
      (() => {
        var analytics = (window.analytics = window.analytics || [])
        if (!analytics.initialize) {
          if (analytics.invoked) {
            AnalyticsLogger.warn("Segment snippet included twice")
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
      AnalyticsLogger.info("Segment initialized successfully")
    } catch (error) {
      AnalyticsLogger.error("Failed to initialize Segment", error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.analytics) {
      AnalyticsLogger.warn("Segment not available for event tracking", event)
      return
    }
    
    try {
      window.analytics.track(event.name, {
        ...event.properties,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
      })
      AnalyticsLogger.info("Segment event tracked", event)
    } catch (error) {
      AnalyticsLogger.error("Failed to track Segment event", { event, error })
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.analytics) {
      AnalyticsLogger.warn("Segment not available for page view tracking", pageView)
      return
    }
    
    try {
      window.analytics.page(pageView.title, {
        path: pageView.path,
        url: typeof window !== "undefined" ? window.location.href : "",
        referrer: pageView.referrer,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
        ...pageView.properties,
      })
      AnalyticsLogger.info("Segment page view tracked", pageView)
    } catch (error) {
      AnalyticsLogger.error("Failed to track Segment page view", { pageView, error })
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.analytics) {
      AnalyticsLogger.warn("Segment not available for user identification", { userId, traits })
      return
    }
    
    try {
      window.analytics.identify(userId, {
        ...traits,
        identified_at: new Date().toISOString(),
        source: 'portfolio',
      })
      AnalyticsLogger.info("Segment user identified", { userId, traits })
    } catch (error) {
      AnalyticsLogger.error("Failed to identify Segment user", { userId, traits, error })
    }
  }
}

// Google Tag Manager Provider
class GTMProvider implements AnalyticsProvider {
  private isInitialized = false
  private initializationAttempted = false

  initialize(): void {
    if (this.isInitialized || typeof window === "undefined") return
    
    if (this.initializationAttempted) {
      AnalyticsLogger.warn("GTM initialization already attempted")
      return
    }

    this.initializationAttempted = true

    if (!GTM_CONTAINER_ID) {
      AnalyticsLogger.warn("GTM container ID not provided - skipping initialization")
      return
    }

    try {
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
      AnalyticsLogger.info("GTM initialized successfully")
    } catch (error) {
      AnalyticsLogger.error("Failed to initialize GTM", error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      AnalyticsLogger.warn("GTM not available for event tracking", event)
      return
    }
    
    try {
      window.dataLayer.push({
        event: event.name,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
        ...event.properties,
      })
      AnalyticsLogger.info("GTM event tracked", event)
    } catch (error) {
      AnalyticsLogger.error("Failed to track GTM event", { event, error })
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      AnalyticsLogger.warn("GTM not available for page view tracking", pageView)
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
        ...pageView.properties,
      })
      AnalyticsLogger.info("GTM page view tracked", pageView)
    } catch (error) {
      AnalyticsLogger.error("Failed to track GTM page view", { pageView, error })
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.dataLayer) {
      AnalyticsLogger.warn("GTM not available for user identification", { userId, traits })
      return
    }
    
    try {
      window.dataLayer.push({
        event: "user_identify",
        user_id: userId,
        user_traits: traits,
        identified_at: new Date().toISOString(),
        source: 'portfolio',
      })
      AnalyticsLogger.info("GTM user identified", { userId, traits })
    } catch (error) {
      AnalyticsLogger.error("Failed to identify GTM user", { userId, traits, error })
    }
  }
}

// Main Analytics Manager
class AnalyticsManager {
  private providers: AnalyticsProvider[] = []
  private isInitialized = false
  private initializationAttempted = false

  constructor() {
    // We'll initialize providers on demand to avoid issues with SSR
  }

  initialize(): void {
    if (this.isInitialized) return

    if (this.initializationAttempted) {
      AnalyticsLogger.warn("Analytics Manager initialization already attempted")
      return
    }

    this.initializationAttempted = true

    // Only initialize in browser environment
    if (typeof window === "undefined") {
      AnalyticsLogger.info("Analytics Manager: Skipping initialization in SSR environment")
      return
    }

    try {
      // Add providers
      if (this.providers.length === 0) {
        this.providers.push(new SegmentProvider())
        this.providers.push(new GTMProvider())
        AnalyticsLogger.info("Analytics providers added", { count: this.providers.length })
      }

      // Initialize all providers
      this.providers.forEach((provider) => {
        try {
          provider.initialize()
        } catch (error) {
          AnalyticsLogger.error("Failed to initialize provider", error)
        }
      })
      
      this.isInitialized = true
      AnalyticsLogger.info("Analytics Manager initialized successfully")

      // Note: Page view tracking is handled by the AnalyticsProvider component
      // to prevent duplicate events from multiple hook instances
    } catch (error) {
      AnalyticsLogger.error("Failed to initialize Analytics Manager", error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    
    AnalyticsLogger.info("Tracking event across providers", event)
    this.providers.forEach((provider) => {
      try {
        provider.trackEvent(event)
      } catch (error) {
        AnalyticsLogger.error("Provider failed to track event", { provider: provider.constructor.name, event, error })
      }
    })
  }

  trackPageView(pageView: PageViewEvent): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    
    AnalyticsLogger.info("Tracking page view across providers", pageView)
    this.providers.forEach((provider) => {
      try {
        provider.trackPageView(pageView)
      } catch (error) {
        AnalyticsLogger.error("Provider failed to track page view", { provider: provider.constructor.name, pageView, error })
      }
    })
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.initialize()
    }
    
    AnalyticsLogger.info("Identifying user across providers", { userId, traits })
    this.providers.forEach((provider) => {
      try {
        provider.identify(userId, traits)
      } catch (error) {
        AnalyticsLogger.error("Provider failed to identify user", { provider: provider.constructor.name, userId, traits, error })
      }
    })
  }

  // Portfolio-specific tracking methods
  trackPortfolioInteraction(interaction: string, properties?: Record<string, any>) {
    const startTime = performance.now()
    
    this.trackEvent({
      name: `portfolio_${interaction.toLowerCase().replace(/\s+/g, '_')}`,
      properties: {
        ...properties,
        interaction_type: interaction,
        portfolio_section: 'analytics_demo',
        timestamp: new Date().toISOString(),
        performance_start: startTime,
      },
    })
    
    // Track performance metrics
    const endTime = performance.now()
    this.trackEvent({
      name: 'portfolio_interaction_performance',
      properties: {
        interaction_type: interaction,
        duration_ms: endTime - startTime,
        timestamp: new Date().toISOString(),
      },
    })
  }

  trackProjectView(projectName: string) {
    this.trackPortfolioInteraction('project_view', {
      project_name: projectName,
      section: 'projects',
    })
  }

  trackSkillClick(skillName: string) {
    this.trackPortfolioInteraction('skill_click', {
      skill_name: skillName,
      section: 'skills',
    })
  }

  trackContactInteraction(interaction: string) {
    this.trackPortfolioInteraction('contact_interaction', {
      contact_action: interaction,
      section: 'contact',
    })
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
