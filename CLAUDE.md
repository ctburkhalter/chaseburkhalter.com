# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config; ignores .next, node_modules, resume/)
pnpm test         # Run Vitest (lib/**/*.test.ts; pure-logic unit tests, no DOM/component rendering yet)
```

**Package manager:** pnpm@10.15.0. Do not use npm or yarn.

## Environment

Create `.env.local` with:
```
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_key_here
WEATHER_DATA_URL=https://your-github-pages-domain/data/v2/portfolio-weather.json
```
Get the Amplitude key from Amplitude → Settings → Projects. In production, both are set as Vercel environment variables. `WEATHER_DATA_URL` is optional: when unset, `/weather` falls back to a visibly labeled local contract fixture (`lib/weather/fixture.ts`).

## Architecture

**Next.js 16 portfolio** (App Router, TypeScript, React 19) deployed to Vercel. The primary portfolio is `/` with hash-based navigation. `/weather` is a dedicated static data-product route backed by same-origin cached APIs and a companion dbt/DuckDB pipeline that lives in its own sibling public repository, [`ctburkhalter/dbt-portfolio-weather`](https://github.com/ctburkhalter/dbt-portfolio-weather), not a subdirectory of this repo.

### Content Model

All copy and structured data live in `lib/content.ts` (typed: identity, nav, sections, impact stats, flagship case studies, projects, AI entries, experience, skills, about, contact). Section components under `components/sections/` render from this module; content edits are data edits, not JSX edits. Accent styling comes from the three-hue map in `lib/accent.ts` (green = data platform, violet = AI, orange = ops/incidents).

**Adding a page section:** add the `id` + `label` to `SECTIONS` in `lib/content.ts` (this drives IntersectionObserver targets and analytics display names), create the component in `components/sections/`, compose it in `app/page.tsx`, and update the section table in `TRACKING_PLAN.md`. Ids stay stable across redesigns so `section_viewed` history remains comparable. `SECTIONS` isn't home-page-only: `useSectionTracking` finds targets via `document.getElementById(id)` regardless of route, so a non-home route can add an id (see `weather-methodology` on `/weather`) without a matching `app/page.tsx` composition or nav entry, as long as some element on that route carries the id.

### Analytics System

This is the most complex part of the codebase and the focus of active development. Architecture at a glance:

```
Browser
  └── lib/analytics.ts (AmplitudeManager singleton)
        ├── Initializes Amplitude Browser SDK 2
        ├── Reads privacy signals (DNT, GPC) via lib/analytics-consent.ts
        └── Sends all events to /api/amplitude (same-origin proxy)
              └── api/amplitude/route.ts (Node runtime)
                    └── Forwards to api2.amplitude.com/batch
                          (includes X-Forwarded-For for correct geolocation)
```

**Why the proxy exists:** Direct calls to `api2.amplitude.com` are on EasyList and blocked by roughly 25 to 40% of visitors. Routing through `/api/amplitude` on the same domain defeats ad blockers entirely. This replaced a prior Segment integration that had the same blockage problem.

**Why not Segment:** Segment's CDN (`cdn.segment.com`, `api.segment.io`) is also on EasyList. `whenReady()` never fired for blocked users, causing `page_view` to queue indefinitely while later events succeeded, producing broken funnels.

**Event enrichment:** Every event gets context merged in via `lib/analytics-events.ts → getEventContext()`:
- Device: user_agent, language, screen dims, device_pixel_ratio, timezone, connection_type
- Page: page_url, page_path, stable referrer (sessionStorage), is_page_reload, page_event_link_id
- UTM params: captured from landing URL, persisted in sessionStorage across SPA navigations

**Tracked events:**
| Event | When |
|-------|------|
| `page_view` | App init, and again on every client-side route change (App Router `usePathname()`), e.g. `/` → `/weather` |
| `section_viewed` | IntersectionObserver with 20% bottom rootMargin, 0 threshold; re-attached per route so it does not go stale after a route round trip |
| `section_clicked` | Internal nav `a[href^="#"]` clicks, or `a[href^="/#"]` on non-home routes |
| `resume_downloaded` | PDF link click, with `download_source` (hero/nav/contact) |
| `external_link_clicked` | Outbound links via `components/tracked-link.tsx`, with `link_type` + `link_location` |
| `contact_clicked` | Email/LinkedIn contact links via `components/tracked-link.tsx`, with `contact_method` |

**Key implementation guards:**
- `window.__lastTrackedPageViewPath` tracks the last pathname a `page_view` fired for. It survives React StrictMode double-mount (same pathname is skipped) while still firing again on a real route change (new pathname), unlike a one-shot boolean
- `window.__pageEventLinkId` is a 13-digit random ID shared across all events from the same page load
- `sessionStorage['portfolio:referrer']` is captured once on landing and stays stable across hash navigations
- `pagehide` listener switches to `sendBeacon` transport on tab close for reliable flush

**Privacy:** If `navigator.doNotTrack`, `window.doNotTrack`, or `navigator.globalPrivacyControl` is set, analytics initializes but all calls become silent no-ops. No data is sent.

**Documentation:** `TRACKING_PLAN.md` (event specs + example payloads) and `ANALYTICS_SYSTEM.md` (architecture rationale) are the authoritative references for the analytics implementation. Keep both, plus the on-page Tracking Plan tab in `components/sections/analytics-showcase.tsx`, in sync when events change.

### Component & File Layout

```
app/
├── api/amplitude/route.ts     - First-party proxy (Node runtime)
├── api/weather/events/route.ts - Validated tornado event-query API (only browser-facing weather route)
├── weather/page.tsx           - South Alabama Tornado Watch case-study route
├── layout.tsx                 - Root: metadata, JSON-LD, ThemeProvider (forced dark) + AnalyticsProvider
├── page.tsx                   - Thin composition of section components
└── globals.css                - Tailwind + HSL CSS custom properties + reduced-motion handling

components/
├── analytics/analytics-provider.tsx  - Section visibility + nav click tracking
├── sections/                         - One component per page section
│   ├── hero-section.tsx, impact-band.tsx, work-section.tsx, ai-section.tsx
│   ├── experience-section.tsx, skills-section.tsx, analytics-showcase.tsx
│   └── about-section.tsx, contact-section.tsx
├── weather/                          - /weather-only components
│   ├── weather-page-content.tsx      - /weather page content: hero, dbt + event explorers, methodology
│   ├── dbt-project-explorer.tsx      - Native dbt project explorer (files, lineage, tests)
│   └── tornado-event-map.tsx         - Leaflet event map (dynamically imported, client-only)
├── flagship-card.tsx                 - Problem / approach / outcome case-study card
├── project-card.tsx                  - Compact cards (githubUrl / liveUrl props)
├── site-header.tsx / site-footer.tsx - Chrome, nav from NAV_ITEMS
├── mobile-navigation.tsx             - Mobile nav sheet
├── back-to-top.tsx                   - Client leaf, scroll-to-top button (mounted once in app/layout.tsx, both routes)
├── theme-provider.tsx                - next-themes wrapper (forcedTheme="dark")
├── tracked-link.tsx                  - Client leaf for outbound/contact tracking
├── resume-download-link.tsx          - Client leaf for resume_downloaded
└── ui/                               - shadcn/ui primitives (button, card, sheet, badge, skeleton)

hooks/use-analytics.ts         - useAnalytics(), useSectionTracking()
lib/
├── accent.ts                  - Three-hue accent class map
├── analytics.ts               - AmplitudeManager singleton
├── analytics-events.ts        - Event creators + getEventContext()
├── analytics-events.test.ts   - Vitest coverage for event creators
├── analytics-consent.ts       - Privacy signal checks
├── content.ts                 - Typed site content + SECTIONS registry
├── utils.ts                   - cn() className helper (clsx + tailwind-merge)
└── weather/                   - data.ts (fetch/validate/filter), data.test.ts, fixture.ts, types.ts
proxy.ts                       - Security headers (Node.js runtime; Next.js 16 renamed middleware.ts to proxy.ts)
vitest.config.ts               - Vitest config for lib/**/*.test.ts
```

### Content Rules

- No em dashes anywhere in site copy, documentation, or comments; use commas, colons, periods, or parentheses
- Every metric in site copy must trace to the resume or the engagement work summary; keep scope qualifiers (for example, "80% on the 11 costliest models") intact
- Voice: direct and specific, no filler vocabulary (avoid "delve", "robust", "seamless", "leverage", "empower", "cutting-edge")
- Documentation is part of the implementation contract. When changing a feature, event, data interface, route, or operational workflow, update the relevant README, `AGENTS.md`, `CLAUDE.md`, `TRACKING_PLAN.md`, `ANALYTICS_SYSTEM.md`, and on-page documentation in the same change. Do not leave documentation reconciliation as follow-up work.

### Weather Explorers

- `app/weather/page.tsx` renders the case-study page via `components/weather/weather-page-content.tsx`, which owns the tornado event explorer and composes `components/weather/dbt-project-explorer.tsx` (the native dbt project explorer). `weather_page_viewed` fires once on mount; `event_explorer_interaction` and `project_explorer_interaction` are scoped to each explorer; methodology-section visibility fires the shared `section_viewed` event (a `weather-methodology` entry in `SECTIONS`), not a weather-specific one. Full contract in `TRACKING_PLAN.md`.
- `app/api/weather/events` is the only browser-facing weather data route. The server-rendered page derives v2 year shards, `dbt-project.json`, and dbt docs from `WEATHER_DATA_URL`, and falls back to a visibly labeled v2 fixture when remote validation fails.
- The companion pipeline uses source-system staging, ephemeral intermediate conformance, and contracted marts. `fct_tornado_events` is the canonical fact, and v2 adds globally unique `eventKey` while retaining source-native `eventId`.
- The pipeline discovers the latest NCEI 2025 and 2026 files on each scheduled run, appends them to the historical baseline, then appends preliminary IEM point reports only for records after the latest confirmed NCEI timestamp. The event map uses source endpoint or point coordinates, and its connection line must never be described as a surveyed track.
- Do not conflate confirmed NCEI tornadoes with preliminary IEM Local Storm Reports. F/EF wind values are estimates inferred from damage. Begin/end coordinates are endpoints, not survey track geometry.
- The dbt project explorer's code viewer highlights SQL, YAML, Python, and Markdown with PrismJS (`components/weather/dbt-project-explorer.tsx`), using the same stock language grammars dbt docs itself ships (no custom Jinja grammar), so `{{ ref(...) }}` is colored however the SQL grammar happens to tokenize it, not a bespoke Jinja scheme. The token-to-color mapping is a dark-theme adaptation of dbt docs' own `prism-ghcolors` palette. The "Direct lineage" and "Model details" panels are tabs, not a side-by-side split, so the panel content is never width-constrained against the file tree.
- The dbt project explorer is a two-column `lg:grid-cols-[17rem_minmax(0,1fr)]` sidebar-plus-code split at `lg+`. Below `lg` that collapses to one column, where the file tree becomes a "Browse project files" drawer that is closed by default (so the code viewer, not a tall tree, is what a phone sees first) and closes again on file selection. Two layout constraints keep it from blowing past the viewport: the `<aside>` needs `min-w-0`, because a grid item defaults to `min-width: auto` and the tree's `whitespace-nowrap` filenames would otherwise set a ~430px min-content that stretches the whole explorer; and the tree's scroll container needs an explicit `max-height` at every breakpoint, because an `auto` grid row sizes to its items' max-content and `overflow-auto` alone does not cap that.
- "Model details" reports attached dbt tests as a single `Tests: N/N passing` count in the metadata grid, not a per-test badge list. The per-test names (`not_null_fct_tornado_events_event_key` and similar) are long, repetitive, and already covered by the project-level "tests passed" summary stat.

### Styling

Tailwind CSS 3 with HSL-based CSS custom properties defined in `globals.css`. Dark-only: ThemeProvider is `forcedTheme="dark"` and `:root` holds the single token set. Component variants use class-variance-authority. `cn()` from `lib/utils.ts` (clsx + tailwind-merge) is the standard className helper. Accent classes come from `lib/accent.ts`, not ad hoc color maps.

**Responsive rhythm:** home-page sections use `py-12 md:py-24` with `mb-8 md:mb-12` on their centered heading block. Mobile gets the tighter value and desktop keeps the original spacing, so a new section should follow the same pair rather than a flat `py-16`. `.section-kicker` also tightens its letter-spacing on small screens (`tracking-[0.14em] sm:tracking-[0.22em]`), since the uppercase mono kickers are wide enough to overflow a phone otherwise.

### Security Headers (proxy.ts)

Renamed from `middleware.ts` for Next.js 16 (the `middleware` file convention and exported function name are both deprecated in favor of `proxy`; see the Next.js 16 upgrade guide). The exported function is `proxy()`, not `middleware()`. It now runs on the Node.js runtime rather than the Edge runtime (Next 16 removed Edge runtime support for this convention entirely), which has no practical effect here since the implementation only sets response headers. Applied before every response:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera, microphone, geolocation all off
- `Content-Security-Policy-Report-Only`: `default-src 'self'`, `script-src`/`style-src` allow `'unsafe-inline'` (Next.js inline bootstrap + JSON-LD script, Tailwind inline styles), `img-src`/`connect-src` allow `https://tile.openstreetmap.org` (Leaflet tiles), `frame-ancestors 'none'`. Report-only: logs violations without blocking. Switching to enforcing (`Content-Security-Policy`, dropping `-Report-Only`) needs a period of watching real traffic for false positives first; not done yet.

`app/api/amplitude/route.ts` (the Amplitude batch proxy) accepts `application/json` (the normal SDK transport) and `text/plain` (what `navigator.sendBeacon()` sends on the `pagehide` flush) and rejects everything else, plus rejects bodies over 200KB, before forwarding, since it is otherwise an unauthenticated relay to Amplitude's batch API.

### Resume

Static PDF at `/public/resume/Chase_Burkhalter_Resume_2026-07.pdf`. Cache headers set in `next.config.mjs` (86400s public, 604800s stale-while-revalidate). The filename carries a version suffix because of that caching: replacing the bytes at a stable URL would keep serving the old resume to recent visitors for up to a day, plus a week of stale-while-revalidate. Bump the suffix whenever the resume content changes, and update `RESUME_FILE_NAME` in `lib/content.ts`, the hardcoded path in `next.config.mjs`, the pinned expectation in `lib/analytics-events.test.ts`, and the examples in `TRACKING_PLAN.md`, `README.md`, `AGENTS.md`, and `CLAUDE.md`. The `resume/` directory at the repo root (source PDF + work summary) is gitignored and must never be committed.
