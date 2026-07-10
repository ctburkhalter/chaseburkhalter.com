import { ExternalLink, GithubIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrackedLink } from "@/components/tracked-link"

interface ProjectCardProps {
  metric: string
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  liveUrl?: string
  href?: string
}

export function ProjectCard({ metric, title, description, tags, githubUrl, liveUrl, href }: ProjectCardProps) {
  return (
    <Card className="engine-panel group relative flex flex-col overflow-hidden rounded-lg transition-colors hover:border-primary/40">
      <CardContent className="flex-1 p-5 space-y-3">
        <p className="font-mono text-2xl font-bold text-primary">{metric}</p>
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1.5 p-5 pt-0 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="border border-border/60 bg-muted/60 font-mono text-xs text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
        {githubUrl && (
          <TrackedLink
            href={githubUrl}
            linkType="github"
            location="project_card"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary shrink-0"
          >
            <GithubIcon className="h-3.5 w-3.5" aria-hidden="true" /> View source
          </TrackedLink>
        )}
        {liveUrl && (
          <TrackedLink
            href={liveUrl}
            linkType="live_site"
            location="project_card"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Visit live site
          </TrackedLink>
        )}
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View dashboard
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
