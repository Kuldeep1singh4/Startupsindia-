import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { supabase } from "../../lib/supabase"
import { CheckCircle2, XCircle } from "lucide-react"

type Submission = {
  id: string
  proof_data: string
  created_at: string
  status: string
  ambassador_id: string
  task_id: string
  ambassadors: { full_name: string; current_level: string }
  tasks: { name: string; required_proof_type: string; points: number }
}

export const TaskVerification = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchSubmissions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('task_submissions')
      .select(`
        id, proof_data, created_at, status, ambassador_id, task_id,
        ambassadors (full_name, current_level),
        tasks (name, required_proof_type, points)
      `)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
    
    if (data) setSubmissions(data as any)
    setLoading(false)
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleApprove = async (id: string) => {
    await supabase.from('task_submissions').update({ status: 'Approved' }).eq('id', id)
    fetchSubmissions()
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingId || !rejectionReason) return
    
    await supabase.from('task_submissions').update({ 
      status: 'Rejected',
      rejection_reason: rejectionReason 
    }).eq('id', rejectingId)
    
    setRejectingId(null)
    setRejectionReason("")
    fetchSubmissions()
  }

  if (loading) return (
    <Card>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-bg-dark rounded w-1/4 mb-6"></div>
        {[1,2,3].map(i => <div key={i} className="h-32 bg-bg-dark rounded-lg"></div>)}
      </div>
    </Card>
  )

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-6">Pending Task Reviews</h3>
      {submissions.length === 0 && <p className="text-text-muted">No pending reviews.</p>}
      
      <div className="space-y-4">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-bg-dark border border-border-dark p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{sub.ambassadors?.full_name}</span>
                <Badge variant="outline">{sub.ambassadors?.current_level}</Badge>
              </div>
              <h4 className="text-primary font-bold">{sub.tasks?.name} <span className="text-text-muted text-sm font-normal">({sub.tasks?.points} pts)</span></h4>
              <div className="mt-2 text-sm">
                <span className="text-text-muted">Proof Type: {sub.tasks?.required_proof_type}</span>
                <div className="bg-bg-card p-3 rounded mt-1 border border-border-dark break-all text-white overflow-hidden">
                  {(sub.tasks?.required_proof_type === 'Image' || sub.tasks?.required_proof_type === 'Screenshot') && sub.proof_data.startsWith('http') ? (
                    <a href={sub.proof_data} target="_blank" rel="noreferrer">
                      <img src={sub.proof_data} alt="Proof" className="max-h-64 rounded object-contain" />
                    </a>
                  ) : sub.proof_data.startsWith('http') ? (
                    <a href={sub.proof_data} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{sub.proof_data}</a>
                  ) : (
                    sub.proof_data
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={() => handleApprove(sub.id)} className="bg-green-600 hover:bg-green-700 text-white border-none">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejectingId(sub.id)} className="text-red-500 hover:text-red-400">
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {rejectingId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl relative bg-bg-card">
            <button 
              onClick={() => setRejectingId(null)} 
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Reject Submission</h3>
            <form onSubmit={handleRejectSubmit}>
              <label className="block text-sm text-text-muted mb-2">Please provide a reason for rejection:</label>
              <textarea 
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g., The screenshot is blurry, please retake."
                className="w-full bg-bg-dark border border-border-dark rounded-md p-3 text-white min-h-[100px] mb-4 focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white border-none">Confirm Rejection</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  )
}
