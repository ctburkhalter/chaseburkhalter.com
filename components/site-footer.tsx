import { TrackedLink } from "@/components/tracked-link"
import { IDENTITY } from "@/lib/content"

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/70 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">© 2026 Chase Burkhalter</p>
        <p className="font-mono text-xs text-muted-foreground">
          Built with Next.js · TypeScript · Tailwind CSS · Claude Code · Amplitude
        </p>
        <div className="flex items-center gap-4">
          <TrackedLink
            href={IDENTITY.linkedin}
            linkType="linkedin"
            location="footer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            LinkedIn
          </TrackedLink>
          <TrackedLink
            href={IDENTITY.github}
            linkType="github"
            location="footer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </TrackedLink>
          <TrackedLink
            href={`mailto:${IDENTITY.email}`}
            contactMethod="email"
            location="footer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Email
          </TrackedLink>
        </div>
      </div>
    </footer>
  )
}
