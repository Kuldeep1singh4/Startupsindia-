import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer max-w-full text-center leading-tight break-words";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(242,51,64,0.3)] hover:shadow-[0_0_25px_rgba(242,51,64,0.5)]",
      secondary: "bg-white text-black hover:bg-gray-200",
      outline: "border border-border-dark text-white hover:bg-bg-card",
      ghost: "text-text-muted hover:text-white hover:bg-bg-card"
    };

    const sizes = {
      sm: "min-h-9 px-4 py-1.5 text-sm",
      md: "min-h-11 px-6 py-2.5 text-base",
      lg: "min-h-14 px-8 py-3 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
