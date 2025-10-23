# Analytics Tracking Plan

## Overview

This document defines the standardized event tracking specification for the portfolio website. All events are tracked across three platforms:
- **Segment** (Customer Data Platform)
- **Google Tag Manager** (Tag Management System)
- **Amplitude** (Product Analytics - via Segment)

## Naming Conventions

### Event Names
- **Format**: `snake_case` (all lowercase with underscores)
- **Structure**: `{category}_{action}` or `{category}_{object}_{action}`
- **Examples**: `page_view`, `section_viewed`, `error_occurred`

### Property Names
- **Format**: `snake_case` (all lowercase with underscores)
- **Examples**: `section_id`, `error_message`, `user_agent`

### Reserved Properties
The following properties are automatically added to all events:
- `timestamp` (ISO 8601 format)
- `source` (always "portfolio")

## Event Catalog

### 1. Page Events

#### `page_view`
**Description**: Tracks initial page load (fires once per session)

**When to Fire**: On initial application mount, after analytics initialization

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `path` | string | Yes | URL pathname | `"/"` |
| `title` | string | Yes | Document title | `"Chase Burkhalter - Portfolio"` |
| `url` | string | Yes | Full URL | `"https://chaseburkhalter.com/"` |
| `referrer` | string | No | HTTP referrer | `"https://google.com"` |
| `hash` | string | No | URL hash | `"#projects"` |
| `initial_load` | boolean | Yes | Always true for this event | `true` |

**Example Payload**:
```json
{
  "event": "page_view",
  "properties": {
    "path": "/",
    "title": "Chase Burkhalter - Portfolio",
    "url": "https://chaseburkhalter.com/",
    "referrer": "https://google.com",
    "hash": "",
    "initial_load": true,
    "timestamp": "2025-01-15T10:30:00.000Z",
    "source": "portfolio"
  }
}
```

---

### 2. Section Events

#### `section_viewed`
**Description**: Tracks when a page section becomes visible (50%+ in viewport)

**When to Fire**: When user scrolls and section reaches 50% visibility threshold

**Frequency**: Once per section per session

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | DOM ID of section | `"projects"` |
| `section_name` | string | Yes | Human-readable section name | `"Projects"` |
| `interaction_type` | string | Yes | Always "scroll" | `"scroll"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

**Example Payload**:
```json
{
  "event": "section_viewed",
  "properties": {
    "section_id": "projects",
    "section_name": "Projects",
    "interaction_type": "scroll",
    "url": "https://chaseburkhalter.com/",
    "timestamp": "2025-01-15T10:31:00.000Z",
    "source": "portfolio"
  }
}
```

**Tracked Sections**:
- `hero` - Hero Section
- `about` - About Section
- `projects` - Projects Section
- `skills` - Skills Section
- `demos` - Analytics Demos Section
- `contact` - Contact Section

---

#### `section_clicked`
**Description**: Tracks clicks on navigation links to sections

**When to Fire**: When user clicks navigation link to scroll to section

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `section_id` | string | Yes | Target section ID | `"projects"` |
| `section_name` | string | Yes | Human-readable section name | `"Projects"` |
| `click_source` | string | Yes | Where click originated | `"navigation"` |
| `url` | string | Yes | Current page URL | `"https://chaseburkhalter.com/"` |

**Example Payload**:
```json
{
  "event": "section_clicked",
  "properties": {
    "section_id": "projects",
    "section_name": "Projects",
    "click_source": "navigation",
    "url": "https://chaseburkhalter.com/",
    "timestamp": "2025-01-15T10:32:00.000Z",
    "source": "portfolio"
  }
}
```

---

### 3. User Identification Events

#### `user_identified`
**Description**: Associates a user ID with the current session

**When to Fire**: When user submits identification form or is authenticated

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `user_id` | string | Yes | User identifier (min 5 chars) | `"user@example.com"` |
| `visited_portfolio` | boolean | No | User visited portfolio | `true` |
| `visited_at` | string | No | Visit timestamp | `"2025-01-15T10:30:00.000Z"` |
| `source` | string | No | Identification source | `"analytics_demo"` |

**Validation Rules**:
- `user_id` must be at least 5 characters (Amplitude requirement)
- Invalid IDs like `"me"`, empty strings, or `null` are automatically filtered

**Example Segment Call**:
```javascript
analytics.identify("user@example.com", {
  visited_portfolio: true,
  visited_at: "2025-01-15T10:30:00.000Z",
  source: "analytics_demo"
})
```

**GTM Event**:
```json
{
  "event": "user_identify",
  "user_id": "user@example.com",
  "user_traits": {
    "visited_portfolio": true,
    "visited_at": "2025-01-15T10:30:00.000Z",
    "source": "analytics_demo"
  },
  "identified_at": "2025-01-15T10:30:00.000Z",
  "source": "portfolio"
}
```

---

### 4. Interaction Events

#### `portfolio_interaction`
**Description**: Generic portfolio interaction event with action type

**When to Fire**: User interacts with demo buttons or portfolio elements

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `action` | string | Yes | Action performed | `"project_card_view"` |
| `interaction_type` | string | Yes | Type of interaction | `"Project Card View"` |
| `portfolio_section` | string | No | Section where interaction occurred | `"analytics_demo"` |
| `demo_section` | boolean | No | Whether interaction was in demo | `true` |

**Valid Actions**:
- `project_card_view` - User viewed project card
- `skill_badge_click` - User clicked skill badge
- `analytics_demo_interaction` - User interacted with analytics demo
- `contact_form_view` - User viewed contact form
- `tracking_enabled` - User enabled tracking
- `tracking_disabled` - User disabled tracking
- `analytics_demo_tab_{tab_name}` - User switched demo tabs

**Example Payload**:
```json
{
  "event": "portfolio_interaction",
  "properties": {
    "action": "project_card_view",
    "interaction_type": "Project Card View",
    "portfolio_section": "analytics_demo",
    "demo_section": true,
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2025-01-15T10:33:00.000Z",
    "source": "portfolio"
  }
}
```

---

### 5. Error Events

#### `error_occurred`
**Description**: Tracks application errors caught by error boundaries

**When to Fire**: When React error boundary catches an error

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `error_type` | string | Yes | Type of error | `"boundary"` or `"component"` |
| `error_message` | string | Yes | Error message | `"Cannot read property..."` |
| `error_stack` | string | No | Error stack trace | `"Error: Cannot read..."` |
| `component_stack` | string | No | React component stack | `"at Button..."` |

**Error Types**:
- `boundary` - Error caught by ErrorBoundary component
- `component` - Error caught by useErrorHandler hook

**Example Payload**:
```json
{
  "event": "error_occurred",
  "properties": {
    "error_type": "boundary",
    "error_message": "Cannot read property 'map' of undefined",
    "error_stack": "Error: Cannot read property 'map' of undefined\n  at Component...",
    "component_stack": "at AnalyticsDemo\n  at ErrorBoundary",
    "timestamp": "2025-01-15T10:35:00.000Z",
    "source": "portfolio"
  }
}
```

---

### 6. Custom Events

#### `custom_event`
**Description**: User-defined events from analytics demo interface

**When to Fire**: When user submits custom event via analytics demo form

**Properties**:
| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `portfolio_demo` | boolean | Yes | Always true | `true` |
| `custom_properties` | object | No | User-defined properties | `{"key": "value"}` |

**Example Payload**:
```json
{
  "event": "custom_event_name",
  "properties": {
    "portfolio_demo": true,
    "custom_property": "custom_value",
    "timestamp": "2025-01-15T10:36:00.000Z",
    "source": "portfolio"
  }
}
```

---

## Platform-Specific Implementation Details

### Segment

**SDK**: Analytics.js (loaded from CDN)

**Initialization**:
```javascript
// Load snippet and initialize with write key
analytics.load(SEGMENT_WRITE_KEY)
```

**Event Format**:
```javascript
window.analytics.track(eventName, properties)
window.analytics.page(pageName, properties)
window.analytics.identify(userId, traits)
```

**Special Features**:
- **Middleware**: Filters invalid user IDs (< 5 characters)
- **Amplitude Integration**: Maps `anonymousId` to Amplitude's `device_id`
- **User ID Validation**: Prevents "me" and other invalid IDs from being sent

---

### Google Tag Manager

**SDK**: gtm.js

**Initialization**:
```javascript
window.dataLayer = window.dataLayer || []
// Load GTM script with container ID
```

**Event Format**:
```javascript
window.dataLayer.push({
  event: eventName,
  ...properties
})
```

**Special Handling**:
- Page views use `page_view` event name
- User identification uses `user_identify` event with `user_id` and `user_traits` properties
- All properties are flattened into the event object

---

### Amplitude

**Integration**: Via Segment destination (not direct SDK)

**Special Requirements**:
- User ID must be minimum 5 characters
- Requires either `userId` OR `deviceId` (mapped from `anonymousId`)
- Invalid user IDs are automatically filtered by Segment middleware

**Event Flow**:
```
trackEvent() → Segment → Amplitude Destination
```

---

## Implementation Guidelines

### 1. Using the Tracking System

**Track an Event**:
```typescript
import { useTrackEvent } from '@/hooks/use-analytics'

const { trackEvent } = useTrackEvent()

trackEvent({
  name: 'section_viewed',
  properties: {
    section_id: 'projects',
    section_name: 'Projects',
    interaction_type: 'scroll',
    url: window.location.href
  }
})
```

**Identify a User**:
```typescript
import { useTrackEvent } from '@/hooks/use-analytics'

const { identifyUser } = useTrackEvent()

identifyUser('user@example.com', {
  visited_portfolio: true,
  visited_at: new Date().toISOString(),
  source: 'analytics_demo'
})
```

### 2. Event Naming Best Practices

✅ **DO**:
- Use `snake_case` for all event names
- Be descriptive but concise
- Use consistent action verbs: `viewed`, `clicked`, `enabled`, `disabled`
- Group related events with common prefixes

❌ **DON'T**:
- Use spaces or special characters
- Use camelCase or PascalCase
- Create overly specific events (combine with properties instead)
- Include timestamps or user IDs in event names

### 3. Property Best Practices

✅ **DO**:
- Use `snake_case` for property names
- Include context properties (`section_id`, `url`, etc.)
- Use consistent data types across events
- Document all possible values for enum-like properties

❌ **DON'T**:
- Include PII (personally identifiable information) without consent
- Use nested objects (keep properties flat)
- Use inconsistent naming across events
- Include redundant data that's already in context

### 4. Deduplication Strategy

The system implements triple-layer deduplication for page views:

1. **Module-level flag**: `pageViewTracked` prevents multiple effect runs
2. **Window-level flag**: `window.__pageViewTracked` survives React StrictMode
3. **Manager-level check**: Time-based deduplication (1-second window)

**For Section Views**:
- Tracked only once per session using `Set` in `useSectionTracking`
- Requires 50% visibility threshold before tracking

---

## Data Privacy & Compliance

### GDPR Compliance
- No automatic tracking until user consent (if implemented)
- User can disable tracking via demo interface
- User IDs are validated and sanitized before sending

### Data Retention
- Analytics data retention managed by individual platforms:
  - Segment: Configurable per destination
  - GTM: Depends on connected analytics properties
  - Amplitude: Configurable in project settings

### PII Handling
- No automatic PII collection
- User IDs should be pseudonymous (email hashes, internal IDs)
- Avoid tracking sensitive personal data in properties

---

## Testing & Validation

### Development Testing

1. **Enable Development Logging**:
```javascript
// In analytics.ts
const shouldLog = process.env.NODE_ENV === 'development'
```

2. **Check Browser Console**:
- Look for `[Analytics]` prefixed logs
- Verify event names and properties
- Check for any errors or warnings

3. **Network Tab**:
- Segment: Look for POST to `api.segment.io/v1/track`
- GTM: Look for POST to `www.google-analytics.com/collect`

### Production Validation

1. **Segment Debugger**: View real-time events in Segment dashboard
2. **GTM Preview Mode**: Test tag firing in preview mode
3. **Amplitude Dashboard**: Verify events appear in real-time stream

---

## Troubleshooting

### Common Issues

**Events not firing**:
- Check environment variables are set (`NEXT_PUBLIC_SEGMENT_WRITE_KEY`, `NEXT_PUBLIC_GTM_CONTAINER_ID`)
- Verify analytics is initialized before tracking
- Check browser console for errors

**Duplicate events**:
- Check deduplication flags are working
- Verify component isn't mounting multiple times
- Check React StrictMode behavior in development

**Invalid user IDs**:
- Ensure user ID is at least 5 characters
- Avoid using test values like "me" or "test"
- Check middleware is filtering invalid IDs

**Events not in Amplitude**:
- Verify Amplitude destination is connected in Segment
- Check middleware is mapping `anonymousId` to `device_id`
- Ensure user ID validation isn't filtering legitimate IDs

---

## Maintenance

### Adding New Events

1. Define event in this tracking plan
2. Add event constant to events registry (if created)
3. Add TypeScript type definition
4. Implement tracking call with documented properties
5. Test in development and validate in production
6. Update this documentation

### Deprecating Events

1. Mark event as deprecated in this document
2. Add deprecation warning in code
3. Monitor usage and communicate to team
4. Remove after grace period
5. Update documentation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-15 | Initial tracking plan created | System |

---

## Contact & Questions

For questions about this tracking plan or analytics implementation:
- Review `ANALYTICS_SYSTEM.md` for technical architecture
- Check code comments in `/lib/analytics.ts`
- Review implementation examples in `/hooks/use-analytics.ts`
