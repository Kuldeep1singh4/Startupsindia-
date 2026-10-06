import { type SelectHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

// Themed select component — matches dashboard dark theme (item 6 Phase 7.3)
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              // Base
              "w-full appearance-none bg-bg-dark border border-border-dark rounded-xl px-3.5 py-2.5 pr-9",
              "text-sm text-white font-medium",
              // Focus
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
              // Hover
              "hover:border-white/20",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Transition
              "transition-colors duration-150",
              className
            )}
            {...props}
          >
            {children}
          </select>
          {/* Custom chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

// Themed text input — matches Select styling for form consistency
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-bg-dark border border-border-dark rounded-xl px-3.5 py-2.5",
            "text-sm text-white placeholder-text-muted/50 font-medium",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
            "hover:border-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

// Themed textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-bg-dark border border-border-dark rounded-xl px-3.5 py-2.5",
            "text-sm text-white placeholder-text-muted/50 font-medium",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
            "hover:border-white/20 resize-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"
