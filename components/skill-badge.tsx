import { Badge } from "@/components/ui/badge"

interface SkillBadgeProps {
  name: string
  level: number
}

export function SkillBadge({ name, level }: SkillBadgeProps) {
  // Determine color based on skill level
  const getVariant = (level: number) => {
    if (level >= 90) return "default"
    if (level >= 80) return "secondary"
    return "outline"
  }

  return (
    <Badge variant={getVariant(level)} className="px-3 py-1">
      {name}
    </Badge>
  )
}
