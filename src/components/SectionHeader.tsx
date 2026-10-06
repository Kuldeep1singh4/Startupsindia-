import { type HTMLAttributes } from "react"
import { cn } from "../lib/utils"

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 md:mb-8", className)} {...props}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1.5">{title}</h1>
      {subtitle && <p className="text-text-muted text-sm md:text-base">{subtitle}</p>}
    </div>
  )
}
