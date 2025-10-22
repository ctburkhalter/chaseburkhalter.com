# Analytics System Architecture

## Overview

This portfolio site uses a **simplified, SPA-focused analytics system** with:
- Single page view tracking on initial load
- Section tracking via Intersection Observer (scroll into view)
- Navigation click tracking
- No duplicate events
- Only Segment and GTM providers

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

### page_view
Sent ONCE on initial page load

Properties:
- `path`: URL pathname
- `title`: Document title
- `referrer`: Document referrer
- `url`: Full URL
- `hash`: URL hash
- `initial_load`: true
- `timestamp`: ISO timestamp
- `source`: "portfolio"

### section_viewed
Sent when section scrolls into view (50%+ visible)

Properties:
- `section_id`: ID of section (e.g., "about")
- `section_name`: Formatted name (e.g., "About")
- `interaction_type`: "scroll"
- `url`: Current URL
- `timestamp`: ISO timestamp
- `source`: "portfolio"

### section_clicked
Sent when navigation link is clicked

Properties:
- `section_id`: ID of section
- `section_name`: Formatted name
- `click_source`: "navigation"
- `url`: Current URL
- `timestamp`: ISO timestamp
- `source`: "portfolio"

## No Duplicate Events

Deduplication is ensured by:

1. **Global state flags** - Prevent re-initialization
2. **pageViewTracked flag** - Ensures only 1 page view ever sent
3. **Set for tracked sections** - Each section view tracked once per session
4. **Single AnalyticsProvider** - Only one instance in the app

## File Structure

```
lib/analytics.ts                    # Core analytics (Segment + GTM only)
hooks/use-analytics.ts              # React hooks for analytics
  - useAnalytics()                  # Main hook (initialization + page view)
  - useSectionTracking()            # Section tracking with Intersection Observer
  - useTrackEvent()                 # Simple event tracking (for demos)
components/analytics/
  analytics-provider.tsx            # Single source of truth for analytics
app/page.tsx                        # Main page (no tracker components!)
```

## Key Benefits

✅ **No duplicates** - Single page view, sections tracked once
✅ **Simple** - Only Segment + GTM
✅ **Performance** - Intersection Observer is efficient
✅ **Maintainable** - All tracking logic in AnalyticsProvider
✅ **True SPA** - Treats site as single-page with sections

## Usage in Components

For custom event tracking (e.g., in demo components):

```tsx
import { useTrackEvent } from "@/hooks/use-analytics"

function MyComponent() {
  const { trackEvent } = useTrackEvent()
  
  const handleClick = () => {
    trackEvent({
      name: "custom_event",
      properties: {
        button_name: "example",
        timestamp: new Date().toISOString()
      }
    })
  }
  
  return <button onClick={handleClick}>Click Me</button>
}
```

## Environment Variables

```bash
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_key
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXX
```

## Removed Components

The following components were removed in the refactor:
- `ProjectTracker` - No longer needed
- `SkillTracker` - No longer needed  
- `ContactTracker` - No longer needed
- `portfolio-tracker.tsx` - Deleted

All tracking is now handled automatically by `AnalyticsProvider`.
