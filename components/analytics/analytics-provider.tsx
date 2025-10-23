"use client"

import type React from "react"
import { useEffect } from "react"
import { useAnalytics, useSectionTracking } from "@/hooks/use-analytics"
import { SECTION_IDS, type SectionId } from "@/lib/analytics-events"

const TRACKABLE_SECTION_IDS = Object.values(SECTION_IDS) as SectionId[]

const isTrackableSection = (sectionId: string): sectionId is SectionId =>
  TRACKABLE_SECTION_IDS.includes(sectionId as SectionId)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics and track initial page view
  const { trackEvent } = useAnalytics()

  // Set up section tracking with Intersection Observer
  const { trackSectionClick } = useSectionTracking(TRACKABLE_SECTION_IDS, trackEvent)

  // Add click tracking to navigation links
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        const href = link.getAttribute('href')
        if (href) {
          const sectionId = href.substring(1) // Remove the #
          if (isTrackableSection(sectionId)) {
            trackSectionClick(sectionId, "navigation")
          }
        }
      }
    }

    document.addEventListener('click', handleNavClick)

    return () => {
      document.removeEventListener('click', handleNavClick)
    }
  }, [trackSectionClick])

  // Global error boundary for analytics
  useEffect(() => {
    const originalOnError = window.onerror

    window.onerror = function (message, source, lineno, colno, error) {
      // Log analytics errors but don't let them break the app
      if (source?.includes("analytics") || source?.includes("segment") || source?.includes("gtm")) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Analytics error caught:", { message, source, lineno, colno, error })
        }
        return true // Prevent default error handling
      }

      // Call original handler for other errors
      if (originalOnError) {
        return originalOnError.apply(this, [message, source, lineno, colno, error])
      }

      return false
    }

    return () => {
      window.onerror = originalOnError
    }
  }, [])

  return <>{children}</>
}
