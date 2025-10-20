import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { GTMNoScript } from "@/components/analytics/gtm-noscript"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chase Burkhalter | Senior Data & Analytics Engineer",
  description:
    "Portfolio of Chase Burkhalter, a Senior Data & Analytics Engineer specializing in product analytics, event tracking, and data governance.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
