import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://chaseburkhalter.com"),
  title: "Chase Burkhalter | Senior Data & Analytics Engineer",
  description:
    "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance. 6+ years experience with modern data stack tooling.",
  keywords: ["Data Analytics", "Analytics Engineer", "Product Analytics", "Event Tracking", "Data Governance", "Snowflake", "dbt", "Amplitude", "Segment", "GA4", "Apache Superset"],
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
    description:
      "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance. 6+ years experience with modern data stack tooling.",
    siteName: "Chase Burkhalter Portfolio",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Chase Burkhalter - Senior Data & Analytics Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chase Burkhalter | Senior Data & Analytics Engineer",
    description:
      "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance.",
    images: ["/opengraph-image"],
    creator: "@chaseburkhalter",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Chase Burkhalter",
                url: "https://chaseburkhalter.com",
                email: "chase@chaseburkhalter.com",
                telephone: "+1-334-333-4308",
                jobTitle: "Senior Data & Analytics Engineer",
                description: "Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance with 6+ years of experience.",
                image: "https://chaseburkhalter.com/opengraph-image",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dothan",
                  addressRegion: "AL",
                  addressCountry: "US"
                },
                sameAs: [
                  "https://www.linkedin.com/in/chaseburkhalter/",
                  "https://github.com/ctburkhalter"
                ],
                knowsAbout: [
                  "Product Analytics",
                  "Event Tracking",
                  "Data Governance",
                  "Snowflake",
                  "dbt",
                  "Amplitude",
                  "Segment",
                  "Google Analytics",
                  "Data Engineering",
                  "Apache Superset",
                  "GA4",
                ],
                hasOccupation: {
                  "@type": "Occupation",
                  name: "Senior Data & Analytics Engineer",
                  description: "Specializes in building scalable analytics infrastructure, implementing event tracking systems, and creating self-service analytics platforms."
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "ProfessionalService",
                name: "Chase Burkhalter Analytics Services",
                description: "Senior Data & Analytics Engineer providing expertise in product analytics, event tracking, and data governance solutions.",
                provider: {
                  "@type": "Person",
                  name: "Chase Burkhalter"
                },
                serviceType: [
                  "Product Analytics Implementation",
                  "Event Tracking & Instrumentation",
                  "Data Governance & Quality",
                  "Analytics Platform Migration",
                  "Self-Service Analytics Development"
                ],
                areaServed: {
                  "@type": "Country",
                  name: "United States"
                },
                availableLanguage: "English"
              }
            ])
          }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AnalyticsScripts />
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
