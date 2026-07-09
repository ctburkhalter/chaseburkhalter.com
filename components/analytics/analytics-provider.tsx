"use client"

import type React from "react"
import { useEffect } from "react"
import { useAnalytics, useSectionTracking } from "@/hooks/use-analytics"
import { SECTION_IDS } from "@/lib/content"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics and track initial page view
  const { trackEvent } = useAnalytics()

  // Set up section tracking with Intersection Observer
  const { trackSectionClick } = useSectionTracking(SECTION_IDS, trackEvent)

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

  return <>{children}</>
}
