"use client"

import type React from "react"
import { useEffect } from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics
  useAnalytics()

  // Add a global error boundary for analytics
  useEffect(() => {
    const originalOnError = window.onerror

    window.onerror = function (message, source, lineno, colno, error) {
      // Log analytics errors but don't let them break the app
      if (source?.includes("analytics") || message?.toString().includes("analytics")) {
        console.error("Analytics error caught:", { message, source, lineno, colno, error })
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
