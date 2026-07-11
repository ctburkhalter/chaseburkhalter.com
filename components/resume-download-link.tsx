"use client"

import { analytics } from "@/lib/analytics"
import { createResumeDownloadedEvent } from "@/lib/analytics-events"
import { RESUME_PDF_PATH } from "@/lib/content"

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
      href={RESUME_PDF_PATH}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}
