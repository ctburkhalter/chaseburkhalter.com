"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { analytics, type AnalyticsEvent } from "@/lib/analytics"
import {
  createSectionViewedEvent,
  createSectionClickedEvent,
} from "@/lib/analytics-events"
import { getSectionLabel } from "@/lib/content"

export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // window.__lastTrackedPageViewPath persists across React StrictMode
    // unmount/remount cycles (module-level state resets between mounts in
    // strict mode) while still tracking the current route, so it can guard
    // "don't double-fire for the same mount" without also guarding "never
    // fire again." A plain one-shot boolean can't distinguish those two
    // cases, which previously meant page_view never fired again after the
    // first client-side <Link> navigation (e.g. / -> /weather).
    if (window.__lastTrackedPageViewPath === pathname) return
    const isInitialLoad = window.__lastTrackedPageViewPath === undefined
    window.__lastTrackedPageViewPath = pathname

    try {
      analytics.initialize()
      analytics.trackPageView({
        path: pathname,
        title: document.title,
        properties: {
          url: window.location.href,
          hash: window.location.hash,
          initial_load: isInitialLoad,
          navigation_type: isInitialLoad ? 'initial' : 'spa',
        }
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Failed to initialize or track page view:', error)
      }
    }
  }, [pathname])

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    try {
      analytics.trackEvent(event)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Failed to track event:', error)
      }
    }
  }, [])

  return { trackEvent }
}

export function useSectionTracking(sectionIds: string[], trackEvent: (event: AnalyticsEvent) => void) {
  const pathname = usePathname()
  const trackedSections = useRef(new Set<string>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // A route change means a fresh set of section DOM nodes (or none at all,
    // e.g. /weather), so previously tracked section ids from another route
    // must not suppress re-tracking if the visitor returns to a route that
    // has them.
    trackedSections.current = new Set<string>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            if (!trackedSections.current.has(sectionId)) {
              trackedSections.current.add(sectionId)
              trackEvent(createSectionViewedEvent(sectionId, getSectionLabel(sectionId)))
            }
          }
        })
      },
      // rootMargin shrinks the observable area 20% from the bottom, so the
      // callback fires when the section's leading edge is 20% above the
      // viewport bottom. At that point exactly 20% of the viewport is covered
      // by the section, regardless of element height. This handles both
      // compact sections and sections taller than the viewport (like
      // experience on mobile) where intersectionRatio can never reach 0.2.
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    )

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        let observedCount = 0
        sectionIds.forEach((id) => {
          const element = document.getElementById(id)
          if (element && observerRef.current) {
            observerRef.current.observe(element)
            observedCount++
          }
        })

        if (process.env.NODE_ENV === 'development') {
          if (observedCount === 0 && sectionIds.length > 0) {
            // Routes like /weather have none of the hash-navigation sections
            // in the DOM by design. Log once, quietly, instead of warning
            // once per missing id (which used to spam the console on every
            // non-home route).
            console.log('[Analytics] No tracked sections present on this route; section observation skipped')
          } else if (observedCount < sectionIds.length) {
            const missing = sectionIds.filter((id) => !document.getElementById(id))
            console.warn(`[Analytics] Observing ${observedCount}/${sectionIds.length} sections (missing: ${missing.join(', ')})`)
          } else {
            console.log(`[Analytics] Observing ${observedCount}/${sectionIds.length} sections`)
          }
        }
      }, 100)
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (timeoutId !== null) clearTimeout(timeoutId)
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [sectionIds, trackEvent, pathname])

  const trackSectionClick = useCallback((sectionId: string, clickSource: string = "navigation") => {
    trackEvent(createSectionClickedEvent(sectionId, getSectionLabel(sectionId), clickSource))
  }, [trackEvent])

  return { trackSectionClick }
}

declare global {
  interface Window {
    __lastTrackedPageViewPath?: string
  }
}
