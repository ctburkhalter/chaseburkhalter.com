# chaseburkhalter.com

Personal portfolio for Chase Burkhalter, Senior Analytics Engineer. Built with Next.js 15 and Tailwind CSS. Features a production-grade analytics implementation that demonstrates real-world CDP-to-destination instrumentation.

## Features

- **Modern tech stack** — Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- **Production analytics** — Segment CDP → GTM → Amplitude pipeline, fully instrumented
- **Live analytics showcase** — real-time event stream and rendered tracking plan, visible to site visitors
- **Event enrichment** — every event carries device context, viewport, timezone, and UTM marketing attribution
- **Resume download tracking** — `resume_downloaded` event with source attribution (nav / hero / contact)
- **Privacy-aware loading** — respects Do Not Track and Global Privacy Control browser signals
- **Security headers** — X-Frame-Options, CSP-adjacent headers via Edge Runtime middleware
- **Responsive design** — mobile-first, accessible UI

## Analytics Implementation

### Pipeline

```
Browser events
  → Segment (CDP, write key)
    → GTM (tag management)
      → Amplitude (destination)
```

### Tracked Events

| Event | Trigger |
|-------|---------|
| `page_view` | Initial page load |
| `section_viewed` | 50% viewport intersection per section |
| `section_clicked` | Internal navigation link click |
| `resume_downloaded` | Resume PDF link click (source: nav / hero / contact) |

All events are automatically enriched with device context (UA, screen, viewport, timezone, pixel ratio, connection type) and UTM attribution captured from the landing URL.

### Documentation

- [TRACKING_PLAN.md](./TRACKING_PLAN.md) — complete event specifications, property tables, example payloads
- [ANALYTICS_SYSTEM.md](./ANALYTICS_SYSTEM.md) — system architecture, runtime flow, file structure

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
```

See `.env.example` for the full variable list. Configure the same values in Vercel for production. `.env.local` is excluded from git.

## Project Structure

```
app/
  layout.tsx                    # Root layout — analytics scripts, GTM noscript, provider
  page.tsx                      # Main portfolio page
  opengraph-image.tsx           # Dynamic OG image
  sitemap.ts                    # Sitemap generation
components/
  analytics/
    analytics-provider.tsx      # Section + navigation tracking
    analytics-scripts.tsx       # next/script Segment and GTM loaders
    gtm-noscript.tsx            # GTM <noscript> iframe fallback
  analytics-showcase.tsx        # Live event stream + tracking plan UI
  experience-section.tsx        # Work history timeline
  mobile-navigation.tsx         # Mobile nav sheet
  project-card.tsx              # Project display cards (optional githubUrl prop)
  resume-download-link.tsx      # Tracked resume download link (client component)
  toast.tsx                     # Toast notifications
hooks/
  use-analytics.ts              # Analytics init, page view, section tracking
lib/
  analytics.ts                  # Segment/GTM providers and AnalyticsManager
  analytics-consent.ts          # DNT / GPC browser signal checks
  analytics-events.ts           # Event constants, types, creators, getEventContext()
middleware.ts                   # Edge Runtime security headers
public/
  headshot.jpg                  # Profile photo (hero section)
  resume/
    Chase_Burkhalter_Resume_2026.pdf
TRACKING_PLAN.md
ANALYTICS_SYSTEM.md
```

## Deployment

Deployed on Vercel. Pushes to `main` deploy automatically.
