"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">CB</span>
            Chase Burkhalter
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-6" role="navigation" aria-label="Mobile navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
              aria-label={`Navigate to ${item.label} section`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t space-y-2">
            <Button asChild className="w-full">
              <Link
                href="#contact"
                onClick={handleLinkClick}
              >
                Get in Touch
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                Download Resume
              </a>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
