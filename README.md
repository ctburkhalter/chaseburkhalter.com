# chaseburkhalter.com

Personal portfolio for Chase Burkhalter, Senior Analytics Engineer. Built with Next.js 15 and Tailwind CSS. Features a production-grade analytics implementation that demonstrates real-world instrumentation architecture, ad-blocker bypass, and event enrichment patterns.

## Features

- **Modern tech stack** — Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- **Production analytics** — Amplitude Browser SDK with first-party proxy, fully instrumented
- **Live analytics showcase** — real-time event stream and rendered tracking plan, visible to site visitors
- **Event enrichment** — every event carries device context, viewport, timezone, session-stable referrer, UTM attribution, reload detection, and per-load event linking
- **Ad-blocker bypass** — events route through `/api/amplitude` (same domain) instead of `amplitude.com`, which is on EasyList
- **Resume download tracking** — `resume_downloaded` event with `download_source` attribution (nav / hero / contact)
- **Privacy-aware loading** — respects Do Not Track and Global Privacy Control browser signals
- **Security headers** — X-Frame-Options, CSP-adjacent headers via Edge Runtime middleware
- **Dark engineering design system** — navy UI, terminal-style panels, and green / purple / orange accents
- **Responsive design** — mobile-first, accessible UI

## Analytics Implementation

### Why direct Amplitude (not Segment)

The previous architecture used Segment as a CDP to route events to Amplitude. It was removed because:

- `cdn.segment.com` and `api.segment.io` are on virtually every major ad blocker block list — approximately 25–40% of visitors were generating zero events
- `page_view` was queued behind a `whenReady()` callback that never fired when Segment was blocked, while `section_viewed` (fired seconds later after scroll) always succeeded — explaining the symptom of visitors with section events but no page view
- Segment's CDP value is multi-destination routing; this site has one destination (Amplitude), making the abstraction pure overhead

### Pipeline

```
Browser SDK (@amplitude/analytics-browser)
  └── POST /api/amplitude        (same domain — bypasses ad blockers)
        └── Next.js API Route
              └── api2.amplitude.com/batch   (server-side, not blockable)
```

### Tracked Events

| Event | Trigger |
|-------|---------|
| `page_view` | Initial page load |
| `section_viewed` | 50% viewport intersection per section |
| `section_clicked` | Internal navigation link click |
| `resume_downloaded` | Resume PDF link click (`download_source`: nav / hero / contact) |

All events are automatically enriched with:
- Device context (UA, screen, viewport, timezone, pixel ratio, connection type)
- Session-stable referrer (captured on landing, persisted in sessionStorage)
- UTM attribution (captured from landing URL, persisted in sessionStorage)
- `is_page_reload` — identifies browser refreshes via Navigation Timing API
- `page_event_link_id` — 13-digit per-load random ID linking all events from the same load

### Documentation

- [TRACKING_PLAN.md](./TRACKING_PLAN.md) — complete event specifications, property tables, example payloads, architectural rationale
- [ANALYTICS_SYSTEM.md](./ANALYTICS_SYSTEM.md) — system architecture, runtime flow, proxy design decisions, file structure

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key
```

Get your API key from Amplitude → Settings → Projects → your project → API Key.

See `.env.example` for the full variable list. Configure the same value in Vercel (Settings → Environment Variables) for production. `.env.local` is excluded from git.

## Project Structure

```
app/
  api/
    amplitude/
      route.ts                      # First-party proxy to api2.amplitude.com/batch
  icon.svg                          # Browser tab favicon / app icon
  layout.tsx                        # Root layout — mounts AnalyticsProvider
  page.tsx                          # Main portfolio page
  opengraph-image.tsx               # Dynamic OG image
  sitemap.ts                        # Sitemap generation
components/
  analytics/
    analytics-provider.tsx          # Section + navigation tracking
  analytics-showcase.tsx            # Live event stream + tracking plan UI
  experience-section.tsx            # Work history timeline
  mobile-navigation.tsx             # Mobile nav sheet
  project-card.tsx                  # Project display cards (optional githubUrl prop)
  resume-download-link.tsx          # Tracked resume download link (client component)
hooks/
  use-analytics.ts                  # Analytics init, page view, section tracking hooks
lib/
  analytics.ts                      # AmplitudeProvider and AnalyticsManager singleton
  analytics-consent.ts              # DNT / GPC browser signal checks
  analytics-events.ts               # Event constants, types, creators, getEventContext()
middleware.ts                       # Edge Runtime security headers
public/
  headshot.jpg                      # Profile photo (hero section)
  resume/
    Chase_Burkhalter_Resume_2026.pdf
TRACKING_PLAN.md
ANALYTICS_SYSTEM.md
```

## Deployment

Deployed on Vercel. Pushes to `main` deploy automatically.
