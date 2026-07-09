import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/sections/hero-section"
import { ImpactBand } from "@/components/sections/impact-band"
import { WorkSection } from "@/components/sections/work-section"
import { AiSection } from "@/components/sections/ai-section"
import { ExperienceSection } from "@/components/sections/experience-section"
import { SkillsSection } from "@/components/sections/skills-section"
import { AnalyticsShowcase } from "@/components/sections/analytics-showcase"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="circuit-grid pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-70" aria-hidden="true" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" className="flex-1">
        <HeroSection />
        <ImpactBand />
        <WorkSection />
        <AiSection />
        <ExperienceSection />
        <SkillsSection />
        <AnalyticsShowcase />
        <AboutSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  )
}
