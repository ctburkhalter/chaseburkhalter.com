"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

// Site-wide scroll-to-top affordance. Mounted once in app/layout.tsx so it
// serves both the long home page and /weather. Hidden until the visitor has
// scrolled past a threshold, so short viewports never see it.
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    // Capture the position on mount too, in case the page loads already
    // scrolled (hash anchor, restored scroll). Synchronous setState in an
    // effect is what react-hooks/set-state-in-effect flags on principle; the
    // SSR default (false) matches scrollY 0, so there is no hydration risk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(window.scrollY > 600)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      // The button stays mounted so it can fade in and out, but opacity-0 and
      // pointer-events-none only hide it from sight and from the mouse: it would
      // still be a tab stop and still reach the accessibility tree. `inert` (React
      // 19 supports it natively) takes it out of tab order and the a11y tree while
      // it is invisible, so keyboard users do not land on a control they cannot see.
      inert={!visible}
      className={`fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-[0_0_24px_rgb(34_197_94/0.18)] backdrop-blur transition-opacity hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
