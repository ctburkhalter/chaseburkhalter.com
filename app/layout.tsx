import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { GTMNoScript } from "@/components/analytics/gtm-noscript"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Chase Burkhalter | Senior Data & Analytics Engineer",
  description:
    "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance.",
  keywords: ["Data Analytics", "Analytics Engineer", "Product Analytics", "Event Tracking", "Data Governance", "Snowflake", "dbt", "Amplitude", "Segment"],
  authors: [{ name: "Chase Burkhalter", url: "https://chaseburkhalter.com" }],
  creator: "Chase Burkhalter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chaseburkhalter.com",
    title: "Chase Burkhalter | Senior Data & Analytics Engineer",
    description:
      "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance.",
    siteName: "Chase Burkhalter Portfolio",
    images: [
      {
        url: "https://chaseburkhalter.com/og-image.png",
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
    images: ["https://chaseburkhalter.com/og-image.png"],
  },
  metadataBase: new URL("https://chaseburkhalter.com"),
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Chase Burkhalter",
              url: "https://chaseburkhalter.com",
              email: "chase@chaseburkhalter.com",
              telephone: "+1-334-333-4308",
              jobTitle: "Senior Data & Analytics Engineer",
              description: "Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance with 5+ years of experience.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dothan",
                addressRegion: "Al",
                addressCountry: "US"
              },
              sameAs: [
                "https://www.linkedin.com/in/chase-burkhalter/",
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
                "Data Engineering"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AnalyticsProvider>
              {/* GTM noscript tag for when JavaScript is disabled */}
              <GTMNoScript />
              {children}
            </AnalyticsProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
