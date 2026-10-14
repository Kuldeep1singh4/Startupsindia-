import { cn } from "../lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
  variant?: "full-page" | "inline" | "card"
  size?: "sm" | "md" | "lg"
}

export function LoadingState({
  message = "Loading...",
  className,
  variant = "inline",
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-2",
    lg: "w-14 h-14 border-3",
  }

  if (variant === "full-page") {
    return (
      <div className={cn("min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 relative overflow-hidden", className)}>
        {/* Glow orb */}
        <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {/* Dual Ring Spinner */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute w-8 h-8 rounded-full border-2 border-rose-500/20 border-b-rose-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
            <div className="absolute w-3 h-3 rounded-full bg-primary animate-ping" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-wide">{message}</h3>
            <p className="text-xs text-text-muted">StartupsIndia Ambassador Platform</p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn("p-8 rounded-2xl bg-bg-card/50 border border-border-dark flex flex-col items-center justify-center text-center gap-3", className)}>
        <div className="relative flex items-center justify-center">
          <div className={cn("rounded-full border-primary/20 border-t-primary animate-spin", sizeClasses[size])} />
        </div>
        <p className="text-xs font-medium text-text-muted">{message}</p>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center gap-3 p-4", className)}>
      <div className={cn("rounded-full border-primary/20 border-t-primary animate-spin", sizeClasses[size])} />
      {message && <span className="text-xs text-text-muted font-medium">{message}</span>}
    </div>
  )
}

/** Reusable Skeleton Loaders for consistent placeholders */
export function SkeletonGrid({ count = 4, className = "h-40" }: { count?: number; className?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={cn("bg-bg-card/60 rounded-2xl border border-border-dark", className)} />
      ))}
    </div>
  )
}
