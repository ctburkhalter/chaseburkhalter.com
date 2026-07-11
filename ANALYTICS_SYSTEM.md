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
          → usePathname() effect re-runs on every route change
          → checks window.__lastTrackedPageViewPath (StrictMode guard + SPA re-fire)
          → analytics.initialize() (lib/analytics.ts, no-ops after first call)
              → canLoadAnalytics() checks DNT / GPC browser signals
              → amplitude.init() with serverUrl: '/api/amplitude'
              → registers pagehide beacon flush listener
          → analytics.trackPageView() fires immediately, no timer delay
```

`AnalyticsProvider` is mounted once in the root layout, so it is not remounted when the visitor navigates between `/` and `/weather` (both share the root layout). Because of that, page-view tracking is keyed on the Next.js App Router pathname (`usePathname()`) rather than on mount: every distinct pathname fires its own `page_view`, including client-side `<Link>` navigations that never trigger a full document reload.

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

### Page View: No Timer, Re-fires on Route Change

The old implementation used a 500ms `setTimeout` to delay `page_view`, assuming Segment would be ready by then. Amplitude's npm SDK queues events internally from the moment `amplitude.init()` is called; no "ready" callback is needed. `page_view` fires synchronously in a `useEffect` keyed on `usePathname()`, guarded by `window.__lastTrackedPageViewPath` to survive React StrictMode double-mount without suppressing real navigations.

```
useEffect() fires (after hydration, and again on every pathname change)
  → window.__lastTrackedPageViewPath === pathname? return (StrictMode re-invoke of the same mount)
  → isInitialLoad = window.__lastTrackedPageViewPath === undefined
  → window.__lastTrackedPageViewPath = pathname
  → analytics.initialize() (no-ops after the first real call)
  → analytics.trackPageView({ ..., initial_load: isInitialLoad, navigation_type: isInitialLoad ? 'initial' : 'spa' })
```

**Why this matters:** `AnalyticsProvider` lives in the root layout and is not remounted on client-side navigation. A plain one-shot boolean (the previous `window.__pageViewTracked`) could tell "first mount" from "StrictMode's second invocation of that same mount," but not from "a real navigation to a new route." That meant `/weather` never got a `page_view` when reached via the nav link, and returning to `/` didn't either. Tracking the last tracked *path* instead of a boolean fixes this: the effect still no-ops on StrictMode's duplicate invocation (same pathname), but fires again the moment the pathname actually changes.

### Section Tracking

```
Pathname changes (including initial mount)
  → useSectionTracking effect re-runs, resets the tracked-sections Set,
    disconnects any previous observer, and attaches a fresh one
User scrolls
  → IntersectionObserver (rootMargin -20% bottom, threshold 0) detects section
      → section_viewed fires once per section per route visit
          → tracked in Set<string> in useSectionTracking ref
```

Section ids and display names come from the `SECTIONS` registry in `lib/content.ts`. The registry is the single source shared by the IntersectionObserver target list, the navigation components, and the analytics display-name lookup.

**Why the observer re-attaches per route:** `useSectionTracking`'s effect used to run once (stable `sectionIds`/`trackEvent` deps) and never again. Since `AnalyticsProvider` persists across client-side navigation, after `/` → `/weather` → `/` the observer was still watching the *original*, now-unmounted section DOM nodes, so `section_viewed` silently stopped firing for the rest of the session. Adding `pathname` to the effect's dependency array forces a clean disconnect-and-reattach on every route change, and resetting the tracked-sections `Set` means a returning visit to `/` tracks sections again instead of treating them as already-seen from the prior visit. `SECTIONS` now spans more than the home page (`/weather` contributes `weather-methodology`), so a route observing only a subset of the registry's ids is expected by design; the dev-only console logging reflects that with `console.log`, not `console.warn`, when a route's observed count is a partial match.

### Navigation Tracking

```
User clicks an internal hash link: a[href^="#"] (home) or a[href^="/#"] (non-home routes)
  → document click handler (analytics-provider.tsx)
      → section_clicked fires with click_source = "navigation"
```

`SiteHeader` rewrites hash hrefs to `/#section` on routes other than `/` (see `navHref` in `site-header.tsx`), since a bare `#section` would try to scroll the current route instead of routing to the homepage first. The click handler matches both forms and strips the appropriate prefix before checking the id against `SECTION_IDS`.

### Weather Explorer Tracking

`/weather` is a data-product route rather than a hash section, so its automatic `page_view` uses `page_path = "/weather"`. The page component (`components/weather/weather-page-content.tsx`) emits `weather_page_viewed` once when it mounts, carrying only the current artifact mode (`data_source_mode`); it's kept as its own event rather than folded into `page_view` because `data_source_mode` is server-fetched page data the generic, pathname-only `page_view` hook (`hooks/use-analytics.ts`) has no way to see. Two further typed events are scoped to what's actually being interacted with: `event_explorer_interaction` for the tornado event explorer (filters, inspection, source-record opens) and `project_explorer_interaction` for the dbt project explorer (visibility, file/model inspection, repository/docs links). Methodology-section visibility is not a weather-specific event at all: the methodology and safety-note block carries `id="weather-methodology"`, a `SECTIONS` registry entry (`lib/content.ts`) that the site-wide `useSectionTracking` observer picks up automatically, so it fires the same `section_viewed` event as every home-page section.

The implementation deliberately excludes source event IDs, narratives, coordinates, project file paths, node IDs, and source text from Amplitude. Those values are useful in the public explorers, but they would create unnecessary high-cardinality analytics properties. Source opens may report only the coarse `source_type` (`ncei_storm_events` or `iem_lsr`), while project-explorer events use only `pipeline_file_category` and `pipeline_node_layer` (deliberately not the event explorer's `selected_region`/`minimum_rating`, which aren't meaningful context for pipeline-file browsing). The tracking specification and both interaction enums live in `lib/analytics-events.ts`; see `TRACKING_PLAN.md` for the full property contract.

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
  // Reject anything that isn't a same-origin-shaped SDK batch call before
  // forwarding: wrong content type, or a body over 200KB (typical SDK
  // batches are well under this). The route is same-origin-only in
  // practice, but was previously an unvalidated open relay to Amplitude's
  // batch API with no checks at all. Both application/json (the normal
  // fetch() transport) and text/plain (what navigator.sendBeacon() sends on
  // the pagehide flush, see "Tab Close Event Delivery" below) are accepted.
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json') && !contentType?.includes('text/plain')) {
    return new Response('Unsupported Content-Type', { status: 415 })
  }

  const body = await request.text()
  if (body.length > 200_000) {
    return new Response('Payload too large', { status: 413 })
  }

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
| `page_view` | App init, and every client-side route change thereafter | `path`, `title`, `referrer`, `is_page_reload`, `initial_load`, `navigation_type` |
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
| `window.__lastTrackedPageViewPath` | `hooks/use-analytics.ts` | React StrictMode double-mount page_view race, without suppressing page views on later route changes |
| Manager-level 1s dedupe | `lib/analytics.ts` | Identical page views less than 1s apart |
| `Set<string>` of viewed sections, reset per pathname | `hooks/use-analytics.ts` | Duplicate `section_viewed` within a route visit |
| One `AnalyticsProvider` | `app/layout.tsx` | Multiple providers |

The previous implementation had module-level `globalInitialized` and `pageViewTracked` flags, but these reset between React StrictMode mounts, causing the page_view to be skipped on the second mount. A later fix moved to a `window.__pageViewTracked` boolean, which survived StrictMode unmount/remount correctly but, as a one-shot flag, also suppressed every `page_view` after the first, including on genuine client-side route changes. `window.__lastTrackedPageViewPath` replaces the boolean with the last-tracked pathname string: unchanged pathname means "skip" (StrictMode's duplicate invocation), changed pathname means "track" (a real navigation).

---

## File Structure

```
app/
  api/
    amplitude/
      route.ts                         # First-party proxy → api2.amplitude.com/batch (Node runtime)
    weather/
      events/route.ts                  # Validated event-explorer query API (the only browser-facing weather route; the weather page itself calls lib/weather/data.ts server-side)
  layout.tsx                           # Root layout: metadata, JSON-LD, mounts AnalyticsProvider
  page.tsx                             # Thin composition of section components
  weather/page.tsx                     # Dedicated weather case-study route
components/
  analytics/
    analytics-provider.tsx             # Section tracking, navigation click tracking
  sections/
    analytics-showcase.tsx             # Live event stream + tracking plan tab UI
    (hero, impact-band, work, ai, experience, skills, about, contact sections)
  resume-download-link.tsx             # Client component: fires resume_downloaded on click
  tracked-link.tsx                     # Client component: external_link_clicked / contact_clicked
  weather/weather-page-content.tsx     # /weather page content (both explorers, methodology) and typed weather analytics
  weather/dbt-project-explorer.tsx     # dbt project explorer and typed weather analytics
hooks/
  use-analytics.ts                     # Init, page view, section tracking hooks
lib/
  analytics.ts                         # AmplitudeProvider, AnalyticsManager singleton
  analytics-consent.ts                 # DNT / GPC browser signal checks
  analytics-events.ts                  # Event constants, types, creators, getEventContext()
  content.ts                           # Site content + SECTIONS registry (ids, labels)
proxy.ts                                # Node.js runtime: security response headers (renamed from middleware.ts in Next.js 16)
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
