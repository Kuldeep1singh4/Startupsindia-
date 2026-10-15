import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | string
  className?: string
  showCloseButton?: boolean
}

/**
 * Universal Modal component.
 * Mounted via createPortal on document.body to ensure it ALWAYS centers on the entire screen,
 * immune to sidebar offsets, topbars, parent transforms, or nested scroll containers.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  icon,
  children,
  maxWidth = "lg",
  className,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    // Lock body scrolling when modal is active
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const subText = subtitle || description

  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }

  const resolvedMaxWidth = maxWidthClasses[maxWidth] || (maxWidth.startsWith("max-w-") ? maxWidth : "max-w-lg")

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay — click to dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card — dead center on screen, never cut off */}
      <div
        className={cn(
          "w-full my-auto rounded-2xl border border-border-dark bg-bg-card shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden text-white transition-all",
          resolvedMaxWidth,
          className
        )}
      >
        {/* Optional Header */}
        {(title || icon || showCloseButton) && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border-dark bg-bg-card shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              {icon && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {typeof title === "string" ? (
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{title}</h3>
                ) : (
                  title
                )}
                {subText && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{subText}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Dialog Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
