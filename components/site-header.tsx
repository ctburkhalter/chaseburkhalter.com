import Link from "next/link"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/mobile-navigation"
import { ResumeDownloadLink } from "@/components/resume-download-link"
import { NAV_ITEMS } from "@/lib/content"

export function SiteHeader({ isPortfolioHome = true }: { isPortfolioHome?: boolean }) {
  const navHref = (href: string) => href.startsWith("#") && !isPortfolioHome ? `/${href}` : href

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Chase Burkhalter Home">
          <span className="rounded border border-primary/35 bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">CB</span>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">~/chase-burkhalter</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={navHref(href)}
              className="whitespace-nowrap font-mono text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="hidden border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 md:inline-flex gap-2">
            <ResumeDownloadLink source="nav">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Resume
            </ResumeDownloadLink>
          </Button>
          <MobileNavigation isPortfolioHome={isPortfolioHome} />
        </div>
      </div>
    </header>
  )
}
