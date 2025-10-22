"use client"

import { useEffect, useCallback, useRef } from "react"
import { analytics, type AnalyticsEvent } from "@/lib/analytics"

// Global state to ensure single initialization and no duplicate events
let globalInitialized = false
let pageViewTracked = false

/**
 * Main analytics hook - handles initialization and provides event tracking
 * Should only be used by the AnalyticsProvider component
 */
export function useAnalytics() {
  const initializedRef = useRef(false)

  // Initialize analytics ONCE globally
  useEffect(() => {
    if (globalInitialized) {
      initializedRef.current = true
      return
    }

    try {
      analytics.initialize()
      globalInitialized = true
      initializedRef.current = true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to initialize analytics:", error)
      }
    }
  }, [])

  // Track initial page view ONCE
  useEffect(() => {
    if (!initializedRef.current || pageViewTracked) {
      return
    }

    // Mark as tracked IMMEDIATELY to prevent race conditions
    pageViewTracked = true

    // Wait for analytics to be ready
    const trackInitialPageView = () => {
      // Double-check we haven't already tracked (in case of multiple mounts)
      if (typeof window !== 'undefined' && (window as any).__pageViewTracked) {
        return
      }

      try {
        // Mark globally on window to survive React StrictMode unmount/remount
        (window as any).__pageViewTracked = true

        analytics.trackPageView({
          path: window.location.pathname,
          title: document.title,
          referrer: document.referrer,
          properties: {
            initial_load: true,
            url: window.location.href,
            hash: window.location.hash
          }
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to track initial page view:", error)
        }
      }
    }

    // Small delay to ensure analytics scripts are loaded
    const timer = setTimeout(trackInitialPageView, 500)
    return () => {
      // Don't clear the flag on unmount (keep it tracked)
      clearTimeout(timer)
    }
  }, [initializedRef.current])

  // Track custom event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Always try to track - the analytics manager will handle queueing if not ready
    try {
      analytics.trackEvent(event)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to track event:", error)
      }
    }
  }, [])

  // Identify user
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    // Always try to identify - the analytics manager will handle queueing if not ready
    try {
      analytics.identify(userId, traits)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to identify user:", error)
      }
    }
  }, [])

  return {
    trackEvent,
    identifyUser,
  }
}

/**
 * Hook for tracking section views using Intersection Observer
 * Tracks when sections scroll into viewport
 * @param sectionIds - Array of section IDs to track
 * @param trackEvent - Event tracking function from useAnalytics()
 */
export function useSectionTracking(sectionIds: string[], trackEvent: (event: AnalyticsEvent) => void) {
  const trackedSections = useRef(new Set<string>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // Create intersection observer (events will be queued if analytics not ready)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const sectionId = entry.target.id

            // Only track each section view once per session
            if (!trackedSections.current.has(sectionId)) {
              trackedSections.current.add(sectionId)

              trackEvent({
                name: "section_viewed",
                properties: {
                  section_id: sectionId,
                  section_name: sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  timestamp: new Date().toISOString(),
                  url: window.location.href,
                  interaction_type: "scroll"
                }
              })
            }
          }
        })
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
        rootMargin: "0px"
      }
    )

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [sectionIds, trackEvent])

  // Track section click (navigation)
  const trackSectionClick = useCallback((sectionId: string, clickSource: string = "navigation") => {
    // Events will be queued if analytics not ready
    trackEvent({
      name: "section_clicked",
      properties: {
        section_id: sectionId,
        section_name: sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        click_source: clickSource,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  return {
    trackSectionClick
  }
}

/**
 * Simple hook for tracking events only (for demo components)
 */
export function useTrackEvent() {
  const { trackEvent, identifyUser } = useAnalytics()

  return {
    trackEvent,
    identifyUser
  }
}
