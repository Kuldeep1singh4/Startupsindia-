import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "./Button"
import { cn } from "../lib/utils"

interface ErrorAlertProps {
  message?: string | null
  onRetry?: () => void
  className?: string
  title?: string
}

export function ErrorAlert({
  message,
  onRetry,
  className,
  title = "Something went wrong"
}: ErrorAlertProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 flex items-start gap-3.5 animate-fade-in",
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed break-words">{message}</p>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="shrink-0 border-rose-500/30 text-rose-200 hover:bg-rose-500/20 text-xs gap-1.5 h-8 px-2.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </Button>
      )}
    </div>
  )
}
