import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-border-dark text-text-main",
      success: "bg-green-500/10 text-green-500 border border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      error: "bg-primary/10 text-primary border border-primary/20",
      outline: "border border-border-dark text-text-muted"
    };
    
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider max-w-full truncate", variants[variant], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
