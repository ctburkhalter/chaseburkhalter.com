import Link from "next/link"
import { GithubIcon } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  metric: string
  title: string
  description: string
  tags: string[]
  githubUrl?: string
}

export function ProjectCard({ metric, title, description, tags, githubUrl }: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border-border/60 hover:border-border transition-colors">
      <CardContent className="flex-1 p-5 space-y-3">
        <p className="text-2xl font-bold text-primary">{metric}</p>
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1.5 p-5 pt-0 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {githubUrl && (
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <GithubIcon className="h-3.5 w-3.5" /> View on GitHub
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
