# Analytics System Architecture

## Overview

This portfolio uses a production analytics layer that routes events through:

- **Segment** — collection and downstream routing
- **Amplitude** — analytics destination via Segment

The system instruments automatic portfolio events (page view, section visibility, section navigation, resume downloads) and enriches every event with device context and UTM marketing attribution.

For full event specifications, see [TRACKING_PLAN.md](./TRACKING_PLAN.md).

---

## Runtime Flow

### Script Loading

```
RootLayout
  → AnalyticsScripts (components/analytics/analytics-scripts.tsx)
      → checks browser privacy signals (lib/analytics-consent.ts)
      → if allowed: injects Segment queue + analytics.js via next/script
```

The Segment script is only injected when:

- `NEXT_PUBLIC_SEGMENT_WRITE_KEY` is configured
- No browser-level privacy signal (DNT, GPC) opts the visitor out

### Initialization

```
AnalyticsProvider mounts
  → useAnalytics() (hooks/use-analytics.ts)
      → analytics.initialize() (lib/analytics.ts)
          → SegmentProvider: creates queue/stub, installs middleware
      → page_view fires once (deduped against window.__pageViewTracked)
```

### Event Enrichment

Every event passes through `AnalyticsManager.trackEvent()` or `trackPageView()` before reaching Segment. At that point:

```
Event created by creator function (lib/analytics-events.ts)
  → AnalyticsManager.trackEvent()
      → getEventContext() merges:
          - device/browser properties (UA, screen, viewport, timezone, etc.)
          - page_url, page_path, referrer, page_referrer
          - UTM params from sessionStorage (captured on landing)
      → enriched event sent to SegmentProvider
      → CustomEvent('analytics:event') dispatched on window
          → LiveEventsTab in AnalyticsShowcase picks this up for real-time display
```

### Section Tracking

```
User scrolls
  → IntersectionObserver (50% threshold) detects section
      → section_viewed fires once per section per session
```

### Navigation Tracking

```
User clicks an internal hash link
  → document click handler (analytics-provider.tsx)
      → section_clicked fires with click_source = "navigation"
```

### Resume Download Tracking

```
User clicks a resume link
  → ResumeDownloadLink.onClick (components/resume-download-link.tsx)
      → resume_downloaded fires with download_source = "nav" | "hero" | "contact"
      → browser opens PDF
```

---

## Event Context Enrichment

`getEventContext()` in `lib/analytics-events.ts` is called on every event at the manager level. It returns:

**Device & browser:**
`user_agent`, `browser_language`, `screen_width`, `screen_height`, `viewport_width`, `viewport_height`, `device_pixel_ratio`, `timezone`, `connection_type` (when available via `navigator.connection`)

**Page:**
`page_url`, `page_path`, `referrer`, `page_referrer`

`referrer` is stable session attribution. It is captured from `document.referrer` on the landing page, persisted in `sessionStorage` under `portfolio:referrer`, and attached to every event in the session. This is the field to use when analyzing where traffic came from.

`page_referrer` is raw current page context. It reflects the browser's `document.referrer` at the moment the event fires, which is useful for debugging and future multi-page behavior.

If the browser does not provide either value, it is normalized to `"direct"` so every event has explicit attribution fields.

**UTM attribution:**
`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

UTM values are captured from the landing URL into `sessionStorage` (`portfolio:utm` key) on first load so they persist across SPA navigations.

---

## Privacy Controls

`lib/analytics-consent.ts` checks three browser signals before any script is loaded or tracking call is made:

- `navigator.doNotTrack === "1"`
- `window.doNotTrack === "1"`
- `navigator.globalPrivacyControl === true`

When any signal is active:

- Segment scripts are not injected
- `analytics.initialize()` marks the manager as disabled
- `trackEvent`, `trackPageView`, and `identify` return without sending data

This is a conservative browser-signal opt-out, not a full consent management platform.

---

## Live Analytics Showcase

`components/analytics-showcase.tsx` renders the "Live Analytics on This Site" section. It works by listening to `analytics:event` CustomEvents dispatched on `window` after each successful Segment call:

```ts
window.addEventListener('analytics:event', handler)
```

This keeps the showcase component fully decoupled from the analytics layer — no direct imports, no shared state.

The showcase has two tabs:

- **Live Events** — real-time event stream with expandable property inspector
- **Tracking Plan** — static table of event specs + pipeline diagram

---

## Active Events

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `page_view` | App init | `path`, `title`, `referrer`, `initial_load` |
| `section_viewed` | 50% viewport intersection | `section_id`, `section_name`, `referrer`, `interaction_type` |
| `section_clicked` | Internal nav link click | `section_id`, `section_name`, `referrer`, `click_source` |
| `resume_downloaded` | Resume link click | `download_source`, `file_name`, `referrer` |

All events additionally carry the automatic context properties listed above.

---

## Tracked Sections

Defined in `components/analytics/analytics-provider.tsx`:

1. `hero`
2. `experience`
3. `projects`
4. `skills`
5. `demos`
6. `contact`

---

## Deduplication

| Guard | Location | What it prevents |
|-------|----------|-----------------|
| `globalInitialized` module flag | `hooks/use-analytics.ts` | Multiple `analytics.initialize()` calls |
| `pageViewTracked` module flag | `hooks/use-analytics.ts` | Multiple page view attempts |
| `window.__pageViewTracked` | `hooks/use-analytics.ts` | React StrictMode remount race |
| Manager-level 1s dedupe | `lib/analytics.ts` | Identical page views < 1s apart |
| `Set<string>` of viewed sections | `hooks/use-analytics.ts` | Duplicate `section_viewed` per session |
| One `AnalyticsProvider` | `app/layout.tsx` | Multiple providers |

---

## File Structure

```
app/
  layout.tsx                           # Root layout — mounts AnalyticsScripts, AnalyticsProvider
  page.tsx                             # Main portfolio page
components/
  analytics/
    analytics-provider.tsx             # Section tracking, navigation click tracking
    analytics-scripts.tsx              # next/script Segment loader
  analytics-showcase.tsx               # Live event stream + tracking plan tab UI
  resume-download-link.tsx             # Client component — fires resume_downloaded on click
hooks/
  use-analytics.ts                     # Initialization, page view, section tracking hooks
lib/
  analytics.ts                         # SegmentProvider, AnalyticsManager
  analytics-consent.ts                 # DNT / GPC browser signal checks
  analytics-events.ts                  # Event constants, types, creators, getEventContext()
middleware.ts                          # Edge Runtime — security response headers
TRACKING_PLAN.md                       # Event specifications
ANALYTICS_SYSTEM.md                    # This document
```

---

## Platform Notes

### Segment

- `analytics.js` loaded via `next/script` with `strategy="afterInteractive"`
- Queue/stub created before the script loads so no events are dropped
- Source middleware installed on `analytics.ready()`:
  - Filters user IDs shorter than 5 characters or equal to `"me"`
  - Maps `anonymousId` to Amplitude `device_id` when no valid `userId` exists

### Amplitude

- Reached through the Segment destination — no Amplitude SDK loaded directly
- `device_id` derived from `anonymousId` ensures session continuity without a `userId`

---

## Environment Variables

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key
```

If the variable is missing, Segment is silently skipped and a development warning is logged.
