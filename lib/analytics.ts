// Analytics system: Amplitude Browser SDK, single initialization, no duplicate events

import * as amplitude from '@amplitude/analytics-browser'
import { canLoadAnalytics } from '@/lib/analytics-consent'
import { getEventContext } from '@/lib/analytics-events'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

export type AnalyticsProperties = object

export type AnalyticsEvent = {
  name: string
  properties?: AnalyticsProperties
}

export type PageViewEvent = {
  path: string
  title: string
  properties?: AnalyticsProperties
}

class AnalyticsLogger {
  private static shouldLog = process.env.NODE_ENV === 'development'
  static info(message: string, data?: unknown) { if (this.shouldLog) console.log(`[Analytics] ${message}`, data || '') }
  static warn(message: string, data?: unknown) { if (this.shouldLog) console.warn(`[Analytics] ${message}`, data || '') }
  static error(message: string, data?: unknown) { if (this.shouldLog) console.error(`[Analytics] ${message}`, data || '') }
}

class AmplitudeProvider {
  private isInitialized = false

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    if (!AMPLITUDE_API_KEY) {
      AnalyticsLogger.warn('NEXT_PUBLIC_AMPLITUDE_API_KEY not configured')
      return
    }

    try {
      amplitude.init(AMPLITUDE_API_KEY, {
        // Route through the first-party proxy so requests originate from
        // chaseburkhalter.com instead of amplitude.com. amplitude.com is on
        // EasyList and blocked by uBlock Origin, Brave, and most ad blockers.
        // Requests to our own domain are never blocked.
        serverUrl: '/api/amplitude',
        autocapture: {
          pageViews: false,          // tracked manually for full property control
          sessions: true,            // Amplitude manages session start/end
          attribution: true,         // UTM capture alongside our sessionStorage approach
          formInteractions: false,
          fileDownloads: false,
          elementInteractions: false,
        },
        // Skips the remote config fetch on init, avoiding an extra outbound
        // round-trip that would itself be blockable before we're fully running.
        fetchRemoteConfig: false,
      })

      // On pagehide, switch to sendBeacon transport and flush. navigator.sendBeacon
      // is fire-and-forget and survives tab close; regular fetch() would be aborted.
      window.addEventListener('pagehide', () => {
        amplitude.setTransport('beacon')
        amplitude.flush()
      })

      this.isInitialized = true
      AnalyticsLogger.info('Amplitude initialized with first-party proxy at /api/amplitude')
    } catch (error) {
      AnalyticsLogger.error('Failed to initialize Amplitude', error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return
    try {
      amplitude.track(event.name, {
        ...event.properties,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
      })
      // Dispatch for the Live Analytics Showcase, decoupled from the analytics layer
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { name: event.name, properties: event.properties, timestamp: Date.now() }
      }))
      AnalyticsLogger.info('Event tracked', event)
    } catch (error) {
      AnalyticsLogger.error('Failed to track event', error)
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (typeof window === 'undefined') return
    try {
      amplitude.track('page_view', {
        path: pageView.path,
        title: pageView.title,
        url: window.location.href,
        ...pageView.properties,
        timestamp: new Date().toISOString(),
        source: 'portfolio',
      })
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { name: 'page_view', properties: { path: pageView.path, title: pageView.title }, timestamp: Date.now() }
      }))
      AnalyticsLogger.info('Page view tracked', pageView)
    } catch (error) {
      AnalyticsLogger.error('Failed to track page view', error)
    }
  }

  identify(userId: string, traits?: AnalyticsProperties): void {
    if (typeof window === 'undefined') return
    try {
      amplitude.setUserId(userId)
      if (traits) {
        const id = new amplitude.Identify()
        for (const [key, value] of Object.entries(traits)) {
          id.set(key, value as string | number | boolean)
        }
        amplitude.identify(id)
      }
      AnalyticsLogger.info('User identified', { userId, traits })
    } catch (error) {
      AnalyticsLogger.error('Failed to identify user', error)
    }
  }
}

class AnalyticsManager {
  private provider: AmplitudeProvider
  private isInitialized = false
  private isDisabled = false
  private lastPageView: { path: string; timestamp: number } | null = null

  constructor() {
    this.provider = new AmplitudeProvider()
  }

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    if (!canLoadAnalytics()) {
      this.isDisabled = true
      this.isInitialized = true
      AnalyticsLogger.info('Analytics disabled by browser privacy signal (DNT or GPC)')
      return
    }

    this.provider.initialize()
    this.isInitialized = true
  }

  trackEvent(event: AnalyticsEvent): void {
    if (this.isDisabled || !canLoadAnalytics()) { this.isDisabled = true; return }
    if (!this.isInitialized) this.initialize()

    const enriched: AnalyticsEvent = {
      ...event,
      properties: { ...getEventContext(), ...event.properties },
    }
    this.provider.trackEvent(enriched)
  }

  trackPageView(pageView: PageViewEvent): void {
    if (this.isDisabled || !canLoadAnalytics()) { this.isDisabled = true; return }
    if (!this.isInitialized) this.initialize()

    // Prevent identical page views fired within 1 second (e.g. double-mount edge cases)
    const now = Date.now()
    if (
      this.lastPageView &&
      this.lastPageView.path === pageView.path &&
      now - this.lastPageView.timestamp < 1000
    ) {
      AnalyticsLogger.warn('Duplicate page view suppressed', { path: pageView.path })
      return
    }
    this.lastPageView = { path: pageView.path, timestamp: now }

    const enriched: PageViewEvent = {
      ...pageView,
      properties: { ...getEventContext(), ...pageView.properties },
    }
    this.provider.trackPageView(enriched)
  }

  identify(userId: string, traits?: AnalyticsProperties): void {
    if (this.isDisabled || !canLoadAnalytics()) { this.isDisabled = true; return }
    if (!this.isInitialized) this.initialize()

    if (!userId || userId.trim().length < 5) {
      AnalyticsLogger.warn('Invalid userId: must be at least 5 characters', { userId })
      return
    }
    this.provider.identify(userId, traits)
  }
}

export const analytics = new AnalyticsManager()
