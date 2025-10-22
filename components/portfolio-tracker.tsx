"use client"

import { useEffect } from "react"
import { useTrackEvent } from "@/hooks/use-analytics"

interface PortfolioTrackerProps {
  section: string
  children: React.ReactNode
  trackOnMount?: boolean
  trackOnInteraction?: boolean
  interactionType?: string
}

export function PortfolioTracker({
  section,
  children,
  trackOnMount = false,
  trackOnInteraction = false,
  interactionType = "view"
}: PortfolioTrackerProps) {
  const { trackEvent } = useTrackEvent()

  useEffect(() => {
    if (trackOnMount) {
      trackEvent({
        name: `portfolio_${section}_${interactionType}`,
        properties: {
          section,
          interaction_type: interactionType,
          timestamp: new Date().toISOString(),
          portfolio_demo: true,
        },
      })
    }
  }, [section, trackOnMount, interactionType, trackEvent])

  const handleInteraction = () => {
    if (trackOnInteraction) {
      trackEvent({
        name: `portfolio_${section}_interaction`,
        properties: {
          section,
          interaction_type: interactionType,
          timestamp: new Date().toISOString(),
          portfolio_demo: true,
        },
      })
    }
  }

  return (
    <div onClick={trackOnInteraction ? handleInteraction : undefined}>
      {children}
    </div>
  )
}

// Specific tracking components for different portfolio sections
export function ProjectTracker({ projectName, children }: { projectName: string; children: React.ReactNode }) {
  return (
    <PortfolioTracker 
      section="project" 
      trackOnMount={true}
      trackOnInteraction={true}
      interactionType="view"
    >
      {children}
    </PortfolioTracker>
  )
}

export function SkillTracker({ skillName, children }: { skillName: string; children: React.ReactNode }) {
  return (
    <PortfolioTracker 
      section="skill" 
      trackOnInteraction={true}
      interactionType="click"
    >
      {children}
    </PortfolioTracker>
  )
}

export function ContactTracker({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioTracker 
      section="contact" 
      trackOnMount={true}
      trackOnInteraction={true}
      interactionType="view"
    >
      {children}
    </PortfolioTracker>
  )
}
