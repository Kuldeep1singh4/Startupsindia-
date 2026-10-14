import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { Logo } from "../components/Logo"
import { Trophy, CheckSquare, Users, Star, ArrowRight } from "lucide-react"

export const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-dark text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" to="/" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Apply Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Star className="w-3.5 h-3.5" />
            StartupsIndia Ambassador Program
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Lead the Startup<br />
            <span className="text-primary">Ecosystem</span> at Your Campus
          </h1>

          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Become a StartupsIndia Ambassador. Complete tasks, earn points, unlock rewards,
            and represent us at your college.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')} className="sm:px-10">
              <span className="flex items-center gap-2">
                Join the Ambassador Program
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border-dark py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Ambassador Levels", value: "6" },
            { label: "States Covered", value: "28+" },
            { label: "Tasks to Complete", value: "20+" },
            { label: "Rewards to Unlock", value: "15+" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
              <div className="text-text-muted text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why become an ambassador */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Become an Ambassador?</h2>
            <p className="text-text-muted">Everything you get by joining the program</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Build Your Network",
                desc: "Connect with founders, investors, and fellow ambassadors nationwide across India.",
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                icon: Trophy,
                title: "Earn Rewards",
                desc: "Unlock exclusive goodies, event passes, gadgets, and the StartupsIndia kit as you level up.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10"
              },
              {
                icon: Star,
                title: "Career Growth",
                desc: "Gain real-world leadership experience, official certificates, and internship opportunities.",
                color: "text-green-400",
                bg: "bg-green-500/10"
              },
            ].map(card => (
              <Card key={card.title} className="hover:border-border-dark/60 transition-colors group">
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{card.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-text-muted mb-12">Simple steps to get started</p>
          <div className="space-y-4">
            {[
              { step: "01", title: "Register", desc: "Submit your ambassador application with your college details." },
              { step: "02", title: "Get Approved", desc: "Our team reviews your profile, usually within 24–48 hours." },
              { step: "03", title: "Complete Tasks", desc: "Access your dashboard and complete tasks to earn points." },
              { step: "04", title: "Level Up", desc: "Progress from Bronze to National Ambassador and unlock rewards." },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-5 text-left bg-bg-card border border-border-dark rounded-xl p-5 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 bg-primary/15 text-primary font-extrabold text-sm rounded-xl flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">{item.title}</h4>
                  <p className="text-text-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ambassador Levels */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ambassador Levels</h2>
          <p className="text-text-muted mb-12">Earn points and progress through the ranks</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { emoji: "🥉", name: "Bronze", pts: "0", role: "Campus Ambassador" },
              { emoji: "🥈", name: "Silver", pts: "2,000", role: "Sr. Campus Amb." },
              { emoji: "🥇", name: "Gold", pts: "5,000", role: "City Ambassador" },
              { emoji: "💠", name: "Platinum", pts: "10,000", role: "District Amb." },
              { emoji: "💎", name: "Diamond", pts: "20,000", role: "State Ambassador" },
              { emoji: "🏅", name: "National", pts: "50,000", role: "National Amb." },
            ].map(lvl => (
              <Card key={lvl.name} className="text-center p-4 hover:border-primary/30 transition-colors">
                <div className="text-3xl mb-2">{lvl.emoji}</div>
                <h4 className="font-bold text-white text-sm">{lvl.name}</h4>
                <p className="text-[10px] text-text-muted mt-0.5">{lvl.role}</p>
                <p className="text-primary text-xs font-bold mt-1">{lvl.pts} pts</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to represent StartupsIndia?</h2>
          <p className="text-text-muted mb-8">Join hundreds of campus ambassadors building India's next startup generation.</p>
          <Button size="lg" onClick={() => navigate('/register')} className="px-12">
            <span className="flex items-center gap-2">
              Apply to be an Ambassador
              <CheckSquare className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-dark py-8 px-4 text-center text-text-muted text-sm space-y-3 flex flex-col items-center">
        <Logo size="sm" to="/" />
        <p className="text-xs">
          Ambassador Platform · © {new Date().getFullYear()} StartupsIndia. All rights reserved.
        </p>
        <p className="text-xs">
          <button onClick={() => navigate('/terms')} className="text-text-muted hover:text-primary transition-colors underline">
            Terms & Conditions
          </button>
        </p>
      </footer>
    </div>
  )
}
