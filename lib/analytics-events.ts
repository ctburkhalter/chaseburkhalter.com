// Analytics Events Registry — event names, property types, and creator functions

// ============================================================================
// EVENT NAMES
// ============================================================================

export const PAGE_EVENTS = {
  PAGE_VIEW: 'page_view',
} as const

export const SECTION_EVENTS = {
  SECTION_VIEWED: 'section_viewed',
  SECTION_CLICKED: 'section_clicked',
} as const

export const DOWNLOAD_EVENTS = {
  RESUME_DOWNLOADED: 'resume_downloaded',
} as const

export const ANALYTICS_EVENTS = {
  ...PAGE_EVENTS,
  ...SECTION_EVENTS,
  ...DOWNLOAD_EVENTS,
} as const

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]
export type SectionId = string

export interface BaseEventProperties {
  timestamp?: string
  source?: string
}

export interface SectionViewedProperties extends BaseEventProperties {
  section_id: SectionId
  section_name: string
  interaction_type: 'scroll'
  url: string
}

export interface SectionClickedProperties extends BaseEventProperties {
  section_id: SectionId
  section_name: string
  click_source: string
  url: string
}

export interface ResumeDownloadedProperties extends BaseEventProperties {
  download_source: string
  file_name: string
  url: string
}

export interface AnalyticsEventPayload<T extends BaseEventProperties = BaseEventProperties> {
  name: AnalyticsEventName | string
  properties?: T
}

export type SectionViewedEvent = AnalyticsEventPayload<SectionViewedProperties>
export type SectionClickedEvent = AnalyticsEventPayload<SectionClickedProperties>
export type ResumeDownloadedEvent = AnalyticsEventPayload<ResumeDownloadedProperties>

// ============================================================================
// EVENT CONTEXT
// Collected once per event at the manager level and merged into all payloads.
// ============================================================================

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const SESSION_UTM_KEY = 'portfolio:utm'
const SESSION_REFERRER_KEY = 'portfolio:referrer'

// Persist UTM params from the initial landing URL into sessionStorage so they
// survive SPA navigations that strip query strings from the URL bar.
function captureUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  const stored = sessionStorage.getItem(SESSION_UTM_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* ignore */ }
  }

  const params = new URLSearchParams(window.location.search)
  const captured: Record<string, string> = {}
  for (const key of UTM_PARAMS) {
    const val = params.get(key)
    if (val) captured[key] = val
  }

  if (Object.keys(captured).length > 0) {
    sessionStorage.setItem(SESSION_UTM_KEY, JSON.stringify(captured))
  }
  return captured
}

// Capture the landing-page referrer once and persist it for the session.
// In a SPA, document.referrer is empty after the first navigation because no
// full-page load occurs. Persisting to sessionStorage means all events in a
// session carry the original traffic source, not just the page_view.
function captureSessionReferrer(): string {
  if (typeof window === 'undefined') return 'direct'

  const stored = sessionStorage.getItem(SESSION_REFERRER_KEY)
  if (stored) return stored

  const referrer = document.referrer || 'direct'
  sessionStorage.setItem(SESSION_REFERRER_KEY, referrer)
  return referrer
}

// Distinguish real page views from browser refreshes using the Navigation
// Timing API. Prevents reloads from inflating unique page view counts in
// Amplitude. Falls back to the deprecated performance.navigation API for
// older browsers that don't support getEntriesByType.
function getIsPageReload(): boolean {
  const entries = performance.getEntriesByType?.('navigation')
  if (entries?.length) {
    return (entries[0] as PerformanceNavigationTiming).type === 'reload'
  }
  if (performance.navigation) {
    return performance.navigation.type === performance.navigation.TYPE_RELOAD
  }
  return false
}

// Generate a stable 13-digit random integer once per page load and cache it on
// window.__pageEventLinkId. Every event in the same page load shares this ID,
// making it possible to group all events from a single load in Amplitude even
// when session boundaries or user IDs change.
function getPageEventLinkId(): number {
  if (typeof window === 'undefined') return 0
  if (!window.__pageEventLinkId) {
    const buf = new Uint8Array(7)
    crypto.getRandomValues(buf)
    const digits = Array.from(buf).map(b => b % 10)
    // Ensure the leading digit is non-zero to preserve the 13-digit length
    if (digits[0] === 0) digits[0] = (crypto.getRandomValues(new Uint8Array(1))[0] % 9) + 1
    window.__pageEventLinkId = parseInt(digits.slice(0, 13).join(''), 10)
  }
  return window.__pageEventLinkId
}

export function getEventContext(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } }
  return {
    // Device & browser
    user_agent: navigator.userAgent,
    browser_language: navigator.language,
    screen_width: screen.width,
    screen_height: screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...(nav.connection?.effectiveType ? { connection_type: nav.connection.effectiveType } : {}),
    // Page
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: captureSessionReferrer(),
    page_referrer: document.referrer || 'direct',
    is_page_reload: getIsPageReload(),
    page_event_link_id: getPageEventLinkId(),
    // UTM / marketing attribution
    ...captureUtmParams(),
  }
}

// ============================================================================
// EVENT CREATORS
// ============================================================================

export function createSectionViewedEvent(sectionId: SectionId, sectionName: string): SectionViewedEvent {
  return {
    name: ANALYTICS_EVENTS.SECTION_VIEWED,
    properties: {
      section_id: sectionId,
      section_name: sectionName,
      interaction_type: 'scroll',
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  }
}

export function createSectionClickedEvent(
  sectionId: SectionId,
  sectionName: string,
  clickSource: string = 'navigation'
): SectionClickedEvent {
  return {
    name: ANALYTICS_EVENTS.SECTION_CLICKED,
    properties: {
      section_id: sectionId,
      section_name: sectionName,
      click_source: clickSource,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  }
}

export function createResumeDownloadedEvent(source: string): ResumeDownloadedEvent {
  return {
    name: ANALYTICS_EVENTS.RESUME_DOWNLOADED,
    properties: {
      download_source: source,
      file_name: 'Chase_Burkhalter_Resume_2026.pdf',
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  }
}

declare global {
  interface Window {
    __pageEventLinkId?: number
  }
}
