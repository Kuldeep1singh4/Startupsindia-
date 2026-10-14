import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { useAuth } from "../contexts/AuthContext"
import { AlertCircle, ArrowLeft, Home, Compass } from "lucide-react"

export function NotFound() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const homeRoute = !user
    ? "/"
    : profile?.role === "admin"
    ? "/admin"
    : "/dashboard"

  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-primary/20">
      {/* Background decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 animate-fade-in">
        {/* Badge & Graphic */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6 shadow-xl shadow-primary/10">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h1 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tight mb-2">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          We couldn't find the page you're looking for. It may have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto border-border-dark hover:border-white/20 gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>

          <Button
            onClick={() => navigate(homeRoute)}
            className="w-full sm:w-auto gap-2 text-xs sm:text-sm shadow-lg shadow-primary/25"
          >
            <Home className="w-4 h-4" /> Return Home
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-6 border-t border-border-dark flex items-center justify-center gap-6 text-xs text-text-muted">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-primary" /> Dashboard
          </button>
          <span>·</span>
          <button
            onClick={() => navigate("/tasks")}
            className="hover:text-white transition-colors"
          >
            Tasks
          </button>
          <span>·</span>
          <button
            onClick={() => navigate("/terms")}
            className="hover:text-white transition-colors"
          >
            Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  )
}
