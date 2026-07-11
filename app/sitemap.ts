import type { MetadataRoute } from "next"

// Fixed, hand-maintained dates rather than `new Date()` at request time:
// lastModified should reflect the last real content change on each route, not
// "today," which would defeat the field's purpose for crawlers entirely.
// Bump these when a route's content changes meaningfully.
const LAST_MODIFIED = {
  home: new Date("2026-07-09"), // portfolio refresh, PR #17/#18 (resume sync)
  weather: new Date("2026-07-10"), // South Alabama Tornado Watch dashboard launch
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chaseburkhalter.com"

  return [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED.home,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/weather`,
      lastModified: LAST_MODIFIED.weather,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
