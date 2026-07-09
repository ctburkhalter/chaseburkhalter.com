"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ResumeDownloadLink } from "@/components/resume-download-link"
import { NAV_ITEMS } from "@/lib/content"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-primary/10 hover:text-primary"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] border-border/70 bg-background/95 sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="rounded border border-primary/35 bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">CB</span>
            <span className="font-mono text-sm">~/chase-burkhalter</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-6" role="navigation" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className="rounded-md font-mono text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
              aria-label={`Navigate to ${item.label} section`}
            >
              {item.label}
            </Link>
          ))}
          <div className="space-y-2 border-t border-border/70 pt-4">
            <Button asChild className="w-full">
              <Link
                href="#contact"
                onClick={handleLinkClick}
              >
                Get in Touch
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-violet-400/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15">
              <ResumeDownloadLink source="nav" onClick={handleLinkClick}>
                Download Resume
              </ResumeDownloadLink>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
