# Analytics Tracking Plan

## Overview

This document defines the event tracking specification for `chaseburkhalter.com`.

Events are sent directly to **Amplitude** via the `@amplitude/analytics-browser` SDK (Browser SDK 2), routed through a first-party server proxy at `/api/amplitude` for reliable delivery to all visitors, including those using ad blockers or Safari with Intelligent Tracking Prevention (ITP).

### Why direct Amplitude, not Segment?

The previous architecture used Segment as a Customer Data Platform (CDP) to collect events and forward them to Amplitude. This was removed for the following reasons:

1. **Ad blocker coverage**: `cdn.segment.com` and `api.segment.io` are on virtually every major ad blocker block list (EasyList, uBlock Origin, Brave Shields). When blocked, Segment's CDN script never loads, `analytics.ready()` never fires, and every event queued before that callback is permanently lost. An estimated 25 to 40% of visitors were generating zero events.

2. **The `whenReady` race**: The previous implementation queued `page_view` via a `whenReady()` callback pattern. `page_view` fired with a 500ms delay after mount, before Segment was initialized, so it always entered the queue. If Segment's CDN was blocked or its `ready` callback threw an error, the queue never drained and `page_view` was silently dropped. `section_viewed`, by contrast, fired minutes later after scrolling, after Segment was fully initialized, so it always arrived. This explained the observed symptom: visitors with `section_viewed` events but no `page_view`.

3. **No-benefit abstraction**: Segment's value is routing one data stream to multiple destinations. This site has a single destination (Amplitude). Adding Segment created a 3-hop chain (browser → Segment CDN → Segment → Amplitude) with no routing benefit, only added failure modes.

### Why `@amplitude/analytics-browser` (Browser SDK 2), not `@amplitude/unified`?

`@amplitude/unified` (the Browser Unified SDK) is a multi-product wrapper for Amplitude Analytics + Experiment + Session Replay + Guides & Surveys. It does not document `serverUrl` proxy configuration, the most critical feature for ad-blocker bypass. It initializes via `initAll()`, which lacks the granular option control needed for this setup. It is overkill for a site that needs analytics only.

`@amplitude/analytics-browser` explicitly documents `serverUrl`, has a Next.js App Router guide, exposes the `amplitude.init()` API for full initialization control, and is actively maintained as the primary browser SDK.

### Why the Amplitude Wizard CLI was skipped

The Wizard CLI auto-proposes events by reading the codebase and generating generic instrumentation. This site already has a precise TypeScript tracking plan with defined event names, property schemas, and creator functions. The Wizard would conflict with the existing schema. Manual installation gives full control.

Analytics loading is privacy-aware: browser Do Not Track and Global Privacy Control signals prevent any SDK initialization and make all tracking calls no-ops.

---

## Naming Conventions

### Event Names

- Format: `snake_case`
- Examples: `page_view`, `section_viewed`, `resume_downloaded`

### Property Names

- Format: `snake_case`
- Examples: `section_id`, `click_source`, `utm_source`

### Taxonomy principle

Prefer one event with a discriminating property over many event names. Outbound clicks are a single `external_link_clicked` event with a `link_type` property, not `github_clicked`, `linkedin_clicked`, and so on. This keeps funnels queryable and the event catalog small.

---

## Automatic Context Properties

Every event is automatically enriched by `AnalyticsManager.trackEvent()` before it reaches Amplitude. No manual effort is needed in event creator functions or components; context is always present.

### Reserved Properties (added by `lib/analytics.ts`)

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp, set by `AmplitudeProvider.trackEvent()` |
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
| `connection_type` | string | Effective connection type (if supported by browser) | `"4g"` |
| `page_url` | string | Full current URL | `"https://chaseburkhalter.com/"` |
| `page_path` | string | URL pathname | `"/"` |
| `referrer` | string | **Stable session attribution.** Captured from `document.referrer` on the landing page and persisted in `sessionStorage` under `portfolio:referrer`. All subsequent events in the session carry this value. Normalized to `"direct"` when unavailable. | `"https://linkedin.com"` |
| `page_referrer` | string | Raw `document.referrer` at the moment the event fires. Useful for debugging. Normalized to `"direct"` when unavailable. | `"https://linkedin.com"` |
| `is_page_reload` | boolean | Whether the navigation was a browser refresh (F5 / Cmd+R), detected via the Navigation Timing API. Used to filter reloads out of unique page view analysis in Amplitude. | `false` |
| `page_event_link_id` | number | A stable 13-digit random integer generated once per page load and cached on `window.__pageEventLinkId`. All events from the same page load share this ID, making it possible to group them in Amplitude queries even when session or user ID boundaries change. | `3847291034012` |

**On `referrer` vs `page_referrer`:** `referrer` is always present and is the right field for traffic-source reporting (for example, resume downloads by source). `page_referrer` reflects the raw browser state at event fire time, which in a SPA becomes empty immediately after the landing page. It is kept for completeness and debugging, not for attribution.

**Why `is_page_reload`:** Page reloads create a new Amplitude session and appear as new page views. Without this flag, a user refreshing the page looks identical to a new unique visitor in session-level analysis. The Navigation Timing API (`PerformanceNavigationTiming.type`) identifies reloads natively. Filter `is_page_reload = false` in Amplitude charts to count only genuine first-load page views.

**Why `page_event_link_id`:** Session IDs can be interrupted by tab suspension, and user IDs may be absent. A per-load random ID lets you join `page_view` to all subsequent events from that load without relying on session continuity.

### UTM / Marketing Attribution

UTM parameters are captured from the landing URL on first load and persisted to `sessionStorage` under `portfolio:utm`. This ensures attribution survives SPA navigations that strip query strings.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `utm_source` | string | Traffic source | `"linkedin"` |
| `utm_medium` | string | Marketing medium | `"social"` |
| `utm_campaign` | string | Campaign name | `"job_search_2026"` |
| `utm_term` | string | Paid search term | `"analytics engineer"` |
| `utm_content` | string | Ad content variant | `"resume_cta"` |

UTM properties are only present when the corresponding parameter exists in the URL.

---

## Event Catalog

### Weather explorer events

`/weather` receives the standard `page_view` event with `page_path = "/weather"`, plus two typed events that measure use of the tornado event explorer and dbt project explorer without collecting visitor-entered data.

| Event | Trigger | Properties |
|---|---|---|
| `weather_dashboard_viewed` | Weather explorer route mounts, once per page load | `data_source_mode` |
| `weather_dashboard_interacted` | Event-explorer filter or inspection, project-explorer interaction, source-record open, or methodology view | `interaction_type`, `selected_region`, `minimum_rating`, `year_from`, `year_to`, `selected_month`, `event_rating`, `event_state`, `source_type`, `pipeline_file_category`, `pipeline_node_layer` |

`interaction_type` is one of `region_filter_changed`, `minimum_rating_changed`, `year_filter_changed`, `month_filter_changed`, `event_inspected`, `source_record_opened`, `methodology_viewed`, `pipeline_explorer_viewed`, `pipeline_file_inspected`, `pipeline_model_inspected`, `pipeline_repository_opened`, or `pipeline_docs_opened`. Event-explorer filters record their selected region, rating, year range, or month. `source_type` is `ncei_storm_events` or `iem_lsr` when present. Project-explorer events use the low-cardinality `pipeline_file_category` and `pipeline_node_layer`, never source text, file paths, node IDs, event IDs, or narratives. All automatic page, device, referrer, UTM, reload, and per-load link context remains attached.

Example:

```json
{
  "event": "weather_dashboard_interacted",
  "properties": {
    "interaction_type": "event_inspected",
    "event_rating": "EF3",
    "event_state": "AL",
    "page_path": "/weather"
  }
}
```

### `page_view`

**Description**: Tracks every route the visitor loads or navigates to, including client-side `<Link>` navigations between routes that share the root layout (for example `/` to `/weather`), not just the initial document load.

**When to fire**: Inside a `useEffect` keyed on the App Router pathname (`usePathname()`), so it re-runs on every client-side route change, not only on mount. Guarded by `window.__lastTrackedPageViewPath` to survive React StrictMode double-mount without firing twice for the *same* pathname, while still firing again when the pathname actually changes. No timer delay: Amplitude's SDK queues events internally, so synchronous firing after `amplitude.init()` is safe.

**Why not a one-shot flag:** The previous guard (`window.__pageViewTracked`, a boolean) was designed only to survive StrictMode's double-mount and never reset, which meant it also silently suppressed every subsequent page view for the rest of the session. Since `AnalyticsProvider` is mounted once in the root layout and persists across client-side navigation between `/` and `/weather`, a one-shot flag meant `/weather` never received its own `page_view` when reached via the nav link, and returning to `/` didn't either. Tracking the *last tracked path* instead of a boolean fixes both: StrictMode's second effect invocation sees an unchanged pathname and is skipped, but a real navigation to a new pathname always fires.

**Why no 500ms timer:** The old implementation delayed `page_view` by 500ms to give Segment's CDN time to load and call `analytics.ready()`. Amplitude's npm SDK initializes synchronously and maintains its own internal event queue. There is no "wait for CDN" step, so the delay is unnecessary and was itself a source of missed events.

**Frequency**: Once per distinct pathname per StrictMode-mount cycle. `window.__lastTrackedPageViewPath` deduplication plus manager-level 1s dedupe.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `path` | string | Yes | URL pathname | `"/"` |
| `title` | string | Yes | Document title | `"Chase Burkhalter \| Senior Data & Analytics Engineer"` |
| `url` | string | Yes | Full URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable landing referrer, or `"direct"` | `"https://linkedin.com"` |
| `hash` | string | No | URL hash | `""` |
| `initial_load` | boolean | Yes | `true` only for the very first tracked path this page load; `false` for every subsequent client-side navigation | `true` |
| `navigation_type` | string | Yes | `"initial"` for the first tracked path this page load, `"spa"` for client-side route changes after that | `"spa"` |
| `is_page_reload` | boolean | Yes | Identifies browser refreshes | `false` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Example payload, initial load (automatic context properties shown selectively):

```json
{
  "event": "page_view",
  "properties": {
    "path": "/",
    "title": "Chase Burkhalter | Senior Data & Analytics Engineer",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "page_referrer": "https://linkedin.com",
    "hash": "",
    "initial_load": true,
    "navigation_type": "initial",
    "is_page_reload": false,
    "page_event_link_id": 3847291034012,
    "utm_source": "linkedin",
    "utm_medium": "social",
    "browser_language": "en-US",
    "viewport_width": 1440,
    "timezone": "America/Chicago",
    "timestamp": "2026-07-09T10:00:00.000Z",
    "source": "portfolio"
  }
}
```

Example payload, client-side navigation to `/weather` in the same session:

```json
{
  "event": "page_view",
  "properties": {
    "path": "/weather",
    "title": "South Alabama Tornado Watch | Chase Burkhalter",
    "url": "https://chaseburkhalter.com/weather",
    "referrer": "https://linkedin.com",
    "hash": "",
    "initial_load": false,
    "navigation_type": "spa",
    "is_page_reload": false,
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:00:12.000Z",
    "source": "portfolio"
  }
}
```

---

### `section_viewed`

**Description**: Tracks when a portfolio section becomes visible in the viewport.

**When to fire**: Automatically when the section's leading edge enters the bottom 80% of the viewport (`rootMargin: '0px 0px -20% 0px'`, `threshold: 0`). At that moment exactly 20% of the viewport is covered by the section, regardless of element height. This handles both compact sections and sections taller than the viewport (like Experience on mobile) where `intersectionRatio` is capped at `viewportHeight / elementHeight` and can never reach a meaningful fixed fraction.

**Frequency**: Once per section per route visit (tracked in a `Set` inside `useSectionTracking`, reset whenever the pathname changes). The observer is re-attached on every pathname change so it always watches the DOM nodes of the currently mounted route; a visitor who navigates `/` → `/weather` → `/` gets fresh `section_viewed` events on the return to `/` instead of a silently dead observer still watching unmounted elements. Routes with no tracked sections in the DOM (`/weather`) skip observation entirely rather than logging a warning per missing id.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | DOM `id` of the section | `"projects"` |
| `section_name` | string | Yes | Human-readable name | `"Projects"` |
| `interaction_type` | string | Yes | Always `"scroll"` | `"scroll"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable referrer, or `"direct"` | `"https://linkedin.com"` |
| `is_page_reload` | boolean | Yes | Identifies browser refreshes | `false` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Tracked sections and their analytics display names are defined in the `SECTIONS` registry in `lib/content.ts`. Ids stay stable across redesigns so history remains comparable:

| `section_id` | `section_name` |
|--------------|----------------|
| `hero` | `Hero` |
| `projects` | `Projects` |
| `ai-engineering` | `AI Engineering` |
| `experience` | `Experience` |
| `skills` | `Skills` |
| `demos` | `Demos` |
| `about` | `About` |
| `contact` | `Contact` |

Example payload:

```json
{
  "event": "section_viewed",
  "properties": {
    "section_id": "projects",
    "section_name": "Projects",
    "interaction_type": "scroll",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:01:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `section_clicked`

**Description**: Tracks clicks on internal section navigation links.

**When to fire**: When a user clicks an `a[href^="#"]` link targeting a tracked section, or an `a[href^="/#"]` link (the form `SiteHeader` renders on non-home routes like `/weather`, since a bare `#section` href would try to scroll the current route instead of routing home first).

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | Target section DOM `id` | `"contact"` |
| `section_name` | string | Yes | Human-readable name | `"Contact"` |
| `click_source` | string | Yes | Click origin | `"navigation"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable referrer, or `"direct"` | `"https://linkedin.com"` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Example payload:

```json
{
  "event": "section_clicked",
  "properties": {
    "section_id": "contact",
    "section_name": "Contact",
    "click_source": "navigation",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:02:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `resume_downloaded`

**Description**: Tracks when a visitor opens the resume PDF.

**When to fire**: On click of any resume download link. Fired by `components/resume-download-link.tsx` before the browser opens the PDF.

**Sources**: Three entry points, each tagged with a distinct `download_source` value.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `download_source` | string | Yes | Where the download was triggered | `"hero"`, `"nav"`, `"contact"` |
| `file_name` | string | Yes | PDF filename | `"Chase_Burkhalter_Resume_2026.pdf"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable referrer, or `"direct"` | `"https://linkedin.com"` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Example payload:

```json
{
  "event": "resume_downloaded",
  "properties": {
    "download_source": "hero",
    "file_name": "Chase_Burkhalter_Resume_2026.pdf",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "utm_source": "linkedin",
    "utm_medium": "social",
    "browser_language": "en-US",
    "viewport_width": 390,
    "device_pixel_ratio": 3,
    "timezone": "America/New_York",
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:03:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `external_link_clicked`

**Description**: Tracks clicks on outbound links (GitHub, LinkedIn, live project sites, employer sites).

**When to fire**: On click of any outbound link rendered through `components/tracked-link.tsx` with a `linkType` prop. Fired before the browser follows the link; outbound targets open in a new tab so delivery is not raced against navigation.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `link_type` | string | Yes | One of `"github"`, `"linkedin"`, `"live_site"`, `"company"` | `"github"` |
| `destination` | string | Yes | The outbound URL | `"https://github.com/ctburkhalter"` |
| `link_location` | string | Yes | Where on the page the link lives | `"hero"`, `"footer"`, `"project_card"`, `"experience"`, `"demos"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable referrer, or `"direct"` | `"https://linkedin.com"` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Example payload:

```json
{
  "event": "external_link_clicked",
  "properties": {
    "link_type": "live_site",
    "destination": "https://timdjohnson.com",
    "link_location": "project_card",
    "url": "https://chaseburkhalter.com/",
    "referrer": "direct",
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:04:00.000Z",
    "source": "portfolio"
  }
}
```

---

### `contact_clicked`

**Description**: Tracks contact intent: clicks on the email address or the LinkedIn contact card.

**When to fire**: On click of a contact link rendered through `components/tracked-link.tsx` with a `contactMethod` prop.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `contact_method` | string | Yes | One of `"email"`, `"linkedin"` | `"email"` |
| `link_location` | string | Yes | Where on the page the link lives | `"contact"`, `"contact_cta"`, `"footer"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | Yes | Session-stable referrer, or `"direct"` | `"https://linkedin.com"` |
| `page_event_link_id` | number | Yes | Per-load group ID | `3847291034012` |

Example payload:

```json
{
  "event": "contact_clicked",
  "properties": {
    "contact_method": "email",
    "link_location": "contact",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://linkedin.com",
    "page_event_link_id": 3847291034012,
    "timestamp": "2026-07-09T10:05:00.000Z",
    "source": "portfolio"
  }
}
```

---

## Platform Implementation

### Amplitude Browser SDK

Amplitude is initialized directly via `@amplitude/analytics-browser` in `lib/analytics.ts`. The SDK is installed as an npm package: no CDN script, no external script tag.

```ts
amplitude.track(eventName, properties)      // all events including page_view
```

The SDK also exposes `identify()`/`setUserId()` for user-level traits, but this site is fully anonymous and does not call them.

### First-Party Proxy: Why and How

Amplitude's batch endpoint (`api2.amplitude.com/batch`) is on the EasyList block list used by uBlock Origin, AdBlock Plus, and Brave Shields. A direct `amplitude.track()` call will be intercepted before it leaves the browser for roughly 25 to 40% of visitors.

The proxy solves this by routing SDK requests through `/api/amplitude`, a Next.js API Route on the same domain as the site. Requests to `chaseburkhalter.com` are never blocked by ad blockers. The API route receives the SDK payload and forwards it verbatim to Amplitude:

```ts
// app/api/amplitude/route.ts
export async function POST(request: Request) {
  // Reject anything that isn't a same-origin-shaped SDK batch call before
  // forwarding: wrong content type, or a body over 200KB (typical SDK
  // batches are well under this). Both application/json (the normal fetch()
  // transport) and text/plain (what navigator.sendBeacon() sends on the
  // pagehide flush, see "Tab Close Reliability" below) are accepted.
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

**Why `request.text()` not `request.json()`:** The SDK serializes its own JSON. Parsing with `.json()` then re-serializing with `JSON.stringify()` risks floating-point precision loss and key ordering changes. `text()` gives raw bytes forwarded without transformation.

**Why `X-Forwarded-For` is forwarded:** The server-to-server call to Amplitude originates from Vercel's infrastructure. Without forwarding the original client IP, Amplitude geolocates the Vercel server, producing wrong city, DMA, and region data for every event. Vercel provides the visitor's IP in `x-forwarded-for`; reading the first value (the list is ordered oldest-to-newest when multiple proxies are in the chain) and passing it through restores correct geolocation.

**Why compression is off:** The SDK's `enableRequestBodyCompression` is left at its default (off). Enabling it would require gzip decompression in the API route before forwarding, adding unnecessary complexity. Plain JSON forwarding is sufficient.

**Why path `/api/amplitude` avoids blocking:** The proxy path is generic. Paths containing recognizable analytics keywords could end up on block lists over time. `/api/amplitude` blends with standard Next.js API route naming.

### Tab Close Reliability

When a visitor closes a tab, any queued events in the SDK's internal buffer may be lost if the browser aborts outgoing `fetch()` requests. The implementation registers a `pagehide` listener that switches the SDK transport to `sendBeacon` and flushes immediately:

```ts
window.addEventListener('pagehide', () => {
  amplitude.setTransport('beacon')
  amplitude.flush()
})
```

`navigator.sendBeacon` is fire-and-forget: the browser will deliver it even after the page context is destroyed.

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
2. Add a property interface extending `BaseEventProperties`
3. Add the event to `ANALYTICS_EVENTS`
4. Write a creator function (`createXxxEvent`)
5. If a new page section is involved, register it in `SECTIONS` in `lib/content.ts` (this drives both IntersectionObserver targets and analytics display names)
6. Add the event to this tracking plan and to the on-page Tracking Plan tab in `components/sections/analytics-showcase.tsx`
7. Validate in the browser Network tab (confirm POST requests appear at `/api/amplitude`) and the Amplitude Event Stream

---

## Testing & Validation

**Development:**

- `[Analytics]` prefixed logs appear in the browser console
- Network tab shows POST requests to `/api/amplitude`
- No analytics initialize when DNT or GPC is enabled

**Production:**

- Amplitude Event Stream shows all event types with enriched properties
- Confirm requests reach `/api/amplitude` (not blocked by ad blockers) via Network tab with an ad blocker enabled

**Ad blocker test:**

1. Enable uBlock Origin
2. Open Network tab
3. Navigate to the site
4. Confirm POST to `/api/amplitude` returns 200 (not blocked)

---

## Troubleshooting

**Events not firing:**

- Confirm `NEXT_PUBLIC_AMPLITUDE_API_KEY` is set in `.env.local` (dev) and Vercel (prod)
- Check whether DNT or GPC is enabled in the browser
- Verify `AnalyticsProvider` is mounted in `app/layout.tsx`
- Open Network tab and confirm POST requests appear at `/api/amplitude`

**Duplicate events:**

- Check `window.__lastTrackedPageViewPath`: it should equal the current pathname after a page view fires
- Verify only one `AnalyticsProvider` is mounted
- Manager-level 1s dedupe prevents identical page views in rapid succession
- React StrictMode remounts effects in development; `window.__lastTrackedPageViewPath` prevents double-fire for the same pathname, while still allowing a new `page_view` when the pathname changes

**`page_view` missing on client-side navigation:**

- Confirm `usePathname()` is actually returning the new path (Next.js App Router only; a non-App-Router navigation pattern would not trigger this effect)
- Check `window.__lastTrackedPageViewPath` was not already set to the destination path from an earlier visit in the same session without a real navigation in between

**Events missing in Amplitude:**

- Confirm the `/api/amplitude` proxy route is deployed and returning 200
- Check Amplitude Event Stream for the device ID being tested
- Verify the API key in `NEXT_PUBLIC_AMPLITUDE_API_KEY` matches the Amplitude project (Settings → Projects)

**UTM properties missing:**

- Confirm the landing URL included UTM params
- Check `sessionStorage` for the `portfolio:utm` key; it should hold the captured values
- UTMs are captured only on first load; clearing sessionStorage resets attribution

**`page_view` fires but with `is_page_reload: true`:**

- Expected behavior: the Navigation Timing API correctly identified this as a browser refresh
- Filter `is_page_reload = false` in Amplitude charts to count unique first-load views

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.3.0 | 2026-07-10 | Fixed `page_view` and `section_viewed` breaking across client-side route changes: `page_view` now fires on every App Router pathname change (not just initial mount) via a last-tracked-path guard replacing the old one-shot `window.__pageViewTracked` boolean; added `navigation_type` (`"initial"` \| `"spa"`) to `page_view`; `section_viewed`'s IntersectionObserver now re-attaches per pathname instead of staying bound to unmounted DOM nodes after a route round trip; `section_clicked` now also matches `a[href^="/#"]` so it fires from non-home routes. Removed the unused `user_identified` event and `analytics.identify()` plumbing (never called from the UI). |
| 5.2.0 | 2026-07-10 | Reframed `/weather` as a tornado event explorer plus dbt project explorer. Removed chart-tab and cohort tracking while retaining event filters, event and source-record inspection, methodology, and pipeline-explorer tracking. |
| 5.1.1 | 2026-07-10 | Added `iem_lsr` as a weather `source_type` for preliminary Local Storm Report source opens. |
| 5.1.0 | 2026-07-09 | Added `/weather` explorer view and interaction events; documented safe weather event-property handling and excluded high-cardinality source detail. |
| 5.0.0 | 2026-07-09 | Added `external_link_clicked` and `contact_clicked` events via `components/tracked-link.tsx`; section registry moved to `SECTIONS` in `lib/content.ts` with stable ids and explicit display names; added `ai-engineering` and `about` sections; on-page Tracking Plan tab corrected to show the first-party proxy route and full event catalog |
| 4.0.2 | 2026-06-22 | Proxy: forward `X-Forwarded-For` to restore correct visitor geolocation in Amplitude |
| 4.0.1 | 2026-06-22 | Fix `page_event_link_id` buffer size (`Uint8Array(7)` → `Uint8Array(13)`) to produce full 13-digit IDs |
| 4.0.0 | 2026-06-22 | Removed Segment CDP entirely; direct Amplitude Browser SDK (`@amplitude/analytics-browser`); first-party proxy at `/api/amplitude`; added `is_page_reload`, `page_event_link_id`, session-stable `referrer` to all events; removed 500ms page_view timer; updated env var to `NEXT_PUBLIC_AMPLITUDE_API_KEY` |
| 3.1.0 | 2026-06-16 | Removed GTM; events routed Segment → Amplitude directly |
| 3.0.0 | 2026-06-16 | Added `resume_downloaded` event; added automatic device context and UTM enrichment on all events; removed `portfolio_interaction` and `error_occurred` (no longer implemented) |
| 2.0.0 | 2026-06-15 | Updated for `next/script` loading, browser privacy-signal handling |
| 1.0.0 | 2025-01-15 | Initial tracking plan |
