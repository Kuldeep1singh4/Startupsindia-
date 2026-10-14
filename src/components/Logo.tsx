import { Link } from "react-router-dom"
import { cn } from "../lib/utils"

interface LogoProps {
  className?: string
  to?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function Logo({
  className,
  to,
  size = "md",
  variant = "default"
}: LogoProps) {
  const heightClass = {
    sm: "h-6 sm:h-7",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-12",
  }[size]

  const src = variant === "white"
    ? "/startupsindia-logo.png"
    : "/startupsindia-logo-white.png"

  const content = (
    <div className={cn("inline-flex items-center select-none group", className)}>
      <img
        src={src}
        alt="StartupsIndia Logo"
        className={cn(
          heightClass,
          "w-auto max-w-full object-contain transition-transform duration-150 group-hover:scale-[1.02]"
        )}
      />
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    )
  }

  return content
}
