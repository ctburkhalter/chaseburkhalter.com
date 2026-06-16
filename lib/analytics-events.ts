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

// Persist the landing referrer so every event in the session carries the same
// traffic attribution, even if later SPA interactions happen after navigation.
function captureInitialReferrer(): string {
  if (typeof window === 'undefined') return 'direct'

  const stored = sessionStorage.getItem(SESSION_REFERRER_KEY)
  if (stored) return stored

  const referrer = document.referrer || 'direct'
  sessionStorage.setItem(SESSION_REFERRER_KEY, referrer)
  return referrer
}

export function getEventContext(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } }
  const referrer = captureInitialReferrer()
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
    referrer,
    page_referrer: document.referrer || 'direct',
    // UTM / marketing attribution
    ...captureUtmParams(),
  }
}

// Keep the old name as an alias so any direct callers aren't broken.
export const getDeviceContext = getEventContext

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
