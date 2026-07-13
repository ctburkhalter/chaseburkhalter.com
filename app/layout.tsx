import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { BackToTop } from "@/components/back-to-top"

// leaflet.css is intentionally not imported here: it is scoped to
// components/weather/tornado-event-map.tsx, which is the only consumer, so
// it only loads with that dynamically-imported chunk on /weather instead of
// shipping to every route including / (which never renders a map).
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

const SITE_DESCRIPTION =
  "Chase Burkhalter is a Senior Data & Analytics Engineer building governed, AI-ready data platforms: dbt modeling on cloud data warehouses, pipeline ingestion, product instrumentation, semantic layers, and secure AI access to trusted data."

export const metadata: Metadata = {
  metadataBase: new URL("https://chaseburkhalter.com"),
  title: "Chase Burkhalter | Senior Data & Analytics Engineer",
  description: SITE_DESCRIPTION,
  keywords: [
    "Senior Data & Analytics Engineer",
    "Senior Analytics Engineer",
    "Senior Data Engineer",
    "Analytics Engineering",
    "Data Engineering",
    "Data Platform",
    "dbt",
    "Snowflake",
    "Fivetran",
    "MetricFlow",
    "Semantic Layer",
    "MCP Server Development",
    "AI-Ready Data Infrastructure",
    "Product Analytics",
    "Event Instrumentation",
    "Amplitude",
    "Python",
    "SQL",
  ],
  authors: [{ name: "Chase Burkhalter", url: "https://chaseburkhalter.com" }],
  creator: "Chase Burkhalter",
  publisher: "Chase Burkhalter",
  applicationName: "Chase Burkhalter Portfolio",
  category: "Portfolio",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chaseburkhalter.com",
    title: "Chase Burkhalter | Senior Data & Analytics Engineer",
    description: SITE_DESCRIPTION,
    siteName: "Chase Burkhalter Portfolio",
    // No explicit `images` here: the file-convention app/opengraph-image.tsx
    // is auto-detected and fully overrides this field (confirmed via
    // rendered <head>: only one og:image tag renders, pointing at the file
    // convention's route, not this literal URL). An explicit entry here is
    // dead config, not a fallback.
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": "https://chaseburkhalter.com/#profilepage",
      url: "https://chaseburkhalter.com",
      name: "Chase Burkhalter | Senior Data & Analytics Engineer",
      mainEntity: { "@id": "https://chaseburkhalter.com/#person" },
    },
    {
      "@type": "WebSite",
      "@id": "https://chaseburkhalter.com/#website",
      url: "https://chaseburkhalter.com",
      name: "Chase Burkhalter Portfolio",
      publisher: { "@id": "https://chaseburkhalter.com/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://chaseburkhalter.com/#person",
      name: "Chase Burkhalter",
      url: "https://chaseburkhalter.com",
      email: "chase@chaseburkhalter.com",
      jobTitle: "Senior Data & Analytics Engineer",
      description: SITE_DESCRIPTION,
      image: "https://chaseburkhalter.com/opengraph-image",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dothan",
        addressRegion: "AL",
        addressCountry: "US",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of South Alabama",
      },
      sameAs: [
        "https://www.linkedin.com/in/chaseburkhalter/",
        "https://github.com/ctburkhalter",
      ],
      knowsAbout: [
        "Analytics Engineering",
        "Data Engineering",
        "Data Platform Architecture",
        "dbt",
        "Snowflake",
        "Fivetran",
        "SQL",
        "Python",
        "Semantic Layers",
        "MetricFlow",
        "Data Governance",
        "Product Analytics",
        "Event Instrumentation",
        "Amplitude",
        "MCP Server Development",
        "AI-Ready Data Infrastructure",
        "Snowflake Cost Optimization",
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // data-scroll-behavior="smooth" opts back into Next.js's pre-16 behavior of
  // temporarily overriding CSS scroll-behavior during route transitions
  // (Next 16 stopped doing this by default). globals.css sets
  // `scroll-behavior: smooth` globally for in-page hash navigation
  // (#projects, #contact, etc.); without this attribute, that same smooth
  // easing would also apply to the scroll-to-top on / -> /weather route
  // changes, which reads as a jarring full-page animation rather than an
  // instant transition.
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
            <AnalyticsProvider>
              {children}
              <BackToTop />
            </AnalyticsProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
