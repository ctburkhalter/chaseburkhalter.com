"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#demos", label: "Analytics Demos" },
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
            <BarChart3 className="h-5 w-5" />
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
          <div className="pt-4 border-t">
            <Button asChild className="w-full">
              <Link 
                href="#contact" 
                onClick={handleLinkClick}
                aria-label="Get in touch with Chase Burkhalter"
              >
                Get in Touch
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
