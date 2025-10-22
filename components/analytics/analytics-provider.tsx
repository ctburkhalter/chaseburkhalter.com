"use client"

import type React from "react"
import { useEffect } from "react"
import { useAnalytics, useSectionTracking } from "@/hooks/use-analytics"

// Define all trackable sections on the site
const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "skills",
  "demos",
  "contact"
]

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics and track initial page view
  useAnalytics()

  // Set up section tracking with Intersection Observer
  const { trackSectionClick } = useSectionTracking(SECTION_IDS)

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
          if (SECTION_IDS.includes(sectionId)) {
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
