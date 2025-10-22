"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { analytics, type AnalyticsEvent } from "@/lib/analytics"

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initializedRef = useRef(false)

  // Initialize analytics
  useEffect(() => {
    if (initializedRef.current) return
    
    try {
      analytics.initialize()
      initializedRef.current = true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to initialize analytics:", error)
      }
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (!pathname || !initializedRef.current) return

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
  }, [pathname, searchParams])

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
