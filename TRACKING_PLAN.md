# Analytics Tracking Plan

## Overview

This document defines the event tracking specification for `chaseburkhalter.com`.

Events are routed through:

- **Segment** — customer data platform for collection and routing
- **Amplitude** — analytics destination via Segment

Analytics loading is privacy-aware: browser Do Not Track and Global Privacy Control signals prevent third-party scripts from loading and make all tracking calls no-ops.

## Naming Conventions

### Event Names

- Format: `snake_case`
- Examples: `page_view`, `section_viewed`, `resume_downloaded`

### Property Names

- Format: `snake_case`
- Examples: `section_id`, `click_source`, `utm_source`

## Automatic Context Properties

Every event — regardless of type — is automatically enriched by `AnalyticsManager` before it reaches Segment or GTM. No manual effort is needed in event creators or components.

### Reserved Properties (added by `lib/analytics.ts`)

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp, added by Segment/GTM providers |
| `source` | string | Always `"portfolio"` |

### Device Context (added by `getEventContext()` in `lib/analytics-events.ts`)

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `user_agent` | string | Full browser user agent string | `"Mozilla/5.0 (Macintosh...)"` |
| `browser_language` | string | `navigator.language` | `"en-US"` |
| `screen_width` | number | Physical screen width in px | `1920` |
| `screen_height` | number | Physical screen height in px | `1080` |
| `viewport_width` | number | Browser viewport width in px | `1440` |
| `viewport_height` | number | Browser viewport height in px | `900` |
| `device_pixel_ratio` | number | Device pixel ratio | `2` |
| `timezone` | string | IANA timezone | `"America/Chicago"` |
| `connection_type` | string | Effective connection type (if supported) | `"4g"` |
| `page_url` | string | Full current URL | `"https://chaseburkhalter.com/"` |
| `page_path` | string | URL pathname | `"/"` |
| `page_referrer` | string | HTTP referrer (if present) | `"https://linkedin.com"` |

### UTM / Marketing Attribution

UTM parameters are captured from the landing URL on first load and persisted to `sessionStorage` under the key `portfolio:utm`. This ensures attribution survives SPA navigations that would otherwise strip query strings. All subsequent events in the session carry the original UTM values.

| Property | Type | Description |
|----------|------|-------------|
| `utm_source` | string | Traffic source | `"linkedin"` |
| `utm_medium` | string | Marketing medium | `"social"` |
| `utm_campaign` | string | Campaign name | `"job_search_2026"` |
| `utm_term` | string | Paid search term | `"analytics engineer"` |
| `utm_content` | string | Ad content variant | `"resume_cta"` |

UTM properties are only present when the corresponding parameter exists in the URL.

## Event Catalog

### `page_view`

**Description**: Tracks the initial portfolio page load.

**When to fire**: Automatically after analytics initializes.

**Frequency**: Once per session. Manager-level deduplication drops identical page views within one second.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `path` | string | Yes | URL pathname | `"/"` |
| `title` | string | Yes | Document title | `"Chase Burkhalter \| Senior Analytics Engineer"` |
| `url` | string | Yes | Full URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | No | HTTP referrer | `"https://linkedin.com"` |
| `hash` | string | No | URL hash | `""` |
| `initial_load` | boolean | Yes | Initial page-load marker | `true` |

Example payload (device context and UTM properties omitted for brevity):

```json
{
  "event": "page_view",
  "properties": {
    "path": "/",
    "title": "Chase Burkhalter | Senior Analytics Engineer",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "hash": "",
    "initial_load": true,
    "utm_source": "linkedin",
    "utm_medium": "social",
    "browser_language": "en-US",
    "viewport_width": 1440,
    "timezone": "America/Chicago",
    "timestamp": "2026-06-16T10:00:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `section_viewed`

**Description**: Tracks when a portfolio section becomes visible.

**When to fire**: Automatically when an observed section reaches at least 50% viewport visibility.

**Frequency**: Once per section per session (tracked in a `Set` inside `useSectionTracking`).

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | DOM `id` of the section | `"projects"` |
| `section_name` | string | Yes | Human-readable name | `"Projects"` |
| `interaction_type` | string | Yes | Always `"scroll"` | `"scroll"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

Tracked sections (defined in `components/analytics/analytics-provider.tsx`):

- `hero`
- `experience`
- `projects`
- `skills`
- `demos`
- `contact`

Example payload:

```json
{
  "event": "section_viewed",
  "properties": {
    "section_id": "projects",
    "section_name": "Projects",
    "interaction_type": "scroll",
    "url": "https://chaseburkhalter.com/",
    "timestamp": "2026-06-16T10:01:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `section_clicked`

**Description**: Tracks clicks on internal section navigation links.

**When to fire**: When a user clicks an `a[href^="#"]` link targeting a tracked section.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | Target section DOM `id` | `"contact"` |
| `section_name` | string | Yes | Human-readable name | `"Contact"` |
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
    "timestamp": "2026-06-16T10:02:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `resume_downloaded`

**Description**: Tracks when a visitor opens the resume PDF.

**When to fire**: On click of any resume download link. Fired by `components/resume-download-link.tsx` before the browser opens the PDF.

**Sources**: Three entry points, each tagged with a distinct `source` value.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `source` | string | Yes | Where the download was triggered | `"hero"`, `"nav"`, `"contact"` |
| `file_name` | string | Yes | PDF filename | `"Chase_Burkhalter_Resume_2026.pdf"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

Example payload:

```json
{
  "event": "resume_downloaded",
  "properties": {
    "source": "hero",
    "file_name": "Chase_Burkhalter_Resume_2026.pdf",
    "url": "https://chaseburkhalter.com/",
    "utm_source": "linkedin",
    "utm_medium": "social",
    "browser_language": "en-US",
    "viewport_width": 390,
    "device_pixel_ratio": 3,
    "timezone": "America/New_York",
    "timestamp": "2026-06-16T10:03:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `user_identified`

**Description**: Associates a valid user ID with the current analytics session.

**Current status**: Supported by `analytics.identify()` in `lib/analytics.ts`. The current portfolio UI does not collect user IDs — this event exists for future use.

Validation rules:

- `user_id` must be at least 5 characters
- Values like `"me"`, empty strings, or `null` are rejected at the manager level
- Segment middleware removes invalid IDs before delivery to any destination

GTM `dataLayer` shape:

```json
{
  "event": "user_identify",
  "user_id": "user@example.com",
  "user_traits": { "visited_portfolio": true },
  "identified_at": "2026-06-16T10:04:00.000Z",
  "source": "portfolio"
}
```

---

## Platform Implementation

### Segment

Segment is loaded in `components/analytics/analytics-scripts.tsx` via `next/script`.

```ts
window.analytics.track(eventName, properties)
window.analytics.page(pageName, properties)
window.analytics.identify(userId, traits)
```

Special handling:

- Queue/stub is created before the Segment script loads so events never drop
- Middleware filters invalid user IDs before delivery
- `anonymousId` is mapped to Amplitude `device_id` when no valid `userId` exists

### Amplitude

Amplitude receives events through the Segment destination. The Amplitude SDK is not loaded directly.

Requirements enforced by the app:

- User IDs must be at least 5 characters
- Events without a user ID receive an Amplitude `device_id` derived from `anonymousId`

---

## Privacy & Compliance

Analytics scripts are not loaded and all tracking calls no-op when any of the following browser signals are set:

- `navigator.doNotTrack === "1"`
- `window.doNotTrack === "1"`
- `navigator.globalPrivacyControl === true`

Implemented in `lib/analytics-consent.ts`. This is a conservative browser-signal opt-out, not a full consent management platform.

PII guidance:

- Do not collect user IDs unless intentionally needed
- Prefer pseudonymous identifiers over email addresses
- Do not send sensitive personal data in event properties

---

## Adding New Events

1. Add the event name constant to the appropriate group in `lib/analytics-events.ts`
2. Add property interface extending `BaseEventProperties`
3. Add the event to `ANALYTICS_EVENTS`
4. Write a creator function (`createXxxEvent`)
5. Add to this tracking plan
6. Validate in Segment Debugger, GTM Preview Mode, and Amplitude

---

## Testing & Validation

Development:

- `[Analytics]` prefixed logs appear in the browser console
- Segment sends requests to `api.segment.io`
- GTM Preview Mode shows tag firing
- No analytics scripts load when DNT or GPC is enabled

Production:

- Segment Debugger shows all event types with enriched properties
- GTM Preview Mode receives events including `resume_downloaded`
- Amplitude events arrive through the Segment destination

---

## Troubleshooting

**Events not firing:**

- Confirm `NEXT_PUBLIC_SEGMENT_WRITE_KEY` and `NEXT_PUBLIC_GTM_CONTAINER_ID` are set
- Check whether DNT or GPC is enabled in the browser
- Verify `AnalyticsProvider` is mounted in `app/layout.tsx`

**Duplicate events:**

- Check `pageViewTracked`, `window.__pageViewTracked`, and the manager-level dedupe in `lib/analytics.ts`
- Verify only one `AnalyticsProvider` is mounted
- React StrictMode remounts effects in development — this is expected

**Events missing in Amplitude:**

- Verify the Amplitude destination is connected in Segment
- Confirm `anonymousId` is being mapped to `device_id` via Segment middleware

**UTM properties missing:**


- Confirm the landing URL included UTM params
- Check `sessionStorage` for the `portfolio:utm` key — it should hold the captured values

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.1.0 | 2026-06-16 | Removed GTM — events route Segment → Amplitude directly |
| 3.0.0 | 2026-06-16 | Added `resume_downloaded` event; added automatic device context and UTM enrichment on all events; removed `portfolio_interaction` and `error_occurred` (no longer implemented); updated implementation examples |
| 2.0.0 | 2026-06-15 | Updated for `next/script` loading, browser privacy-signal handling |
| 1.0.0 | 2025-01-15 | Initial tracking plan |
