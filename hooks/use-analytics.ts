"use client"

import { useEffect, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { analytics, type AnalyticsEvent } from "@/lib/analytics"

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize analytics
  useEffect(() => {
    // Wrap in try-catch to prevent any errors from breaking the app
    try {
      analytics.initialize()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to initialize analytics:", error)
      }
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (pathname) {
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
      }
    }
  }, [pathname, searchParams])

  // Track event helper
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    try {
      analytics.trackEvent(event)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to track event:", error)
      }
    }
  }, [])

  // Identify user helper
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
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
