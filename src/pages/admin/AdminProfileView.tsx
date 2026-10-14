import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card } from "../../components/Card"
import { Badge } from "../../components/Badge"
import { supabase } from "../../lib/supabase"
import {
  Shield, Mail, Phone, Clock, Lock,
  CheckCircle2, AlertCircle, KeyRound, Terminal
} from "lucide-react"

export function AdminProfileView() {
  const { profile, user } = useAuth()
  const [adminLogs, setAdminLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true)
      if (profile?.id) {
        const { data } = await supabase
          .from("admin_logs")
          .select("*")
          .eq("admin_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(10)
        if (data) setAdminLogs(data)
      }
      setLoadingLogs(false)
    }
    fetchLogs()
  }, [profile?.id])

  const initials = profile?.full_name
    ?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD"

  const handleCopyId = () => {
    if (!profile?.id) return
    navigator.clipboard.writeText(profile.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-bg-card to-bg-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-lg shadow-primary/10">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{profile?.full_name || "Administrator"}</h2>
              <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5">
                Full Administrator
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{profile?.email || user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-bg-dark border border-border-dark text-text-muted flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" /> System Level: Root
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Admin Identity & Credentials */}
        <div className="space-y-6">
          <Card className="p-5 border-border-dark bg-bg-card/70 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Admin Identity
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-text-muted uppercase tracking-wider block font-semibold mb-1">
                  Designation
                </span>
                <div className="p-2.5 rounded-lg bg-bg-dark border border-border-dark text-white font-medium flex items-center justify-between">
                  <span>Administrator</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="text-text-muted uppercase tracking-wider block font-semibold mb-1">
                  Admin User ID
                </span>
                <div className="p-2.5 rounded-lg bg-bg-dark border border-border-dark font-mono text-[11px] text-text-muted flex items-center justify-between">
                  <span className="truncate mr-2">{profile?.id || user?.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-primary hover:text-white shrink-0 underline text-[10px]"
                  >
                    {copiedId ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-text-muted uppercase tracking-wider block font-semibold mb-1">
                  Associated Email
                </span>
                <div className="p-2.5 rounded-lg bg-bg-dark border border-border-dark text-white flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="truncate">{profile?.email || user?.email}</span>
                </div>
              </div>

              <div>
                <span className="text-text-muted uppercase tracking-wider block font-semibold mb-1">
                  Mobile Contact
                </span>
                <div className="p-2.5 rounded-lg bg-bg-dark border border-border-dark text-white flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  <span>{profile?.mobile_number || "Not specified"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Access Permissions Summary */}
          <Card className="p-5 border-border-dark bg-bg-card/70 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Granted Capabilities
            </h3>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Ambassador verification & approvals
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Task proof review & point allocation
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Task catalog & milestone configuration
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Level tiers & reward inventory management
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Terms & conditions policy updates
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Security Auditing & Logs */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5 border-border-dark bg-bg-card/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" /> Admin Security Audit Trail
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Recent administrative actions, role modifications, and system events.
                </p>
              </div>
            </div>

            {loadingLogs ? (
              <div className="space-y-2 animate-pulse py-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-bg-dark rounded-xl" />
                ))}
              </div>
            ) : adminLogs.length === 0 ? (
              <div className="py-12 text-center text-text-muted border border-dashed border-border-dark rounded-xl">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold text-white">No recent audit logs</p>
                <p className="text-xs mt-1">Actions you perform will be logged here with timestamps.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {adminLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-bg-dark border border-border-dark flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        Role Change: {log.old_role} → {log.new_role}
                      </p>
                      <p className="text-text-muted text-[11px] font-mono mt-0.5">
                        Target: {log.target_ambassador_id}
                      </p>
                    </div>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Security Best Practices */}
          <Card className="p-5 border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <AlertCircle className="w-4 h-4" /> Administrative Policy Reminder
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Admin privileges grant full access to student data, point overrides, and proof verifications.
              Ensure you do not share your credentials or session. Use the "Sign Out" button when operating on public or shared terminals.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
