"use client"

import { analytics } from "@/lib/analytics"
import {
  createExternalLinkClickedEvent,
  createContactClickedEvent,
  type ExternalLinkType,
  type ContactMethod,
} from "@/lib/analytics-events"

// The single client-side leaf for outbound engagement tracking, so section
// components stay server-rendered. Pass linkType for external_link_clicked
// or contactMethod for contact_clicked; location says where on the page the
// link lives (hero, footer, contact, project_card, experience).

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  location: string
  linkType?: ExternalLinkType
  contactMethod?: ContactMethod
}

export function TrackedLink({ location, linkType, contactMethod, onClick, children, href, ...props }: TrackedLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (contactMethod) {
      analytics.trackEvent(createContactClickedEvent(contactMethod, location))
    } else if (linkType) {
      analytics.trackEvent(createExternalLinkClickedEvent(linkType, href ?? "", location))
    }
    onClick?.(e)
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
