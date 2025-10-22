"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { analytics, type AnalyticsEvent } from "@/lib/analytics"

// Global tracking state to prevent duplicate page views across multiple hook instances
let globalInitialized = false
let lastTrackedPath = ""
let lastTrackedSearch = ""
let trackingInProgress = false

export function useAnalytics(options?: { trackPageViews?: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initializedRef = useRef(false)
  const shouldTrackPageViews = options?.trackPageViews ?? true

  // Initialize analytics (only once globally)
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

  // Track page views (with deduplication)
  useEffect(() => {
    if (!pathname || !initializedRef.current || !shouldTrackPageViews) return

    const searchString = searchParams ? searchParams.toString() : ""
    const currentPath = `${pathname}?${searchString}`

    // Prevent duplicate tracking of the same path
    if (currentPath === `${lastTrackedPath}?${lastTrackedSearch}` || trackingInProgress) {
      return
    }

    trackingInProgress = true
    lastTrackedPath = pathname
    lastTrackedSearch = searchString

    try {
      analytics.trackPageView({
        path: pathname,
        title: document.title,
        referrer: document.referrer,
        properties: {
          search_params: searchParams ? Object.fromEntries(searchParams.entries()) : {},
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to track page view:", error)
      }
    } finally {
      // Reset tracking flag after a short delay to allow for legitimate re-tracking
      setTimeout(() => {
        trackingInProgress = false
      }, 100)
    }
  }, [pathname, searchParams, shouldTrackPageViews])

  // Track event helper with retry logic
  const trackEvent = useCallback((event: AnalyticsEvent, retries = 3) => {
    const attemptTrack = (attempt: number) => {
      try {
        analytics.trackEvent(event)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to track event (attempt ${attempt}):`, error)
        }
        
        if (attempt < retries) {
          // Exponential backoff
          setTimeout(() => attemptTrack(attempt + 1), Math.pow(2, attempt) * 1000)
        }
      }
    }
    
    attemptTrack(1)
  }, [])

  // Identify user helper with retry logic
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>, retries = 3) => {
    const attemptIdentify = (attempt: number) => {
      try {
        analytics.identify(userId, traits)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to identify user (attempt ${attempt}):`, error)
        }
        
        if (attempt < retries) {
          // Exponential backoff
          setTimeout(() => attemptIdentify(attempt + 1), Math.pow(2, attempt) * 1000)
        }
      }
    }
    
    attemptIdentify(1)
  }, [])

  return {
    trackEvent,
    identifyUser,
  }
}

/**
 * Lightweight hook for tracking events only (no page view tracking)
 * Use this in components that only need to track user interactions
 * This prevents unnecessary page view tracking and improves performance
 */
export function useTrackEvent() {
  const initializedRef = useRef(false)

  // Ensure analytics is initialized
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

  // Track event helper with retry logic
  const trackEvent = useCallback((event: AnalyticsEvent, retries = 3) => {
    const attemptTrack = (attempt: number) => {
      try {
        analytics.trackEvent(event)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to track event (attempt ${attempt}):`, error)
        }

        if (attempt < retries) {
          // Exponential backoff
          setTimeout(() => attemptTrack(attempt + 1), Math.pow(2, attempt) * 1000)
        }
      }
    }

    attemptTrack(1)
  }, [])

  // Identify user helper with retry logic
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>, retries = 3) => {
    const attemptIdentify = (attempt: number) => {
      try {
        analytics.identify(userId, traits)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to identify user (attempt ${attempt}):`, error)
        }

        if (attempt < retries) {
          // Exponential backoff
          setTimeout(() => attemptIdentify(attempt + 1), Math.pow(2, attempt) * 1000)
        }
      }
    }

    attemptIdentify(1)
  }, [])

  return {
    trackEvent,
    identifyUser,
  }
}
