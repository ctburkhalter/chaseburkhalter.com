import { Download, ExternalLink, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResumeDownloadLink } from "@/components/resume-download-link"
import { TrackedLink } from "@/components/tracked-link"
import { CONTACT, IDENTITY } from "@/lib/content"

export function ContactSection() {
  return (
    <section id="contact" className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-lg flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <p className="section-kicker">Contact</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{CONTACT.heading}</h2>
            <p className="text-muted-foreground">{CONTACT.body}</p>
          </div>

          <div className="w-full space-y-3">
            <TrackedLink
              href={`mailto:${IDENTITY.email}`}
              contactMethod="email"
              location="contact"
              className="engine-panel flex items-center gap-3 rounded-lg p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 group"
            >
              <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{IDENTITY.email}</p>
              </div>
            </TrackedLink>
            <TrackedLink
              href={IDENTITY.linkedin}
              contactMethod="linkedin"
              location="contact"
              target="_blank"
              rel="noopener noreferrer"
              className="engine-panel flex items-center gap-3 rounded-lg p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 group"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">LinkedIn</p>
                <p className="text-sm font-medium">linkedin.com/in/chaseburkhalter</p>
              </div>
            </TrackedLink>
          </div>

          <div className="flex gap-3 w-full">
            <Button asChild className="flex-1">
              <TrackedLink href={`mailto:${IDENTITY.email}`} contactMethod="email" location="contact_cta">
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Send Email
              </TrackedLink>
            </Button>
            <Button variant="outline" asChild className="flex-1 border-violet-400/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15">
              <ResumeDownloadLink source="contact">
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Resume
              </ResumeDownloadLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
