# chaseburkhalter.com

Personal portfolio for Chase Burkhalter, Senior Data & Analytics Engineer. Live at [chaseburkhalter.com](https://chaseburkhalter.com).

Built with Next.js 15 and Tailwind CSS, and designed, implemented, instrumented, and documented with Claude Code. The site carries a production-grade analytics implementation that demonstrates real-world instrumentation architecture, ad-blocker bypass, and event enrichment patterns; the live demo section on the page runs the exact pipeline described below.

## Features

- **Modern stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- **Typed content model**: all copy and structured data live in `lib/content.ts`, so content edits never touch JSX
- **Production analytics**: Amplitude Browser SDK with a first-party proxy, fully instrumented
- **Live analytics showcase**: real-time event stream and rendered tracking plan, visible to site visitors
- **Event enrichment**: every event carries device context, viewport, timezone, session-stable referrer, UTM attribution, reload detection, and per-load event linking
- **Ad-blocker bypass**: events route through `/api/amplitude` (same domain) instead of `amplitude.com`, which is on EasyList
- **Engagement tracking**: resume downloads, outbound link clicks, and contact clicks, each with source attribution
- **Privacy-aware loading**: respects Do Not Track and Global Privacy Control browser signals
- **Security headers**: X-Frame-Options, nosniff, referrer and permissions policies via Edge Runtime middleware
- **Dark engineering design system**: navy UI, terminal-style panels, three restrained accent hues
- **Accessible and responsive**: skip link, semantic landmarks, reduced-motion support, mobile-first layout

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
  layout.tsx                        # Root layout: metadata, JSON-LD, providers
  page.tsx                          # Thin composition of section components
  opengraph-image.tsx               # Dynamic OG image
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
  flagship-card.tsx                 # Problem / approach / outcome case-study card
  project-card.tsx                  # Compact project cards (githubUrl / liveUrl)
  site-header.tsx / site-footer.tsx
  mobile-navigation.tsx             # Mobile nav sheet
  resume-download-link.tsx          # Tracked resume download link (client component)
  tracked-link.tsx                  # Tracked outbound / contact link (client component)
hooks/
  use-analytics.ts                  # Analytics init, page view, section tracking hooks
lib/
  accent.ts                         # Three-hue accent class map
  analytics.ts                      # AmplitudeProvider and AnalyticsManager singleton
  analytics-consent.ts              # DNT / GPC browser signal checks
  analytics-events.ts               # Event constants, types, creators, getEventContext()
  content.ts                        # Typed site content + SECTIONS registry
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
