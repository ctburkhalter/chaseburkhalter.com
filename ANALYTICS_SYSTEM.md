# Analytics System Architecture

## Overview

This portfolio uses a small production analytics layer that routes events to:

- **Segment** for collection and downstream routing
- **Google Tag Manager** for tag orchestration
- **Amplitude** through the Segment destination

The current implementation focuses on automatic portfolio instrumentation: one initial page view, section visibility, section navigation clicks, and optional manual events through shared helpers.

For event specifications, see [TRACKING_PLAN.md](./TRACKING_PLAN.md).

## Runtime Flow

### Script Loading

Analytics scripts are loaded in `components/analytics/analytics-scripts.tsx` with `next/script`.

```
RootLayout
  -> AnalyticsScripts
      -> checks browser privacy signals
      -> loads Segment queue + analytics.js when configured
      -> loads GTM dataLayer queue + gtm.js when configured
```

Scripts are only injected when:

- `NEXT_PUBLIC_SEGMENT_WRITE_KEY` or `NEXT_PUBLIC_GTM_CONTAINER_ID` is configured
- Browser-level privacy signals do not opt the visitor out

There is intentionally no GTM `<noscript>` iframe fallback. The portfolio favors honoring browser privacy signals over collecting analytics from JavaScript-disabled sessions.

### Initialization

```
AnalyticsProvider mounts
  -> useAnalytics()
      -> analytics.initialize()
      -> SegmentProvider initializes queue/middleware
      -> GTMProvider initializes dataLayer
      -> initial page_view fires once
```

### Section Tracking

```
User scrolls
  -> IntersectionObserver detects 50% visibility
      -> section_viewed fires once per section per session
```

### Navigation Tracking

```
User clicks an internal hash link
  -> document click handler detects a tracked section href
      -> section_clicked fires with click_source = "navigation"
```

## Privacy Controls

Analytics respects browser-level privacy signals in `lib/analytics-consent.ts`:

- `navigator.doNotTrack === "1"`
- `window.doNotTrack === "1"`
- `navigator.globalPrivacyControl === true`

When any of these are enabled:

- Segment and GTM scripts are not injected
- `analytics.initialize()` marks analytics as disabled
- `trackEvent`, `trackPageView`, and `identify` no-op

This is not a full consent-management platform; it is a conservative browser-signal opt-out guard.

## Tracked Sections

The active section list lives in `components/analytics/analytics-provider.tsx`:

1. `hero`
2. `experience`
3. `projects`
4. `skills`
5. `demos`
6. `contact`

The `demos` section is now a static analytics proof-point section, not an interactive demo component.

## Active Events

### `page_view`

Fires once after the app initializes analytics.

Key properties: `path`, `title`, `referrer`, `url`, `hash`, `initial_load`, `timestamp`, `source`

### `section_viewed`

Fires once per tracked section when at least 50% of that section is visible.

Key properties: `section_id`, `section_name`, `interaction_type`, `url`, `timestamp`, `source`

### `section_clicked`

Fires when a tracked internal navigation link is clicked.

Key properties: `section_id`, `section_name`, `click_source`, `url`, `timestamp`, `source`

### `portfolio_interaction`

Available through `createPortfolioInteractionEvent()` for future manual interactions.

Key properties: `action`, `interaction_type`, `portfolio_section`, `user_agent`, `timestamp`, `source`

### `error_occurred`

Available through `createErrorEvent()` for future component-level error tracking. The current app does not mount a React error boundary tracker; `AnalyticsProvider` only catches analytics-script errors so third-party script failures do not break the app.

### `user_identified`

Available through `analytics.identify()` / `useTrackEvent().identifyUser()` when a valid user identifier is intentionally supplied. The current portfolio UI does not collect user IDs.

## Deduplication

The system prevents duplicate automatic events with:

- module-level initialization state in `hooks/use-analytics.ts`
- module-level `pageViewTracked`
- `window.__pageViewTracked` to survive React StrictMode remounts
- manager-level one-second page-view dedupe in `lib/analytics.ts`
- a `Set` of viewed sections inside `useSectionTracking`
- one `AnalyticsProvider` in the root layout

## File Structure

```
app/
  layout.tsx                         # Root layout, AnalyticsScripts, AnalyticsProvider
components/
  analytics/
    analytics-provider.tsx           # Provider, section tracking, navigation click tracking
    analytics-scripts.tsx            # next/script Segment and GTM loaders
hooks/
  use-analytics.ts                   # Initialization, page view, section hooks
lib/
  analytics.ts                       # Segment/GTM providers and manager
  analytics-consent.ts               # Do Not Track / Global Privacy Control checks
  analytics-events.ts                # Event constants, types, helper builders
TRACKING_PLAN.md                     # Event specifications
ANALYTICS_SYSTEM.md                  # This architecture document
```

## Platform Notes

### Segment

- `analytics.js` is loaded through `next/script`
- the queue/stub is created before event calls
- middleware filters invalid user IDs such as `"me"` or IDs shorter than five characters
- middleware maps `anonymousId` to Amplitude `device_id` when no valid `userId` is present

### Google Tag Manager

- `gtm.js` is loaded through `next/script`
- `window.dataLayer` receives page, section, interaction, and identify events
- `window.__portfolioGtmInitialized` prevents duplicate GTM start events

### Amplitude

- Amplitude is reached through the Segment destination
- no Amplitude browser SDK is loaded directly
- valid identity handling is enforced before events reach the destination

## Environment Variables

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_key
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXX
```

If either variable is missing, that platform is skipped and a development-only warning is logged.
