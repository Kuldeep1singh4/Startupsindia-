import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard, ListChecks, UserCheck, ClipboardList,
  Layers, Gift, Menu, X, ChevronRight, FileText, Shield, Award, Bell
} from "lucide-react"

// Admin sub-pages
import { AdminDashboardView } from "./AdminDashboardView"
import { AmbassadorMgmtView } from "./AmbassadorMgmtView"
import { TaskVerificationView } from "./TaskVerificationView"
import { TaskMgmtView } from "./TaskMgmtView"
import { LevelMgmtView } from "./LevelMgmtView"
import { RewardMgmtView } from "./RewardMgmtView"
import { CertificateMgmtView } from "./CertificateMgmtView"
import { NotificationMgmtView } from "./NotificationMgmtView"
import { AdminProfileView } from "./AdminProfileView"
import { Terms } from "../Terms"

const SECTIONS = [
  { id: 'dashboard',      label: 'Overview',           icon: LayoutDashboard, badge: null },
  { id: 'verification',   label: 'Verifications',      icon: ListChecks,      badge: 'pending' },
  { id: 'ambassadors',    label: 'Ambassadors',         icon: UserCheck,       badge: null },
  { id: 'tasks',          label: 'Task Library',        icon: ClipboardList,   badge: null },
  { id: 'levels',         label: 'Level Config',        icon: Layers,          badge: null },
  { id: 'certificates',   label: 'Certificates',        icon: Award,           badge: null },
  { id: 'rewards',        label: 'Reward Catalog',      icon: Gift,            badge: null },
  { id: 'notifications',  label: 'Push Notifications',  icon: Bell,            badge: null },
  { id: 'terms',          label: 'Terms & Conditions',  icon: FileText,        badge: null },
  { id: 'profile',        label: 'Admin Profile',       icon: Shield,          badge: null },
]

export function AdminPortal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'dashboard'
  const [activeSection, setActiveSection] = useState(initialTab)
  const [pendingCount, setPendingCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && SECTIONS.some(s => s.id === tab)) {
      setActiveSection(tab)
    }
  }, [searchParams])

  useEffect(() => {
    // Fetch pending verification count for badge
    supabase
      .from('task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')
      .then(({ count }) => { if (count) setPendingCount(count) })
  }, [activeSection])

  const currentSection = SECTIONS.find(s => s.id === activeSection)

  function navClick(id: string) {
    setActiveSection(id)
    setSearchParams({ tab: id })
    setSidebarOpen(false)
  }

  return (
    <div className="flex flex-1 min-h-0 h-full overflow-hidden">
      {/* ── Mobile overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Admin Sidebar (Fixed/Static on desktop) ───── */}
      <aside className={cn(
        "fixed md:static top-0 left-0 h-full z-50 md:z-auto",
        "w-60 bg-bg-card border-r border-border-dark flex flex-col shrink-0",
        "transition-transform duration-200 ease-out md:translate-x-0",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header (Logo moved to top-left of main header per Task 1) */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border-dark shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-white">Admin Menu</p>
          </div>
          <button
            className="md:hidden text-text-muted hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav — scrolls internally if items exceed height */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {SECTIONS.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            const count = section.badge === 'pending' ? pendingCount : 0

            return (
              <button
                key={section.id}
                onClick={() => navClick(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium text-sm transition-all duration-150 group",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                <span className="flex-1 text-left">{section.label}</span>
                {count > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main Content Column ───────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Section Header Bar — Fixed/Static at top */}
        <div className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border-dark bg-bg-dark shrink-0">
          <button
            className="md:hidden p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{currentSection?.label}</h1>
            <p className="text-[11px] text-text-muted hidden sm:block">StartupsIndia Ambassador Platform Admin</p>
          </div>
        </div>

        {/* Section Content — ONLY this middle area scrolls */}
        <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto pb-16">
          {activeSection === 'dashboard' && <AdminDashboardView />}
          {activeSection === 'verification' && <TaskVerificationView onCountChange={setPendingCount} />}
          {activeSection === 'ambassadors' && <AmbassadorMgmtView />}
          {activeSection === 'tasks' && <TaskMgmtView />}
          {activeSection === 'levels' && <LevelMgmtView />}
          {activeSection === 'certificates' && <CertificateMgmtView />}
          {activeSection === 'rewards' && <RewardMgmtView />}
          {activeSection === 'notifications' && <NotificationMgmtView />}
          {activeSection === 'terms' && <Terms />}
          {activeSection === 'profile' && <AdminProfileView />}
        </div>
      </div>
    </div>
  )
}
