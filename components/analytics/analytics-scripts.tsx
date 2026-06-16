"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

import { canLoadAnalytics } from "@/lib/analytics-consent"

const SEGMENT_WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? ""
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? ""

export function AnalyticsScripts() {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false)

  useEffect(() => {
    setShouldLoadAnalytics(canLoadAnalytics())
  }, [])

  if (!shouldLoadAnalytics) {
    return null
  }

  return (
    <>
      {SEGMENT_WRITE_KEY ? (
        <>
          <Script
            id="segment-queue"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.analytics = window.analytics || [];
if (!window.analytics.invoked && Array.isArray(window.analytics)) {
  window.analytics.invoked = true;
  window.analytics.methods = [
    "trackSubmit", "trackClick", "trackLink", "trackForm",
    "pageview", "identify", "reset", "group", "track",
    "ready", "alias", "debug", "page", "once", "off", "on",
    "addSourceMiddleware", "addIntegrationMiddleware",
    "setAnonymousId", "addDestinationMiddleware"
  ];
  window.analytics.factory = function(method) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      window.analytics.push(args);
      return window.analytics;
    };
  };
  for (var i = 0; i < window.analytics.methods.length; i++) {
    var key = window.analytics.methods[i];
    window.analytics[key] = window.analytics.factory(key);
  }
  window.analytics._writeKey = ${JSON.stringify(SEGMENT_WRITE_KEY)};
  window.analytics.SNIPPET_VERSION = "4.15.3";
}
              `,
            }}
          />
          <Script
            id="segment-analytics"
            src={`https://cdn.segment.com/analytics.js/v1/${SEGMENT_WRITE_KEY}/analytics.min.js`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
      {GTM_CONTAINER_ID ? (
        <>
          <Script
            id="google-tag-manager-queue"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
if (!window.__portfolioGtmInitialized) {
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js"
  });
  window.__portfolioGtmInitialized = true;
}
              `,
            }}
          />
          <Script
            id="google-tag-manager"
            src={`https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
    </>
  )
}
