import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  image: string
  githubLink?: string
  demoLink?: string
  caseStudyLink?: string
}

export function ProjectCard({
  title,
  description,
  tags,
  image,
  githubLink,
  demoLink,
  caseStudyLink,
}: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
        <div className="flex flex-wrap gap-2 flex-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {githubLink && (
            <Link href={githubLink} className="flex items-center text-sm text-blue-500 hover:underline">
              Code <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          )}
          {demoLink && (
            <Link href={demoLink} className="flex items-center text-sm text-green-500 hover:underline">
              Demo <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          )}
          {caseStudyLink && (
            <Link href={caseStudyLink} className="flex items-center text-sm text-purple-500 hover:underline">
              Case Study <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
