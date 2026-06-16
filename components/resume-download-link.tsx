"use client"

import { analytics } from "@/lib/analytics"
import { createResumeDownloadedEvent } from "@/lib/analytics-events"

interface ResumeDownloadLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  source: "nav" | "hero" | "contact"
}

export function ResumeDownloadLink({ source, onClick, children, ...props }: ResumeDownloadLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    analytics.trackEvent(createResumeDownloadedEvent(source))
    onClick?.(e)
  }

  return (
    <a
      href="/resume/Chase_Burkhalter_Resume_2026.pdf"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}
