import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"

type Submission = {
  id: string
  proof_data: string
  created_at: string
  status: string
  ambassador_id: string
  task_id: string
  ambassadors: { full_name: string; current_level: string; college_name: string }
  tasks: { name: string; required_proof_type: string; points: number }
}

export function TaskVerificationView({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('task_submissions')
        .select(`
          id, proof_data, created_at, status, ambassador_id, task_id,
          ambassadors (full_name, current_level, college_name),
          tasks (name, required_proof_type, points)
        `)
        .eq('status', statusFilter)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      if (data) setSubmissions(data as any)

      // Update pending badge count
      if (statusFilter === 'Pending' && onCountChange) {
        onCountChange(data?.length || 0)
      }
    } catch (err: any) {
      console.error("Failed to fetch submissions:", err)
      setError(err.message || "Failed to load task submissions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubmissions() }, [statusFilter])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    setFeedbackMsg(null)
    try {
      const { error: appErr } = await supabase.from('task_submissions').update({ status: 'Approved' }).eq('id', id)
      if (appErr) throw appErr
      setFeedbackMsg({ type: 'success', text: "Submission verified and approved successfully." })
      setTimeout(() => setFeedbackMsg(null), 3500)
      await fetchSubmissions()
    } catch (err: any) {
      console.error("Approve error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to approve submission." })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingId || !rejectionReason.trim()) return
    setActionLoading(rejectingId)
    setFeedbackMsg(null)
    try {
      const { error: rejErr } = await supabase.from('task_submissions').update({
        status: 'Rejected',
        rejection_reason: rejectionReason.trim()
      }).eq('id', rejectingId)
      if (rejErr) throw rejErr

      setFeedbackMsg({ type: 'success', text: "Submission marked as rejected with reason recorded." })
      setTimeout(() => setFeedbackMsg(null), 3500)
      setRejectingId(null)
      setRejectionReason("")
      await fetchSubmissions()
    } catch (err: any) {
      console.error("Reject error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to reject submission." })
    } finally {
      setActionLoading(null)
    }
  }

  const isImage = (sub: Submission) =>
    ['Image', 'Screenshot'].includes(sub.tasks?.required_proof_type) && sub.proof_data?.startsWith('http')

  const isUrl = (sub: Submission) =>
    !isImage(sub) && sub.proof_data?.startsWith('http')

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {error && <ErrorAlert message={error} onRetry={fetchSubmissions} />}

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {(['Pending', 'Approved', 'Rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? s === 'Pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                    : s === 'Approved' ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                  : 'bg-bg-card border border-border-dark text-text-muted hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-bg-card rounded-2xl" />)}
        </div>
      ) : submissions.length === 0 ? (
        <Card className="py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-25" />
          <p className="text-text-muted">No {statusFilter.toLowerCase()} submissions.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <Card key={sub.id} className="p-4 hover:border-border-dark/60 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-bold text-white text-sm">{sub.ambassadors?.full_name}</span>
                    <Badge variant="outline" className="text-[10px]">{sub.ambassadors?.current_level || 'Bronze'}</Badge>
                  </div>
                  <p className="text-text-muted text-xs mb-1 truncate">{sub.ambassadors?.college_name}</p>
                  <h4 className="text-primary font-bold text-sm mb-2">
                    {sub.tasks?.name}
                    <span className="text-text-muted font-normal ml-1.5 text-xs">+{sub.tasks?.points} pts</span>
                  </h4>

                  {/* Proof preview */}
                  <div className="bg-bg-dark border border-border-dark rounded-xl p-3 text-sm">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">
                      {sub.tasks?.required_proof_type} Proof
                    </p>
                    {isImage(sub) ? (
                      <a href={sub.proof_data} target="_blank" rel="noreferrer" className="group block">
                        <img
                          src={sub.proof_data}
                          alt="Proof"
                          className="max-h-48 rounded-lg object-contain border border-border-dark group-hover:border-primary/30 transition-colors"
                        />
                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Open full size
                        </p>
                      </a>
                    ) : isUrl(sub) ? (
                      <a
                        href={sub.proof_data}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-xs hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="break-all">{sub.proof_data}</span>
                      </a>
                    ) : (
                      <p className="text-white text-sm break-all">{sub.proof_data}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-text-muted mt-2">
                    Submitted {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions — right column on sm+, below on mobile */}
                {statusFilter === 'Pending' && (
                  <div className="flex sm:flex-col gap-2 sm:justify-start sm:min-w-[120px]">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(sub.id)}
                      disabled={actionLoading === sub.id}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 border-none shadow-none text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingId(sub.id)}
                      disabled={actionLoading === sub.id}
                      className="flex-1 sm:flex-none text-red-400 border-red-500/30 hover:bg-red-500/8"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-md shadow-2xl bg-bg-card rounded-2xl my-auto border border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Reject Submission</h3>
              <button onClick={() => setRejectingId(null)} className="text-text-muted hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. The screenshot is blurry or does not show required content."
                  rows={3}
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRejectingId(null)}>Cancel</Button>
                <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 border-none text-white">
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
