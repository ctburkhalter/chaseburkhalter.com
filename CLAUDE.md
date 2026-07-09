# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config; ignores .next, node_modules, resume/)
```

**Package manager:** pnpm@10.15.0. Do not use npm or yarn.

## Environment

Create `.env.local` with:
```
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_key_here
```
Get the key from Amplitude → Settings → Projects. In production, this is set as a Vercel environment variable.

## Architecture

**Single-page Next.js 15 portfolio** (App Router, TypeScript, React 19) deployed to Vercel. All content lives on `/`. Hash-based internal navigation (`#section-id`); there are no dynamic routes.

### Content Model

All copy and structured data live in `lib/content.ts` (typed: identity, nav, sections, impact stats, flagship case studies, projects, AI entries, experience, skills, about, contact). Section components under `components/sections/` render from this module; content edits are data edits, not JSX edits. Accent styling comes from the three-hue map in `lib/accent.ts` (green = data platform, violet = AI, orange = ops/incidents).

**Adding a page section:** add the `id` + `label` to `SECTIONS` in `lib/content.ts` (this drives IntersectionObserver targets and analytics display names), create the component in `components/sections/`, compose it in `app/page.tsx`, and update the section table in `TRACKING_PLAN.md`. Ids stay stable across redesigns so `section_viewed` history remains comparable.

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
| `page_view` | App init |
| `section_viewed` | IntersectionObserver with 20% bottom rootMargin, 0 threshold |
| `section_clicked` | Internal nav `a[href^="#"]` clicks |
| `resume_downloaded` | PDF link click, with `download_source` (hero/nav/contact) |
| `external_link_clicked` | Outbound links via `components/tracked-link.tsx`, with `link_type` + `link_location` |
| `contact_clicked` | Email/LinkedIn contact links via `components/tracked-link.tsx`, with `contact_method` |

**Key implementation guards:**
- `window.__pageViewTracked` survives React StrictMode double-mount to prevent duplicate `page_view`
- `window.__pageEventLinkId` is a 13-digit random ID shared across all events from the same page load
- `sessionStorage['portfolio:referrer']` is captured once on landing and stays stable across hash navigations
- `pagehide` listener switches to `sendBeacon` transport on tab close for reliable flush

**Privacy:** If `navigator.doNotTrack`, `window.doNotTrack`, or `navigator.globalPrivacyControl` is set, analytics initializes but all calls become silent no-ops. No data is sent.

**Documentation:** `TRACKING_PLAN.md` (event specs + example payloads) and `ANALYTICS_SYSTEM.md` (architecture rationale) are the authoritative references for the analytics implementation. Keep both, plus the on-page Tracking Plan tab in `components/sections/analytics-showcase.tsx`, in sync when events change.

### Component & File Layout

```
app/
├── api/amplitude/route.ts     - First-party proxy (Node runtime)
├── layout.tsx                 - Root: metadata, JSON-LD, ThemeProvider (forced dark) + AnalyticsProvider
├── page.tsx                   - Thin composition of section components
└── globals.css                - Tailwind + HSL CSS custom properties + reduced-motion handling

components/
├── analytics/analytics-provider.tsx  - Section visibility + nav click tracking
├── sections/                         - One component per page section
│   ├── hero-section.tsx, impact-band.tsx, work-section.tsx, ai-section.tsx
│   ├── experience-section.tsx, skills-section.tsx, analytics-showcase.tsx
│   └── about-section.tsx, contact-section.tsx
├── flagship-card.tsx                 - Problem / approach / outcome case-study card
├── project-card.tsx                  - Compact cards (githubUrl / liveUrl props)
├── site-header.tsx / site-footer.tsx - Chrome, nav from NAV_ITEMS
├── tracked-link.tsx                  - Client leaf for outbound/contact tracking
├── resume-download-link.tsx          - Client leaf for resume_downloaded
└── ui/                               - shadcn/ui primitives (button, card, sheet, badge, skeleton)

hooks/use-analytics.ts         - useAnalytics(), useSectionTracking()
lib/
├── accent.ts                  - Three-hue accent class map
├── analytics.ts               - AmplitudeManager singleton
├── analytics-events.ts        - Event creators + getEventContext()
├── analytics-consent.ts       - Privacy signal checks
└── content.ts                 - Typed site content + SECTIONS registry
middleware.ts                  - Security headers (Edge Runtime)
```

### Content Rules

- No em dashes anywhere in site copy, documentation, or comments; use commas, colons, periods, or parentheses
- Every metric in site copy must trace to the resume or the engagement work summary; keep scope qualifiers (for example, "80% on the 11 costliest models") intact
- Voice: direct and specific, no filler vocabulary (avoid "delve", "robust", "seamless", "leverage", "empower", "cutting-edge")

### Styling

Tailwind CSS 3 with HSL-based CSS custom properties defined in `globals.css`. Dark-only: ThemeProvider is `forcedTheme="dark"` and `:root` holds the single token set. Component variants use class-variance-authority. `cn()` from `lib/utils.ts` (clsx + tailwind-merge) is the standard className helper. Accent classes come from `lib/accent.ts`, not ad hoc color maps.

### Security Headers (middleware.ts)

Applied at the Edge before every response:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera, microphone, geolocation all off

### Resume

Static PDF at `/public/resume/Chase_Burkhalter_Resume_2026.pdf`. Cache headers set in `next.config.mjs` (86400s public, 604800s stale-while-revalidate). The `resume/` directory at the repo root (source PDF + work summary) is gitignored and must never be committed.
