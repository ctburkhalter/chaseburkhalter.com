# Analytics System Architecture

## Overview

This portfolio site uses a **standardized, production-ready analytics system** with:
- Single page view tracking on initial load
- Section tracking via Intersection Observer (scroll into view)
- Navigation click tracking
- Portfolio interaction tracking
- Error tracking via error boundaries
- Standardized event naming (snake_case)
- Type-safe event tracking with TypeScript
- No duplicate events
- Multi-platform support: Segment, GTM, and Amplitude (via Segment)

**📋 For complete event specifications, see [TRACKING_PLAN.md](./TRACKING_PLAN.md)**

## Event Flow

### 1. Initial Page Load
```
User loads site
  └─> AnalyticsProvider mounts
      └─> useAnalytics() initializes Segment + GTM
          └─> Tracks SINGLE page view event
              ├─> Segment: window.analytics.page()
              └─> GTM: window.dataLayer.push({ event: "page_view" })
```

### 2. Section Viewed (Scroll)
```
User scrolls to section
  └─> IntersectionObserver detects 50%+ visible
      └─> Tracks "section_viewed" event (ONCE per section per session)
          ├─> Segment: window.analytics.track("section_viewed", {...})
          └─> GTM: window.dataLayer.push({ event: "section_viewed", ... })
```

### 3. Navigation Click
```
User clicks navigation link (#about, #projects, etc.)
  └─> Click handler detects anchor link
      └─> Tracks "section_clicked" event
          ├─> Segment: window.analytics.track("section_clicked", {...})
          └─> GTM: window.dataLayer.push({ event: "section_clicked", ... })
```

## Tracked Sections

1. **hero** - Hero section at top
2. **about** - About section
3. **projects** - Projects showcase
4. **skills** - Skills/technologies
5. **demos** - Analytics demos
6. **contact** - Contact information

## Events

**All events follow snake_case naming convention and include standardized properties.**

For complete event specifications, property definitions, and examples, see **[TRACKING_PLAN.md](./TRACKING_PLAN.md)**.

### Automatic Events

#### `page_view`
Sent ONCE on initial page load

Properties: `path`, `title`, `referrer`, `url`, `hash`, `initial_load`, `timestamp`, `source`

#### `section_viewed`
Sent when section scrolls into view (50%+ visible), once per section per session

Properties: `section_id`, `section_name`, `interaction_type`, `url`, `timestamp`, `source`

#### `section_clicked`
Sent when navigation link is clicked

Properties: `section_id`, `section_name`, `click_source`, `url`, `timestamp`, `source`

### Interaction Events

#### `portfolio_interaction`
Sent when user interacts with demo buttons or portfolio elements

Properties: `action`, `interaction_type`, `portfolio_section`, `demo_section`, `user_agent`, `timestamp`, `source`

Valid actions: `project_card_view`, `skill_badge_click`, `analytics_demo_interaction`, `contact_form_view`, `tracking_enabled`, `tracking_disabled`

### Error Events

#### `error_occurred`
Sent when React error boundary catches an error

Properties: `error_type`, `error_message`, `error_stack`, `component_stack`, `timestamp`, `source`

Error types: `boundary` (from ErrorBoundary), `component` (from useErrorHandler hook)

### User Identification

#### `user_identify` (GTM only)
Sent when user is identified via analytics demo

Properties: `user_id`, `user_traits`, `identified_at`, `source`

**Note:** User ID must be minimum 5 characters (Amplitude requirement)

## No Duplicate Events

Deduplication is ensured by:

1. **Global state flags** - Prevent re-initialization
2. **pageViewTracked flag** - Ensures only 1 page view ever sent
3. **Set for tracked sections** - Each section view tracked once per session
4. **Single AnalyticsProvider** - Only one instance in the app

## File Structure

```
lib/
  analytics.ts                      # Core analytics (Segment + GTM)
  analytics-events.ts               # Event registry, constants, types & helpers
hooks/
  use-analytics.ts                  # React hooks for analytics
    - useAnalytics()                # Main hook (initialization + page view)
    - useSectionTracking()          # Section tracking with Intersection Observer
    - useTrackEvent()               # Simple event tracking (for demos)
components/
  analytics/
    analytics-provider.tsx          # Single source of truth for analytics
  analytics-demo.tsx                # Interactive analytics demo
  analytics-integrations.tsx        # Platform info & custom tracking UI
  error-boundary.tsx                # Error tracking integration
app/
  page.tsx                          # Main page with tracked sections
  layout.tsx                        # Root layout with AnalyticsProvider
TRACKING_PLAN.md                    # Complete event specifications
ANALYTICS_SYSTEM.md                 # This file - system architecture
```

## Key Benefits

✅ **No duplicates** - Single page view, sections tracked once per session
✅ **Standardized naming** - All events use snake_case convention
✅ **Type-safe** - TypeScript interfaces for all event properties
✅ **Well-documented** - Comprehensive tracking plan with examples
✅ **Centralized** - Single event registry for all event definitions
✅ **Multi-platform** - Segment, GTM, and Amplitude (via Segment)
✅ **Performance** - Intersection Observer is efficient
✅ **Maintainable** - Helper functions reduce code duplication
✅ **Validated** - User ID and event validation built-in
✅ **True SPA** - Treats site as single-page with sections

## Event Standardization

All events are now managed through a centralized registry in `lib/analytics-events.ts` that provides:

### Type-Safe Event Creation

```tsx
import { createPortfolioInteractionEvent } from "@/lib/analytics-events"
import { useTrackEvent } from "@/hooks/use-analytics"

function MyComponent() {
  const { trackEvent } = useTrackEvent()

  const handleClick = () => {
    const event = createPortfolioInteractionEvent(
      'project_card_view',
      'Project Card View',
      { demo_section: true }
    )
    trackEvent(event)
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

### Available Helper Functions

- `createPageViewEvent()` - Page view events
- `createSectionViewedEvent()` - Section scroll events
- `createSectionClickedEvent()` - Section navigation events
- `createPortfolioInteractionEvent()` - User interaction events
- `createErrorEvent()` - Error tracking events
- `createCustomEvent()` - User-defined events

### Event Constants

All event names are defined as constants:

```typescript
import { ANALYTICS_EVENTS } from "@/lib/analytics-events"

// Use constants instead of strings
trackEvent({
  name: ANALYTICS_EVENTS.PORTFOLIO_INTERACTION,
  properties: { ... }
})
```

### TypeScript Interfaces

Full type safety for event properties:

```typescript
interface PortfolioInteractionProperties {
  action: string
  interaction_type: string
  portfolio_section?: string
  demo_section?: boolean
  user_agent?: string
}
```

## Analytics Platforms

### Segment
**Customer Data Platform** that collects and routes data to downstream tools.

- **Integration**: Analytics.js loaded from CDN
- **Features**: Event tracking, user identification, middleware support
- **Special handling**: Filters invalid user IDs, maps anonymousId to Amplitude deviceId

### Google Tag Manager
**Tag Management System** for managing analytics tags and scripts.

- **Integration**: gtm.js script with dataLayer
- **Features**: Event tracking, custom variables, tag management
- **Special handling**: Properties flattened into event object

### Amplitude
**Product Analytics Platform** for understanding user behavior.

- **Integration**: Via Segment destination (not direct SDK)
- **Requirements**: User ID minimum 5 characters, requires userId OR deviceId
- **Special handling**: Segment middleware ensures proper ID mapping

## Environment Variables

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_key
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXX
```

## Migration Notes

### Event Naming Changes (v2.0)

Previous event names have been standardized to snake_case:

| Old Event Name | New Event Name | Notes |
|----------------|----------------|-------|
| `Error Boundary Triggered` | `error_occurred` | Now uses `error_type: "boundary"` |
| `Component Error` | `error_occurred` | Now uses `error_type: "component"` |
| `portfolio_project_card_view` | `portfolio_interaction` | Now uses `action: "project_card_view"` |
| `portfolio_skill_badge_click` | `portfolio_interaction` | Now uses `action: "skill_badge_click"` |
| Other `portfolio_*` events | `portfolio_interaction` | Dynamic event names consolidated |

### Removed Components

The following components were removed in previous refactor:
- `ProjectTracker` - No longer needed
- `SkillTracker` - No longer needed
- `ContactTracker` - No longer needed
- `portfolio-tracker.tsx` - Deleted

All tracking is now handled automatically by `AnalyticsProvider`.

## Documentation

- **[TRACKING_PLAN.md](./TRACKING_PLAN.md)** - Complete event specifications, properties, and usage guidelines
- **[ANALYTICS_SYSTEM.md](./ANALYTICS_SYSTEM.md)** - This file - system architecture overview
- **[lib/analytics-events.ts](./lib/analytics-events.ts)** - Event registry with constants, types, and helpers
