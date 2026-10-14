import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { Logo } from "../components/Logo"
import {
  CheckCircle2, Sparkles, ArrowRight, Trophy, CheckSquare,
  Gift, Users, Compass
} from "lucide-react"

export function Welcome() {
  const navigate = useNavigate()
  const { profile, user } = useAuth()

  const name = profile?.full_name?.split(" ")[0] || "Ambassador"

  const steps = [
    {
      num: "01",
      icon: CheckSquare,
      title: "Explore Your Task Library",
      desc: "Complete campus campaigns, share initiatives, and submit proof to start earning points."
    },
    {
      num: "02",
      icon: Trophy,
      title: "Climb the National Leaderboard",
      desc: "Compete with students across states and colleges to reach Diamond and National levels."
    },
    {
      num: "03",
      icon: Gift,
      title: "Unlock Exclusive Rewards",
      desc: "Redeem official StartupsIndia merchandise, event passes, gadgets, and certificates."
    },
    {
      num: "04",
      icon: Users,
      title: "Build Your Campus Network",
      desc: "Invite your peers with your unique referral code to earn +50 bonus points each."
    }
  ]

  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-primary/20">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <Logo size="md" to="/" />
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1.5 text-xs py-1 px-3">
          <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
        </Badge>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Official Onboarding
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Welcome to the Team, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">{name}</span>!
          </h1>

          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your email is confirmed and your ambassador account is activated. You are now officially representing StartupsIndia at your college campus.
          </p>
        </div>

        {/* 4 Getting Started Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <Card
                key={idx}
                className="p-5 border-border-dark bg-bg-card/70 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-text-muted">{step.num}</span>
                      <h3 className="font-bold text-sm sm:text-base text-white">{step.title}</h3>
                    </div>
                    <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Action Center Card */}
        <Card className="p-6 sm:p-8 border-primary/25 bg-gradient-to-br from-bg-card via-bg-card to-primary/5 text-center relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ready to claim your first reward?
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Head over to your personal dashboard to view your starting level (Bronze Ambassador) and take on your first assignment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="w-full sm:w-auto text-sm gap-2 shadow-xl shadow-primary/25"
              >
                Go to My Dashboard <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/tasks")}
                className="w-full sm:w-auto text-sm border-border-dark hover:border-white/20 gap-2"
              >
                <Compass className="w-4 h-4" /> Browse Tasks
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full py-4 text-center text-xs text-text-muted border-t border-border-dark flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} StartupsIndia Ambassador Program.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors">
            Terms & Conditions
          </button>
          <span>·</span>
          <a href="mailto:support@startupsindia.org" className="hover:text-white transition-colors">
            Need Help?
          </a>
        </div>
      </footer>
    </div>
  )
}
