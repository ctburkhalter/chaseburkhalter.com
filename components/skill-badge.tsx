import { Badge } from "@/components/ui/badge"

interface SkillBadgeProps {
  name: string
  level: number
}

export function SkillBadge({ name, level }: SkillBadgeProps) {
  // Determine color based on skill level
  const getColorClass = (level: number) => {
    if (level >= 90) return "bg-blue-500 text-white"
    if (level >= 80) return "bg-green-500 text-white"
    if (level >= 70) return "bg-yellow-500 text-gray-900"
    return "bg-gray-200 text-gray-800"
  }

  return (
    <Badge variant="default" className={`${getColorClass(level)} px-3 py-1`}>
      {name}
    </Badge>
  )
}
