"use client"

import { useEffect, useCallback, useRef } from "react"
import { analytics, type AnalyticsEvent, type AnalyticsProperties } from "@/lib/analytics"
import {
  createSectionViewedEvent,
  createSectionClickedEvent,
} from "@/lib/analytics-events"
import { getSectionLabel } from "@/lib/content"

export function useAnalytics() {
  useEffect(() => {
    // window.__pageViewTracked persists across React StrictMode unmount/remount
    // cycles. Module-level flags reset between mounts in strict mode, so we use
    // the window object instead.
    if (typeof window === 'undefined' || window.__pageViewTracked) return
    window.__pageViewTracked = true

    try {
      analytics.initialize()
      analytics.trackPageView({
        path: window.location.pathname,
        title: document.title,
        properties: {
          url: window.location.href,
          hash: window.location.hash,
          initial_load: true,
        }
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Failed to initialize or track page view:', error)
      }
    }
  }, [])

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    try {
      analytics.trackEvent(event)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Failed to track event:', error)
      }
    }
  }, [])

  const identifyUser = useCallback((userId: string, traits?: AnalyticsProperties) => {
    try {
      analytics.identify(userId, traits)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Failed to identify user:', error)
      }
    }
  }, [])

  return { trackEvent, identifyUser }
}

export function useSectionTracking(sectionIds: string[], trackEvent: (event: AnalyticsEvent) => void) {
  const trackedSections = useRef(new Set<string>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

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
          } else if (process.env.NODE_ENV === 'development') {
            console.warn(`[Analytics] Section "${id}" not found in DOM`)
          }
        })
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Analytics] Observing ${observedCount}/${sectionIds.length} sections`)
        }
      }, 100)
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (timeoutId !== null) clearTimeout(timeoutId)
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [sectionIds, trackEvent])

  const trackSectionClick = useCallback((sectionId: string, clickSource: string = "navigation") => {
    trackEvent(createSectionClickedEvent(sectionId, getSectionLabel(sectionId), clickSource))
  }, [trackEvent])

  return { trackSectionClick }
}

declare global {
  interface Window {
    __pageViewTracked?: boolean
  }
}
