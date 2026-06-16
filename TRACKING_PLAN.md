# Analytics Tracking Plan

## Overview

This document defines the event tracking specification for `chaseburkhalter.com`.

Events are routed to:

- **Segment** as the customer data platform
- **Google Tag Manager** as the tag manager
- **Amplitude** through the Segment destination

Analytics loading is privacy-aware: browser Do Not Track and Global Privacy Control signals prevent third-party analytics scripts from loading and make tracking calls no-op.

## Naming Conventions

### Event Names

- Format: `snake_case`
- Examples: `page_view`, `section_viewed`, `section_clicked`

### Property Names

- Format: `snake_case`
- Examples: `section_id`, `click_source`, `user_agent`

### Reserved Properties

These properties are added by the analytics manager or event helpers:

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | string | ISO 8601 event timestamp |
| `source` | string | Always `"portfolio"` |

## Event Catalog

### `page_view`

**Description**: Tracks the initial portfolio page load.

**When to fire**: Automatically after analytics initializes.

**Frequency**: Once per app session, with additional manager-level dedupe for identical page views inside one second.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `path` | string | Yes | URL pathname | `"/"` |
| `title` | string | Yes | Document title | `"Chase Burkhalter \| Senior Data & Analytics Engineer"` |
| `url` | string | Yes | Full URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | No | HTTP referrer | `"https://google.com"` |
| `hash` | string | No | URL hash | `"#projects"` |
| `initial_load` | boolean | Yes | Initial page-load marker | `true` |

Example payload:

```json
{
  "event": "page_view",
  "properties": {
    "path": "/",
    "title": "Chase Burkhalter | Senior Data & Analytics Engineer",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://google.com",
    "hash": "",
    "initial_load": true,
    "timestamp": "2026-06-15T20:30:00.000Z",
    "source": "portfolio"
  }
}
```

### `section_viewed`

**Description**: Tracks when a portfolio section becomes visible.

**When to fire**: Automatically when an observed section reaches at least 50% visibility.

**Frequency**: Once per section per session.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | DOM ID of section | `"projects"` |
| `section_name` | string | Yes | Human-readable section name | `"Projects"` |
| `interaction_type` | string | Yes | Always `"scroll"` | `"scroll"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

Example payload:

```json
{
  "event": "section_viewed",
  "properties": {
    "section_id": "projects",
    "section_name": "Projects",
    "interaction_type": "scroll",
    "url": "https://chaseburkhalter.com/",
    "timestamp": "2026-06-15T20:31:00.000Z",
    "source": "portfolio"
  }
}
```

Tracked sections:

- `hero`
- `experience`
- `projects`
- `skills`
- `demos`
- `contact`

### `section_clicked`

**Description**: Tracks clicks on internal section navigation links.

**When to fire**: Automatically when a user clicks an `a[href^="#"]` link targeting a tracked section.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | Target section ID | `"contact"` |
| `section_name` | string | Yes | Human-readable section name | `"Contact"` |
| `click_source` | string | Yes | Click origin | `"navigation"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

Example payload:

```json
{
  "event": "section_clicked",
  "properties": {
    "section_id": "contact",
    "section_name": "Contact",
    "click_source": "navigation",
    "url": "https://chaseburkhalter.com/",
    "timestamp": "2026-06-15T20:32:00.000Z",
    "source": "portfolio"
  }
}
```

### `portfolio_interaction`

**Description**: Generic manual interaction event for future portfolio UI interactions.

**When to fire**: When a component intentionally calls `createPortfolioInteractionEvent()` and `trackEvent()`.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `action` | string | Yes | Action performed | `"project_card_view"` |
| `interaction_type` | string | Yes | Human-readable interaction type | `"Project Card View"` |
| `portfolio_section` | string | No | Section where interaction occurred | `"projects"` |
| `user_agent` | string | No | Browser user agent | `"Mozilla/5.0..."` |

Recommended actions:

- `project_card_view`
- `skill_badge_click`
- `contact_form_view`

Example payload:

```json
{
  "event": "portfolio_interaction",
  "properties": {
    "action": "project_card_view",
    "interaction_type": "Project Card View",
    "portfolio_section": "projects",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2026-06-15T20:33:00.000Z",
    "source": "portfolio"
  }
}
```

### `error_occurred`

**Description**: Standard shape for future component-level error tracking.

**Current status**: Helper exists in `lib/analytics-events.ts`, but the current app does not mount a React error boundary tracker. Analytics script errors are caught by `AnalyticsProvider` and logged in development without sending this event.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `error_type` | string | Yes | Error category | `"component"` |
| `error_message` | string | Yes | Error message | `"Cannot read property..."` |
| `error_stack` | string | No | JavaScript stack trace | `"Error: ..."` |
| `component_stack` | string | No | React component stack | `"at ProjectCard..."` |

### `user_identified`

**Description**: Associates a valid user ID with the current analytics session.

**Current status**: Supported by `analytics.identify()` and `useTrackEvent().identifyUser()`, but the current portfolio UI does not collect user IDs.

Validation rules:

- `user_id` must be at least five characters
- invalid IDs such as `"me"`, empty strings, or `null` are filtered
- Segment middleware removes invalid IDs before destination delivery

GTM event shape:

```json
{
  "event": "user_identify",
  "user_id": "user@example.com",
  "user_traits": {
    "visited_portfolio": true,
    "visited_at": "2026-06-15T20:34:00.000Z"
  },
  "identified_at": "2026-06-15T20:34:00.000Z",
  "source": "portfolio"
}
```

## Platform Implementation

### Segment

Segment is loaded through `components/analytics/analytics-scripts.tsx` with `next/script`.

Event calls:

```ts
window.analytics.track(eventName, properties)
window.analytics.page(pageName, properties)
window.analytics.identify(userId, traits)
```

Special handling:

- invalid user IDs are removed
- `anonymousId` is mapped to Amplitude `device_id` when no valid `userId` exists
- events queue until Segment is ready

### Google Tag Manager

GTM is loaded through `components/analytics/analytics-scripts.tsx` with `next/script`.

Event calls:

```ts
window.dataLayer.push({
  event: eventName,
  ...properties
})
```

Special handling:

- `window.__portfolioGtmInitialized` prevents duplicate GTM initialization
- event properties are flattened onto the `dataLayer` event object

### Amplitude

Amplitude receives events through the Segment destination. The app does not load the Amplitude SDK directly.

Requirements handled by the app:

- user IDs must be at least five characters
- events without user IDs receive an Amplitude `device_id` derived from Segment `anonymousId`

## Privacy & Compliance

The app checks browser privacy signals before loading third-party analytics scripts:

- Do Not Track: `navigator.doNotTrack === "1"`
- legacy Do Not Track: `window.doNotTrack === "1"`
- Global Privacy Control: `navigator.globalPrivacyControl === true`

When a privacy signal is enabled:

- Segment and GTM scripts are not injected
- analytics initialization is marked disabled
- tracking and identify calls return without sending data

PII guidance:

- Do not collect user IDs unless intentionally needed
- Prefer pseudonymous IDs over emails
- Do not send sensitive personal data in event properties

## Implementation Examples

Track a manual event:

```ts
import { createPortfolioInteractionEvent } from "@/lib/analytics-events"
import { useTrackEvent } from "@/hooks/use-analytics"

const { trackEvent } = useTrackEvent()

trackEvent(
  createPortfolioInteractionEvent("project_card_view", "Project Card View", {
    portfolio_section: "projects",
  })
)
```

Identify a user intentionally:

```ts
import { useTrackEvent } from "@/hooks/use-analytics"

const { identifyUser } = useTrackEvent()

identifyUser("user@example.com", {
  visited_portfolio: true,
  visited_at: new Date().toISOString(),
})
```

## Testing & Validation

Development checks:

- verify `[Analytics]` logs in the browser console
- confirm Segment requests to `api.segment.io`
- use GTM Preview Mode for tag firing
- confirm no third-party analytics scripts load when Do Not Track or Global Privacy Control is enabled

Production checks:

- Segment Debugger shows page and section events
- GTM Preview Mode receives `page_view`, `section_viewed`, and `section_clicked`
- Amplitude receives events through the Segment destination

## Troubleshooting

Events not firing:

- confirm `NEXT_PUBLIC_SEGMENT_WRITE_KEY` and `NEXT_PUBLIC_GTM_CONTAINER_ID`
- check whether Do Not Track or Global Privacy Control is enabled
- inspect browser console in development
- verify `AnalyticsProvider` is mounted in `app/layout.tsx`

Duplicate events:

- check `pageViewTracked`, `window.__pageViewTracked`, and manager-level page-view dedupe
- verify there is only one `AnalyticsProvider`
- remember React StrictMode can remount effects in development

Events missing in Amplitude:

- verify the Amplitude destination is connected in Segment
- confirm user ID validation is not dropping an intentionally supplied ID
- confirm middleware is mapping `anonymousId` to `device_id`

## Maintenance

When adding events:

1. Add the event to this tracking plan.
2. Add or update constants and types in `lib/analytics-events.ts`.
3. Use a helper builder where possible.
4. Test in development.
5. Validate in Segment, GTM, and Amplitude.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-06-15 | Updated for `next/script` loading, browser privacy-signal handling, and removal of interactive demo tracking |
| 1.0.0 | 2025-01-15 | Initial tracking plan |
