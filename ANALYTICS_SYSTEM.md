# Analytics System Architecture

## Overview

This portfolio uses a production analytics layer built on the **Amplitude Browser SDK** (`@amplitude/analytics-browser`), sending events directly to Amplitude through a first-party server proxy (`/api/amplitude`) for reliable delivery to all visitors, including those running ad blockers or Safari with Intelligent Tracking Prevention.

The system instruments automatic portfolio events (page view, section visibility, section navigation, resume downloads, outbound link clicks, contact clicks) and enriches every event with device context, UTM marketing attribution, stable referrer, and per-load identity properties.

For full event specifications, see [TRACKING_PLAN.md](./TRACKING_PLAN.md).

---

## Why This Architecture Exists

### The Segment problem

The previous architecture routed events through Segment (CDN-loaded `analytics.js`) to the Amplitude Actions destination. This failed in two compounding ways:

**Ad blockers:** `cdn.segment.com` and `api.segment.io` appear on EasyList, uBlock Origin's filter list, and Brave's default shields. When blocked, Segment's CDN script never executes, the `analytics.ready()` callback never fires, and the internal event queue never drains. Every event that fired before `ready` was silently and permanently lost.

**The `whenReady` race:** `page_view` was always dispatched via a `whenReady()` callback with a 500ms timer, on the assumption that 500ms was enough time for Segment's CDN to load. This assumption was wrong: at 500ms Segment rarely had fired `ready()`, so `page_view` always entered the readyCallbacks queue. For ad-blocker users, the queue never drained. For everyone else, any exception in Segment's `ready` callback would silently drop the queue. `section_viewed`, fired minutes later when users scroll, always arrived because Segment was already initialized by then. This explained the observable symptom: some visitors had `section_viewed` events but no `page_view`.

**Single destination, unnecessary hop:** Segment's value is routing a single stream to multiple destinations. This site has one destination, Amplitude. Segment added a 3-hop chain (browser → Segment CDN → Segment edge → Amplitude) with no routing benefit, only added failure modes, CDN dependency, and a write key to manage.

### The solution

Replace Segment with `@amplitude/analytics-browser` (npm), routed through a Next.js API Route at `/api/amplitude` that proxies to `api2.amplitude.com/batch`. This eliminates the CDN dependency entirely. The npm SDK initializes synchronously, maintains its own internal batch queue, and fires events immediately, with no `whenReady` callback machinery needed.

---

## SDK Selection Rationale

**Chosen:** `@amplitude/analytics-browser` (Browser SDK 2)
**Rejected:** `@amplitude/unified` (Browser Unified SDK)

`@amplitude/unified` is a multi-product wrapper for Amplitude Analytics + Experiment + Session Replay + Guides & Surveys. It does not document `serverUrl` proxy configuration, the most critical feature for ad-blocker bypass. Its `initAll()` initialization API does not expose the granular options needed (specific autocapture controls, `fetchRemoteConfig`, and so on). It carries significant bundle weight for products this site does not use.

`@amplitude/analytics-browser` explicitly documents `serverUrl`, has a dedicated Next.js App Router guide, and provides the `amplitude.init()` API with full option control. It is the primary Amplitude browser SDK and the right choice for a single-product analytics deployment.

---

## Runtime Flow

### SDK Initialization

```
RootLayout (app/layout.tsx)
  → AnalyticsProvider (components/analytics/analytics-provider.tsx)
      → useAnalytics() (hooks/use-analytics.ts)
          → checks window.__pageViewTracked (StrictMode guard)
          → analytics.initialize() (lib/analytics.ts)
              → canLoadAnalytics() checks DNT / GPC browser signals
              → amplitude.init() with serverUrl: '/api/amplitude'
              → registers pagehide beacon flush listener
          → analytics.trackPageView() fires immediately, no timer delay
```

Amplitude is initialized only when:

- `NEXT_PUBLIC_AMPLITUDE_API_KEY` is configured
- No browser-level privacy signal (DNT, GPC) opts the visitor out

### Event Enrichment

Every event passes through `AnalyticsManager.trackEvent()` or `trackPageView()`. At that point, `getEventContext()` is called and merged with the event properties:

```
Event created by creator function (lib/analytics-events.ts)
  → AnalyticsManager.trackEvent()
      → getEventContext() merges:
          - device/browser properties (UA, screen, viewport, timezone, etc.)
          - page_url, page_path
          - referrer (session-stable, from sessionStorage)
          - page_referrer (raw document.referrer at fire time)
          - is_page_reload (Navigation Timing API)
          - page_event_link_id (13-digit per-load random, cached on window)
          - UTM params from sessionStorage (captured on landing)
      → AmplitudeProvider.trackEvent()
          → amplitude.track(name, enrichedProperties)
          → CustomEvent('analytics:event') dispatched on window
              → LiveEventsTab in AnalyticsShowcase picks this up for real-time display
```

### Page View: No Timer

The old implementation used a 500ms `setTimeout` to delay `page_view`, assuming Segment would be ready by then. Amplitude's npm SDK queues events internally from the moment `amplitude.init()` is called; no "ready" callback is needed. `page_view` now fires synchronously in `useEffect`, guarded by `window.__pageViewTracked` to survive React StrictMode double-mount.

```
useEffect() fires (after hydration)
  → window.__pageViewTracked check (returns early if already set)
  → window.__pageViewTracked = true
  → analytics.initialize() (initializes Amplitude SDK)
  → analytics.trackPageView() (fires immediately, SDK queues internally)
```

### Section Tracking

```
User scrolls
  → IntersectionObserver (rootMargin -20% bottom, threshold 0) detects section
      → section_viewed fires once per section per session
          → tracked in Set<string> in useSectionTracking ref
```

Section ids and display names come from the `SECTIONS` registry in `lib/content.ts`. The registry is the single source shared by the IntersectionObserver target list, the navigation components, and the analytics display-name lookup.

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

### Outbound Link & Contact Tracking

```
User clicks an outbound or contact link
  → TrackedLink.onClick (components/tracked-link.tsx)
      → linkType prop present  → external_link_clicked (link_type, destination, link_location)
      → contactMethod present  → contact_clicked (contact_method, link_location)
      → browser follows the link (outbound targets open in a new tab)
```

`TrackedLink` is the single client-side leaf for outbound engagement tracking, which keeps the section components server-rendered.

### Tab Close Event Delivery

```
User closes tab or navigates away
  → pagehide event fires
      → amplitude.setTransport('beacon')
      → amplitude.flush()
          → navigator.sendBeacon to /api/amplitude (fire-and-forget, survives tab close)
```

Standard `fetch()` requests are aborted when a page unloads. `sendBeacon` queues the payload in the browser's outgoing queue and delivers it even after the page context is destroyed, so no events are lost on tab close.

---

## First-Party Proxy

### Why it exists

`api2.amplitude.com/batch` (the endpoint the Amplitude SDK sends events to) is on EasyList and other major ad blocker filter lists. A direct SDK call from the browser will be blocked for a significant percentage of visitors.

The proxy at `/api/amplitude` receives the SDK payload and forwards it server-side to Amplitude. Server-to-server requests are not subject to browser-based filtering.

### How it works

```
Browser SDK
  └── POST /api/amplitude (same domain, never blocked)
        └── Next.js API Route: app/api/amplitude/route.ts
              └── POST https://api2.amplitude.com/batch (server-side)
```

The API route forwards the payload verbatim with the original client IP:

```ts
export async function POST(request: Request) {
  const body = await request.text()

  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip')

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (clientIp) (headers as Record<string, string>)['X-Forwarded-For'] = clientIp

  const res = await fetch('https://api2.amplitude.com/batch', {
    method: 'POST',
    headers,
    body,
  })
  return new Response(await res.text(), { status: res.status })
}
```

**`request.text()` not `request.json()`:** The SDK serializes its own JSON payload. Parsing it with `.json()` and re-serializing with `JSON.stringify()` would risk floating-point precision loss and key-order changes. `text()` forwards the exact bytes the SDK produced.

**Client IP forwarding:** Without `X-Forwarded-For`, the server-to-server call to Amplitude carries the IP of the Vercel data center, not the visitor. Amplitude derives city, DMA, and region from the request IP, so all geolocation data would reflect the server's location. Vercel sets `x-forwarded-for` on every inbound request; reading and re-emitting it ensures Amplitude geolocates the actual visitor. The header may be a comma-separated list when multiple proxies are in the chain, and taking the first value gives the original client IP.

**Compression off:** `enableRequestBodyCompression` is left at its default (off) in the SDK config. Enabling it would require gzip decompression in the proxy before forwarding. Plain JSON is simpler and sufficient.

---

## Event Context Enrichment

`getEventContext()` in `lib/analytics-events.ts` is called on every event at the manager level. It returns:

**Device & browser:**
`user_agent`, `browser_language`, `screen_width`, `screen_height`, `viewport_width`, `viewport_height`, `device_pixel_ratio`, `timezone`, `connection_type` (when available via `navigator.connection`)

**Page:**
`page_url`, `page_path`, `referrer`, `page_referrer`, `is_page_reload`, `page_event_link_id`

`referrer` is the stable session attribution field. It is captured from `document.referrer` on the landing page, persisted in `sessionStorage` under `portfolio:referrer`, and attached to every event in the session. In a SPA, `document.referrer` becomes empty after the first navigation (no full-page load occurs). Without sessionStorage persistence, every event after the initial load would report `"direct"`, completely breaking traffic attribution for all non-page-view events.

`page_referrer` is the raw `document.referrer` at the moment the event fires. It reflects actual browser state and is kept for debugging. In a single-page portfolio, its value after the first navigation is always empty; use `referrer` for attribution analysis.

`is_page_reload` uses the Navigation Timing API (`PerformanceNavigationTiming.type`) to identify browser refreshes. Without this, a visitor hitting F5 looks identical to a new unique visitor in Amplitude session analysis. Falls back to the deprecated `performance.navigation.type` for older browsers.

`page_event_link_id` is a 13-digit random integer generated once per page load and cached on `window.__pageEventLinkId`. All events from the same load share this ID, enabling grouping in Amplitude queries independent of session or user ID continuity.

**UTM attribution:**
`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

UTM values are captured from the landing URL into `sessionStorage` (`portfolio:utm` key) on first load so they persist across navigations.

---

## Privacy Controls

`lib/analytics-consent.ts` checks three browser signals before any SDK call is made:

- `navigator.doNotTrack === "1"`
- `window.doNotTrack === "1"`
- `navigator.globalPrivacyControl === true`

When any signal is active:

- `analytics.initialize()` marks the manager as disabled
- `trackEvent`, `trackPageView`, and `identify` return without sending data
- No network requests are made to `/api/amplitude`

This is a conservative browser-signal opt-out, not a full consent management platform.

---

## Live Analytics Showcase

`components/sections/analytics-showcase.tsx` renders the "Live Analytics on This Site" section. It works by listening to `analytics:event` CustomEvents dispatched on `window` after each successful Amplitude call:

```ts
window.addEventListener('analytics:event', handler)
```

This keeps the showcase component fully decoupled from the analytics layer: no direct imports, no shared state. The decoupling means the showcase can be modified or removed without touching the analytics implementation.

The showcase has two tabs:

- **Live Events**: real-time event stream with an expandable property inspector
- **Tracking Plan**: the event catalog plus the first-party pipeline diagram

---

## Active Events

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `page_view` | App init | `path`, `title`, `referrer`, `is_page_reload`, `initial_load` |
| `section_viewed` | Leading edge 20% above viewport bottom | `section_id`, `section_name`, `referrer`, `interaction_type` |
| `section_clicked` | Internal nav link click | `section_id`, `section_name`, `referrer`, `click_source` |
| `resume_downloaded` | Resume link click | `download_source`, `file_name`, `referrer` |
| `external_link_clicked` | Outbound link click | `link_type`, `destination`, `link_location` |
| `contact_clicked` | Email or LinkedIn contact click | `contact_method`, `link_location` |

All events additionally carry the automatic context properties listed above.

---

## Tracked Sections

Defined in the `SECTIONS` registry in `lib/content.ts` (ids are stable; labels are the analytics display names):

1. `hero`
2. `projects`
3. `ai-engineering`
4. `experience`
5. `skills`
6. `demos`
7. `about`
8. `contact`

---

## Deduplication

| Guard | Location | What it prevents |
|-------|----------|-----------------|
| `window.__pageViewTracked` | `hooks/use-analytics.ts` | React StrictMode double-mount page_view race |
| Manager-level 1s dedupe | `lib/analytics.ts` | Identical page views less than 1s apart |
| `Set<string>` of viewed sections | `hooks/use-analytics.ts` | Duplicate `section_viewed` per session |
| One `AnalyticsProvider` | `app/layout.tsx` | Multiple providers |

The previous implementation had module-level `globalInitialized` and `pageViewTracked` flags, but these reset between React StrictMode mounts, causing the page_view to be skipped on the second mount. `window.__pageViewTracked` survives StrictMode unmount/remount because it lives on the global `window` object, not a module variable.

---

## File Structure

```
app/
  api/
    amplitude/
      route.ts                         # First-party proxy → api2.amplitude.com/batch (Node runtime)
  layout.tsx                           # Root layout: metadata, JSON-LD, mounts AnalyticsProvider
  page.tsx                             # Thin composition of section components
components/
  analytics/
    analytics-provider.tsx             # Section tracking, navigation click tracking
  sections/
    analytics-showcase.tsx             # Live event stream + tracking plan tab UI
    (hero, impact-band, work, ai, experience, skills, about, contact sections)
  resume-download-link.tsx             # Client component: fires resume_downloaded on click
  tracked-link.tsx                     # Client component: external_link_clicked / contact_clicked
hooks/
  use-analytics.ts                     # Init, page view, section tracking hooks
lib/
  analytics.ts                         # AmplitudeProvider, AnalyticsManager singleton
  analytics-consent.ts                 # DNT / GPC browser signal checks
  analytics-events.ts                  # Event constants, types, creators, getEventContext()
  content.ts                           # Site content + SECTIONS registry (ids, labels)
middleware.ts                          # Edge Runtime: security response headers
TRACKING_PLAN.md                       # Event specifications
ANALYTICS_SYSTEM.md                    # This document
```

---

## Platform Notes

### Amplitude Browser SDK

- Installed as the `@amplitude/analytics-browser` npm package, no CDN script tag
- SDK initialized with `serverUrl: '/api/amplitude'` to route through the first-party domain
- `autocapture.pageViews: false` for manual tracking with full property control
- `autocapture.sessions: true` so Amplitude manages session start/end natively
- `fetchRemoteConfig: false` avoids an extra outbound request to Amplitude's config CDN on init

### Session Continuity

When no `userId` is set, Amplitude assigns a `deviceId` from a cookie. This cookie is set from `chaseburkhalter.com` (the proxy domain), not `amplitude.com`. Safari ITP aggressively expires cookies and localStorage for third-party origins (7-day cap with no interaction), but treats first-party cookies more leniently. Routing through the proxy meaningfully improves cross-session identity continuity for Safari visitors.

---

## Environment Variables

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key
```

Get your API key from Amplitude → Settings → Projects → your project → API Key.

If the variable is missing, Amplitude initialization is skipped and a development warning is logged. No events are sent.

Configure the same variable in Vercel for production (Settings → Environment Variables).
