# chaseburkhalter.com

Personal portfolio for Chase Burkhalter, Senior Data & Analytics Engineer. Live at [chaseburkhalter.com](https://chaseburkhalter.com).

Built with Next.js 16 and Tailwind CSS, and designed, implemented, instrumented, and documented with Claude Code. The site carries a production-grade analytics implementation that demonstrates real-world instrumentation architecture, ad-blocker bypass, and event enrichment patterns; the live demo section on the page runs the exact pipeline described below.

## Features

- **Modern stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- **Typed content model**: all copy and structured data live in `lib/content.ts`, so content edits never touch JSX
- **Production analytics**: Amplitude Browser SDK with a first-party proxy, fully instrumented
- **Live analytics showcase**: real-time event stream and rendered tracking plan, visible to site visitors
- **Event enrichment**: every event carries device context, viewport, timezone, session-stable referrer, UTM attribution, reload detection, and per-load event linking
- **Ad-blocker bypass**: events route through `/api/amplitude` (same domain) instead of `amplitude.com`, which is on EasyList
- **Engagement tracking**: resume downloads, outbound link clicks, and contact clicks, each with source attribution
- **Privacy-aware loading**: respects Do Not Track and Global Privacy Control browser signals
- **Security headers**: X-Frame-Options, nosniff, referrer and permissions policies, plus a report-only CSP, via `proxy.ts` (Node.js runtime)
- **Dark engineering design system**: navy UI, terminal-style panels, three restrained accent hues
- **Accessible and responsive**: skip link, semantic landmarks, reduced-motion support, mobile-first layout
- **Tornado data engineering demo**: `/weather` pairs a focused tornado event explorer with a native dbt project explorer, both backed by a companion dbt-duckdb pipeline that combines confirmed NCEI events with labeled preliminary IEM Local Storm Reports after the NCEI cutoff
- **Dedicated Weather navigation**: the primary header links directly to the weather case study from every route

## Analytics Implementation

### Why direct Amplitude (not Segment)

The previous architecture used Segment as a CDP to route events to Amplitude. It was removed because:

- `cdn.segment.com` and `api.segment.io` are on virtually every major ad blocker block list; an estimated 25 to 40% of visitors were generating zero events
- `page_view` was queued behind a `whenReady()` callback that never fired when Segment was blocked, while `section_viewed` (fired later after scroll) always succeeded, which explained the symptom of visitors with section events but no page view
- Segment's CDP value is multi-destination routing; this site has one destination (Amplitude), making the abstraction pure overhead

### Pipeline

```
Browser SDK (@amplitude/analytics-browser)
  └── POST /api/amplitude        (same domain, bypasses ad blockers)
        └── Next.js API Route
              └── api2.amplitude.com/batch   (server-side, not blockable)
```

### Tracked Events

| Event | Trigger |
|-------|---------|
| `page_view` | Initial page load |
| `section_viewed` | Section leading edge reaches 20% above the viewport bottom |
| `section_clicked` | Internal navigation link click |
| `resume_downloaded` | Resume PDF link click (`download_source`: nav / hero / contact) |
| `external_link_clicked` | Outbound link click (`link_type`: github / linkedin / live_site / company) |
| `contact_clicked` | Email or LinkedIn contact click (`contact_method`) |

All events are automatically enriched with:
- Device context (UA, screen, viewport, timezone, pixel ratio, connection type)
- Session-stable referrer (captured on landing, persisted in sessionStorage)
- UTM attribution (captured from the landing URL, persisted in sessionStorage)
- `is_page_reload`, which identifies browser refreshes via the Navigation Timing API
- `page_event_link_id`, a 13-digit per-load random ID linking all events from the same load

### Documentation

- [TRACKING_PLAN.md](./TRACKING_PLAN.md): complete event specifications, property tables, example payloads, architectural rationale
- [ANALYTICS_SYSTEM.md](./ANALYTICS_SYSTEM.md): system architecture, runtime flow, proxy design decisions, file structure

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # ESLint
pnpm test       # vitest run
pnpm build      # production build
```

CI (`.github/workflows/ci.yml`) runs lint, `tsc --noEmit`, `pnpm test`, and `pnpm build` on every push to `main` and every pull request.

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key
```

Get your API key from Amplitude → Settings → Projects → your project → API Key.

See `.env.example` for the full variable list. Configure the same value in Vercel (Settings → Environment Variables) for production. `.env.local` is excluded from git.

### Weather explorer data

`/weather` renders labeled v2 contract fixtures until `WEATHER_DATA_URL` points to the companion pipeline's `data/v2/portfolio-weather.json` artifact. The same base supplies v2 year shards, `dbt-project.json`, and dbt docs. The pipeline uses source-system staging, ephemeral intermediate conformance, a contracted canonical event fact, governed reference data, tests, and GitHub Pages publishing.

`app/api/weather/events`, the only browser-facing weather data route, caps a From/Through year-range query at 20 years (`maxRangeSpan` in that route) and 400s a wider request. The dashboard's From/Through year selects are mutually constrained client-side so a visitor can never choose a wider span in the first place, rather than hitting that limit and seeing the result set clear.

The page documents why the data distinction matters: NCEI Storm Events are historical confirmations, and IEM Local Storm Reports are preliminary point reports appended only after the latest confirmed NCEI timestamp. The published event contract exposes `eventCoverage`, `recordStatus`, `sourceSystem`, and `isSurveyedTrack` so the event explorer can show current rows without treating preliminary reports as surveyed tornado tracks. The native dbt project explorer shows curated public source files, direct model lineage, test outcomes, and a commit-pinned source link from the same successful pipeline run. Its interaction analytics are specified in [TRACKING_PLAN.md](./TRACKING_PLAN.md).

## Project Structure

Kept current by hand alongside feature work; if this ever drifts from reality, `CLAUDE.md`'s "Component & File Layout" section and a fresh `find app components hooks lib -type f` are the fastest way to reconcile it.

```
app/
  api/
    amplitude/
      route.ts                      # First-party proxy to api2.amplitude.com/batch
    weather/
      events/
        route.ts                    # Validated tornado event-query API (the only browser-facing weather route; the weather page itself calls lib/weather/data.ts server-side)
  weather/
    page.tsx                        # South Alabama Tornado Watch case-study route
    loading.tsx                     # Route-level loading state
  error.tsx                         # Route error boundary
  favicon.ico                       # Browser tab favicon
  globals.css                       # Tailwind + HSL CSS custom properties + reduced-motion handling
  icon.svg                          # App icon (favicon fallback / PWA)
  layout.tsx                        # Root layout: metadata, JSON-LD, providers
  loading.tsx                       # Root-level loading state
  not-found.tsx                     # 404 page
  opengraph-image.tsx               # Dynamic OG image
  page.tsx                          # Thin composition of section components
  robots.ts                         # robots.txt generation
  sitemap.ts                        # Sitemap generation
components/
  analytics/
    analytics-provider.tsx          # Section + navigation tracking
  sections/                         # One component per page section
    hero-section.tsx
    impact-band.tsx
    work-section.tsx                # Flagship case-study cards + supporting projects
    ai-section.tsx                  # AI-ready data systems evidence
    experience-section.tsx
    skills-section.tsx
    analytics-showcase.tsx          # Live event stream + tracking plan UI
    about-section.tsx
    contact-section.tsx
  ui/                                # shadcn/ui primitives: badge, button, card, sheet, skeleton
  weather/
    weather-dashboard.tsx           # Tornado event explorer
    dbt-project-explorer.tsx        # Native dbt project explorer: files, lineage, tests
    tornado-event-map.tsx           # Leaflet event map (dynamically imported, client-only)
  flagship-card.tsx                 # Problem / approach / outcome case-study card
  project-card.tsx                  # Compact project cards (githubUrl / liveUrl)
  site-header.tsx / site-footer.tsx
  mobile-navigation.tsx             # Mobile nav sheet
  theme-provider.tsx                # next-themes wrapper (forcedTheme="dark")
  resume-download-link.tsx          # Tracked resume download link (client component)
  tracked-link.tsx                  # Tracked outbound / contact link (client component)
hooks/
  use-analytics.ts                  # Analytics init, page view, section tracking hooks
lib/
  accent.ts                         # Three-hue accent class map
  analytics.ts                      # AmplitudeProvider and AnalyticsManager singleton
  analytics-consent.ts              # DNT / GPC browser signal checks
  analytics-events.ts               # Event constants, types, creators, getEventContext()
  analytics-events.test.ts          # Vitest coverage for event creators
  content.ts                        # Typed site content + SECTIONS registry
  utils.ts                          # cn() className helper (clsx + tailwind-merge)
  weather/
    data.ts                         # Fetch, validate, and filter weather + dbt-project artifacts
    data.test.ts                    # Vitest coverage for validation guards and filters
    fixture.ts                      # Local contract fixture used when WEATHER_DATA_URL is unset
    types.ts                        # Weather + dbt-project-explorer payload types
proxy.ts                            # Node.js runtime security headers (renamed from middleware.ts in Next.js 16)
public/
  headshot.jpg                      # Profile photo (hero section)
  resume/
    Chase_Burkhalter_Resume_2026.pdf
.claude/
  skills/
    verify/
      SKILL.md                      # Playwright-driven local verification recipe for this repo
vitest.config.ts                    # Vitest config for lib/**/*.test.ts
TRACKING_PLAN.md
ANALYTICS_SYSTEM.md
```

## Deployment

Deployed on Vercel. Pushes to `main` deploy automatically.
