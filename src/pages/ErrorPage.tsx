import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/Button"
import { useAuth } from "../contexts/AuthContext"
import { ShieldAlert, ServerCrash, WifiOff, RefreshCw, Home } from "lucide-react"

export type ErrorType = "403" | "500" | "offline" | "general"

interface ErrorPageProps {
  type?: ErrorType
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorPage({
  type: propType,
  title: propTitle,
  message: propMessage,
  onRetry
}: ErrorPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()

  const type = propType || (searchParams.get("type") as ErrorType) || "500"

  const configMap = {
    "403": {
      icon: ShieldAlert,
      color: "text-amber-400",
      bgBorder: "border-amber-500/20 bg-amber-500/10 shadow-amber-500/10",
      code: "403",
      title: "Access Restricted",
      desc: "You do not have administrative or authorization clearance to view this resource."
    },
    "500": {
      icon: ServerCrash,
      color: "text-red-400",
      bgBorder: "border-red-500/20 bg-red-500/10 shadow-red-500/10",
      code: "500",
      title: "Internal System Error",
      desc: "An unexpected error occurred while processing your request. Our system team has been notified."
    },
    "offline": {
      icon: WifiOff,
      color: "text-blue-400",
      bgBorder: "border-blue-500/20 bg-blue-500/10 shadow-blue-500/10",
      code: "OFFLINE",
      title: "Connection Lost",
      desc: "Unable to establish connection to the server. Please check your network connection and retry."
    },
    "general": {
      icon: ServerCrash,
      color: "text-primary",
      bgBorder: "border-primary/20 bg-primary/10 shadow-primary/10",
      code: "ERROR",
      title: "Something Went Wrong",
      desc: "We encountered an issue loading this section. Please reload the page or return home."
    }
  }

  const currentConfig = configMap[type] || configMap["general"]
  const Icon = currentConfig.icon
  const displayTitle = propTitle || currentConfig.title
  const displayDesc = propMessage || currentConfig.desc

  const homeRoute = !user
    ? "/"
    : profile?.role === "admin"
    ? "/admin"
    : "/dashboard"

  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-primary/20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 animate-fade-in">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl border mb-6 shadow-xl ${currentConfig.bgBorder}`}>
          <Icon className={`w-10 h-10 ${currentConfig.color}`} />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono text-text-muted px-2.5 py-1 rounded-full border border-border-dark inline-block mb-3">
          Error {currentConfig.code}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          {displayTitle}
        </h1>

        <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {displayDesc}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={onRetry ? onRetry : () => window.location.reload()}
            className="w-full sm:w-auto border-border-dark hover:border-white/20 gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>

          <Button
            onClick={() => navigate(homeRoute)}
            className="w-full sm:w-auto gap-2 text-xs sm:text-sm shadow-lg shadow-primary/25"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
