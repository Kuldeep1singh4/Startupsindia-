import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { Logo } from "../components/Logo"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

import { checkRateLimit, resetRateLimit } from "../lib/rateLimit"

export const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: any) => {
    e.preventDefault()
    
    // Rate limit check: max 5 attempts per minute
    const limit = checkRateLimit('login_auth', 5, 60_000, 60_000)
    if (!limit.allowed) {
      setError(limit.message || "Too many login attempts. Please try again later.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (authError) throw authError

      // Successful login resets rate limit counter
      resetRateLimit('login_auth')

      // Check role
      const { data: profile } = await supabase
        .from('ambassadors')
        .select('role')
        .eq('user_id', authData.user.id)
        .single()

      if (profile?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || "Invalid login credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        {/* Back to Home Button (Task 6) */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-4 group"
          aria-label="Back to landing page"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="flex justify-center mb-6">
          <Logo size="lg" to="/" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        
        {error && <div className="bg-primary/20 text-primary p-3 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-bg-dark border border-border-dark rounded-md p-3 text-white focus:outline-none focus:border-primary transition-colors hover:border-primary/50" />
          
          <div className="relative">
            <input required type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-bg-dark border border-border-dark rounded-md p-3 pr-10 text-white focus:outline-none focus:border-primary transition-colors hover:border-primary/50" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-text-muted hover:text-white transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="text-xs text-text-muted hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>
          
          <Button type="submit" className="w-full hover:-translate-y-0.5 transition-transform" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
          <div className="text-center pt-4 mt-4 border-t border-border-dark">
            <Button type="button" variant="ghost" onClick={() => navigate('/register')} className="hover:bg-white/5 transition-colors">Apply to be an Ambassador</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
