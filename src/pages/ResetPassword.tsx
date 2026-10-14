import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Logo } from "../components/Logo"
import { supabase } from "../lib/supabase"
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { checkRateLimit } from "../lib/rateLimit"

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Detection: check if arriving via password recovery link
  // Supabase appends #access_token=...&type=recovery or search params
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [requestSent, setRequestSent] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    // Check hash for type=recovery
    const hash = window.location.hash
    const isRecoveryHash = hash.includes("type=recovery") || searchParams.get("type") === "recovery"
    if (isRecoveryHash) {
      setIsRecoveryMode(true)
    }

    // Listen to Supabase auth state change for recovery event
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [searchParams])

  // Handle requesting a reset link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your registered email address.")
      return
    }

    // Rate limit: max 3 requests per 5 minutes
    const limit = checkRateLimit('reset_password_request', 3, 300_000, 300_000)
    if (!limit.allowed) {
      setError(limit.message || "Too many password reset requests. Please wait a few minutes.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const redirectUrl = `${window.location.origin}/reset-password?type=recovery`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })

      if (resetError) throw resetError
      setRequestSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle setting the new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Rate limit: max 5 attempts per 2 minutes
    const limit = checkRateLimit('reset_password_submit', 5, 120_000, 120_000)
    if (!limit.allowed) {
      setError(limit.message || "Too many attempts. Please wait before trying again.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.")
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError
      setResetSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again or request a new link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl relative z-10 p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <Logo size="lg" to="/" />
        </div>

        {/* ── STATE 1: SUCCESSFUL RESET ──────────────────────── */}
        {resetSuccess ? (
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              Your password has been successfully reset. You can now log into your account with your new credentials.
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Sign In Now
            </Button>
          </div>
        ) : requestSent ? (
          /* ── STATE 2: EMAIL SENT CONFIRMATION ─────────────── */
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
            <p className="text-text-muted text-sm mb-4 leading-relaxed">
              We sent a password reset link to:
            </p>
            <div className="p-3 bg-bg-dark rounded-xl border border-border-dark font-mono text-sm text-primary mb-6 break-all">
              {email}
            </div>
            <p className="text-text-muted text-xs mb-6 leading-relaxed">
              Click the link inside the email to choose a new password. If you don't see the email within a couple minutes, please check your spam folder.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-border-dark hover:border-white/20"
                onClick={() => setRequestSent(false)}
              >
                Try Another Email
              </Button>
              <Button
                variant="ghost"
                className="w-full text-text-muted hover:text-white"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Button>
            </div>
          </div>
        ) : isRecoveryMode ? (
          /* ── STATE 3: SET NEW PASSWORD (RECOVERY MODE) ─────── */
          <div className="animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Set New Password</h2>
            <p className="text-text-muted text-sm mb-6 text-center">
              Please enter your new password below.
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-5 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 pr-10 text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 pr-10 text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-text-muted hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </div>
        ) : (
          /* ── STATE 4: REQUEST RESET EMAIL (DEFAULT) ────────── */
          <div className="animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
            <p className="text-text-muted text-sm mb-6 text-center">
              Enter the email address registered with your account and we will send you a password recovery link.
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-5 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="name@college.edu or email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={loading}
              >
                {loading ? "Sending Link..." : "Send Reset Link"}
              </Button>

              <div className="text-center pt-4 border-t border-border-dark">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-text-muted hover:text-white text-xs gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  )
}
