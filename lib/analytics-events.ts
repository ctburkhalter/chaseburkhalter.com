/**
 * Analytics Events Registry
 *
 * Centralized event names and property definitions for consistent tracking
 * across all analytics platforms (Segment, GTM, Amplitude)
 *
 * @see TRACKING_PLAN.md for detailed event specifications
 */

// ============================================================================
// EVENT NAMES (Constants)
// ============================================================================

/**
 * Page Events
 */
export const PAGE_EVENTS = {
  PAGE_VIEW: 'page_view',
} as const

/**
 * Section Events
 */
export const SECTION_EVENTS = {
  SECTION_VIEWED: 'section_viewed',
  SECTION_CLICKED: 'section_clicked',
} as const

/**
 * User Events
 */
export const USER_EVENTS = {
  USER_IDENTIFIED: 'user_identified',
} as const

/**
 * Interaction Events
 */
export const INTERACTION_EVENTS = {
  PORTFOLIO_INTERACTION: 'portfolio_interaction',
} as const

/**
 * Error Events
 */
export const ERROR_EVENTS = {
  ERROR_OCCURRED: 'error_occurred',
} as const

/**
 * Custom Events
 */
export const CUSTOM_EVENTS = {
  CUSTOM_EVENT: 'custom_event',
} as const

/**
 * All Events (Union of all event constants)
 */
export const ANALYTICS_EVENTS = {
  ...PAGE_EVENTS,
  ...SECTION_EVENTS,
  ...USER_EVENTS,
  ...INTERACTION_EVENTS,
  ...ERROR_EVENTS,
  ...CUSTOM_EVENTS,
} as const

// ============================================================================
// PROPERTY NAMES (Constants)
// ============================================================================

/**
 * Common properties used across multiple events
 */
export const COMMON_PROPERTIES = {
  TIMESTAMP: 'timestamp',
  SOURCE: 'source',
  URL: 'url',
} as const

/**
 * Page properties
 */
export const PAGE_PROPERTIES = {
  PATH: 'path',
  TITLE: 'title',
  REFERRER: 'referrer',
  HASH: 'hash',
  INITIAL_LOAD: 'initial_load',
} as const

/**
 * Section properties
 */
export const SECTION_PROPERTIES = {
  SECTION_ID: 'section_id',
  SECTION_NAME: 'section_name',
  INTERACTION_TYPE: 'interaction_type',
  CLICK_SOURCE: 'click_source',
} as const

/**
 * Interaction properties
 */
export const INTERACTION_PROPERTIES = {
  ACTION: 'action',
  PORTFOLIO_SECTION: 'portfolio_section',
  DEMO_SECTION: 'demo_section',
  USER_AGENT: 'user_agent',
} as const

/**
 * Error properties
 */
export const ERROR_PROPERTIES = {
  ERROR_TYPE: 'error_type',
  ERROR_MESSAGE: 'error_message',
  ERROR_STACK: 'error_stack',
  COMPONENT_STACK: 'component_stack',
} as const

/**
 * User properties
 */
export const USER_PROPERTIES = {
  VISITED_PORTFOLIO: 'visited_portfolio',
  VISITED_AT: 'visited_at',
  SOURCE: 'source',
} as const

// ============================================================================
// SECTION IDs (Constants)
// ============================================================================

/**
 * Valid section IDs on the portfolio page
 */
export const SECTION_IDS = {
  HERO: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  DEMOS: 'demos',
  CONTACT: 'contact',
} as const

// ============================================================================
// INTERACTION ACTIONS (Constants)
// ============================================================================

/**
 * Valid interaction action types
 */
export const INTERACTION_ACTIONS = {
  PROJECT_CARD_VIEW: 'project_card_view',
  SKILL_BADGE_CLICK: 'skill_badge_click',
  ANALYTICS_DEMO_INTERACTION: 'analytics_demo_interaction',
  CONTACT_FORM_VIEW: 'contact_form_view',
  TRACKING_ENABLED: 'tracking_enabled',
  TRACKING_DISABLED: 'tracking_disabled',
} as const

/**
 * Error types
 */
export const ERROR_TYPES = {
  BOUNDARY: 'boundary',
  COMPONENT: 'component',
} as const

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Event names type (string literals)
 */
export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

/**
 * Section ID type
 */
export type SectionId = typeof SECTION_IDS[keyof typeof SECTION_IDS]

/**
 * Interaction action type
 */
export type InteractionAction = typeof INTERACTION_ACTIONS[keyof typeof INTERACTION_ACTIONS]

/**
 * Error type
 */
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES]

// ============================================================================
// EVENT PROPERTY INTERFACES
// ============================================================================

/**
 * Base properties included in all events
 */
export interface BaseEventProperties {
  timestamp?: string
  source?: string
}

/**
 * Page View Event Properties
 */
export interface PageViewProperties extends BaseEventProperties {
  path: string
  title: string
  url: string
  referrer?: string
  hash?: string
  initial_load: boolean
}

/**
 * Section Viewed Event Properties
 */
export interface SectionViewedProperties extends BaseEventProperties {
  section_id: SectionId | string
  section_name: string
  interaction_type: 'scroll'
  url: string
}

/**
 * Section Clicked Event Properties
 */
export interface SectionClickedProperties extends BaseEventProperties {
  section_id: SectionId | string
  section_name: string
  click_source: string
  url: string
}

/**
 * Portfolio Interaction Event Properties
 */
export interface PortfolioInteractionProperties extends BaseEventProperties {
  action: InteractionAction | string
  interaction_type: string
  portfolio_section?: string
  demo_section?: boolean
  user_agent?: string
}

/**
 * Error Occurred Event Properties
 */
export interface ErrorOccurredProperties extends BaseEventProperties {
  error_type: ErrorType
  error_message: string
  error_stack?: string
  component_stack?: string
}

/**
 * Custom Event Properties
 */
export interface CustomEventProperties extends BaseEventProperties {
  portfolio_demo?: boolean
  [key: string]: any
}

/**
 * User Identification Traits
 */
export interface UserIdentificationTraits {
  visited_portfolio?: boolean
  visited_at?: string
  source?: string
  [key: string]: any
}

// ============================================================================
// EVENT PAYLOAD TYPES
// ============================================================================

/**
 * Generic event payload structure
 */
export interface AnalyticsEventPayload<T extends BaseEventProperties = BaseEventProperties> {
  name: AnalyticsEventName | string
  properties?: T
}

/**
 * Specific event payload types for type safety
 */
export type PageViewEvent = AnalyticsEventPayload<PageViewProperties>
export type SectionViewedEvent = AnalyticsEventPayload<SectionViewedProperties>
export type SectionClickedEvent = AnalyticsEventPayload<SectionClickedProperties>
export type PortfolioInteractionEvent = AnalyticsEventPayload<PortfolioInteractionProperties>
export type ErrorOccurredEvent = AnalyticsEventPayload<ErrorOccurredProperties>
export type CustomEvent = AnalyticsEventPayload<CustomEventProperties>

/**
 * Union of all event payload types
 */
export type AnyAnalyticsEvent =
  | PageViewEvent
  | SectionViewedEvent
  | SectionClickedEvent
  | PortfolioInteractionEvent
  | ErrorOccurredEvent
  | CustomEvent

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a standardized page view event payload
 */
export function createPageViewEvent(
  path: string,
  title: string,
  options?: Partial<PageViewProperties>
): PageViewEvent {
  return {
    name: ANALYTICS_EVENTS.PAGE_VIEW,
    properties: {
      path,
      title,
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      initial_load: true,
      ...options,
    },
  }
}

/**
 * Creates a standardized section viewed event payload
 */
export function createSectionViewedEvent(
  sectionId: SectionId | string,
  sectionName: string
): SectionViewedEvent {
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

/**
 * Creates a standardized section clicked event payload
 */
export function createSectionClickedEvent(
  sectionId: SectionId | string,
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

/**
 * Creates a standardized portfolio interaction event payload
 */
export function createPortfolioInteractionEvent(
  action: InteractionAction | string,
  interactionType: string,
  options?: Partial<PortfolioInteractionProperties>
): PortfolioInteractionEvent {
  return {
    name: ANALYTICS_EVENTS.PORTFOLIO_INTERACTION,
    properties: {
      action,
      interaction_type: interactionType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...options,
    },
  }
}

/**
 * Creates a standardized error event payload
 */
export function createErrorEvent(
  errorType: ErrorType,
  error: Error,
  componentStack?: string
): ErrorOccurredEvent {
  return {
    name: ANALYTICS_EVENTS.ERROR_OCCURRED,
    properties: {
      error_type: errorType,
      error_message: error.message,
      error_stack: error.stack,
      component_stack: componentStack,
    },
  }
}

/**
 * Creates a custom event payload
 */
export function createCustomEvent(
  eventName: string,
  properties?: CustomEventProperties
): CustomEvent {
  return {
    name: eventName,
    properties: {
      portfolio_demo: true,
      ...properties,
    },
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates if a string is a valid event name
 */
export function isValidEventName(eventName: string): eventName is AnalyticsEventName {
  return Object.values(ANALYTICS_EVENTS).includes(eventName as AnalyticsEventName)
}

/**
 * Validates if a string is a valid section ID
 */
export function isValidSectionId(sectionId: string): sectionId is SectionId {
  return Object.values(SECTION_IDS).includes(sectionId as SectionId)
}

/**
 * Validates if a string is a valid interaction action
 */
export function isValidInteractionAction(action: string): action is InteractionAction {
  return Object.values(INTERACTION_ACTIONS).includes(action as InteractionAction)
}

/**
 * Validates user ID meets minimum requirements
 */
export function isValidUserId(userId: string): boolean {
  return userId != null && userId.trim().length >= 5
}
