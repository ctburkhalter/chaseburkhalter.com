# chaseburkhalter.com

This repository contains the source code for my personal portfolio built with Next.js and Tailwind CSS. It showcases real-world analytics projects with a production-ready analytics implementation.

## Features

- **Modern Tech Stack**: Next.js 15, React, TypeScript, Tailwind CSS
- **Production Analytics**: Segment, Google Tag Manager, and Amplitude integration
- **Type-Safe Event Tracking**: Centralized event registry with TypeScript
- **Responsive Design**: Mobile-first, accessible UI
- **Performance Optimized**: Intersection Observer-based tracking
- **Privacy-Aware Loading**: Respects Do Not Track and Global Privacy Control browser signals

## Analytics Implementation

This portfolio features a sophisticated, production-ready analytics system that demonstrates real-world analytics engineering expertise:

### Platforms
- **Segment** - Customer Data Platform for event collection and routing
- **Google Tag Manager** - Tag management and analytics orchestration
- **Amplitude** - Product analytics (via Segment destination)

### Features
- Standardized event naming (snake_case convention)
- Type-safe event tracking with TypeScript interfaces
- Centralized event registry and helper functions
- Comprehensive tracking plan with full documentation
- User ID validation and sanitization
- Automatic deduplication of events
- Analytics script loading through `next/script`
- Error tracking for analytics-related browser errors
- Do Not Track and Global Privacy Control checks before loading third-party analytics scripts

### Documentation
- **[TRACKING_PLAN.md](./TRACKING_PLAN.md)** - Complete event specifications and usage guidelines
- **[ANALYTICS_SYSTEM.md](./ANALYTICS_SYSTEM.md)** - System architecture and implementation details
- **[lib/analytics-events.ts](./lib/analytics-events.ts)** - Event registry with constants and types

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Build for production:

```bash
pnpm build
```

### Environment Variables

Create a `.env.local` file with your analytics keys:

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
```

See `.env.example` for the complete list of required variables.

`.env.local` is intentionally ignored by git. Configure the same `NEXT_PUBLIC_*` values in Vercel or your deployment environment.

## Project Structure

```
├── app/                        # Next.js app directory
│   ├── layout.tsx             # Root layout with analytics
│   └── page.tsx               # Main portfolio page
├── components/                 # React components
│   ├── analytics/             # Analytics components
│   ├── mobile-navigation.tsx  # Mobile navigation sheet
│   └── project-card.tsx       # Project display cards
├── lib/                       # Core utilities
│   ├── analytics-consent.ts   # Browser privacy signal checks
│   ├── analytics.ts           # Analytics platform integrations
│   └── analytics-events.ts    # Event registry & types
├── hooks/                     # React hooks
│   └── use-analytics.ts       # Analytics tracking hooks
├── TRACKING_PLAN.md           # Event specifications
└── ANALYTICS_SYSTEM.md        # Architecture documentation
```

## Analytics Events

All events follow a standardized naming convention and include type-safe properties:

- `page_view` - Initial page load tracking
- `section_viewed` - Section visibility tracking (Intersection Observer)
- `section_clicked` - Navigation click tracking
- `portfolio_interaction` - User interaction tracking
- `error_occurred` - Error boundary tracking

See [TRACKING_PLAN.md](./TRACKING_PLAN.md) for complete event specifications.

## Deployment

The site is deployed on Vercel and updates automatically when changes are pushed to the `main` branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ctburkhalter/chaseburkhalter.com)

## License

MIT
