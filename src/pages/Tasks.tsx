import { useEffect, useState, useRef } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"
import { CheckCircle2, Clock, PlayCircle, XCircle, Upload, AlertCircle } from "lucide-react"
import { ErrorAlert } from "../components/ErrorAlert"
import { checkRateLimit } from "../lib/rateLimit"

type Task = {
  id: string;
  name: string;
  description: string;
  points: number;
  required_proof_type: string;
  is_active: boolean;
  is_repeatable: boolean;
  created_at: string;
}

type Submission = {
  id: string;
  task_id: string;
  status: string;
  proof_data: string;
  rejection_reason?: string;
  created_at: string;
}

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  
  // Modal state
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [proofData, setProofData] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setLoading(false)
        return
      }

      const { data: ambData, error: ambError } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (ambError) throw ambError

      if (ambData) {
        setAmbassadorId(ambData.id)
        
        const { data: subs, error: subsError } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('ambassador_id', ambData.id)
          .order('created_at', { ascending: false })
        
        if (subsError) throw subsError
        if (subs) setSubmissions(subs)
        
        const subTaskIds = subs 
          ? subs.map(s => s.task_id).filter((id): id is string => typeof id === 'string' && /^[0-9a-fA-F-]+$/.test(id)) 
          : []

        let query = supabase.from('tasks').select('*')
        if (subTaskIds.length > 0) {
          query = query.or(`is_active.eq.true,id.in.(${subTaskIds.join(',')})`)
        } else {
          query = query.eq('is_active', true)
        }
        
        const { data: tasksData, error: tasksError } = await query
        if (tasksError) throw tasksError

        if (tasksData) {
          // Order logic: Pending/New first, then Approved. Within groups, newest first.
          tasksData.sort((a, b) => {
            const aSubs = subs?.filter(s => s.task_id === a.id) || []
            const bSubs = subs?.filter(s => s.task_id === b.id) || []
            
            const aLatest = aSubs[0]
            const bLatest = bSubs[0]
            
            const aIsDone = aLatest?.status === 'Approved' && !a.is_repeatable
            const bIsDone = bLatest?.status === 'Approved' && !b.is_repeatable
            
            if (aIsDone && !bIsDone) return 1
            if (!aIsDone && bIsDone) return -1
            
            // Order by recency
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          
          setTasks(tasksData)
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err)
      setError(err.message || "Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingImage(true)
    setSubmitError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${ambassadorId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('proofs').getPublicUrl(filePath)
      setProofData(data.publicUrl)
    } catch (err: any) {
      console.error("Upload error:", err)
      setSubmitError(err.message || "Failed to upload image proof. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmitProof = async (e: any) => {
    e.preventDefault()
    if (!activeTask || !ambassadorId) return

    // Rate limit: max 5 submissions per 60 seconds
    const limit = checkRateLimit(`task_submit_${ambassadorId}`, 5, 60_000, 30_000)
    if (!limit.allowed) {
      setSubmitError(limit.message || "Submissions rate limited. Please wait before submitting again.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const latestSub = submissions.filter(s => s.task_id === activeTask.id)[0]
      
      if (latestSub && latestSub.status === 'Rejected' && !activeTask.is_repeatable) {
        const { error: updateErr } = await supabase
          .from('task_submissions')
          .update({ proof_data: proofData, status: 'Pending', updated_at: new Date().toISOString() })
          .eq('id', latestSub.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('task_submissions')
          .insert([{
            ambassador_id: ambassadorId,
            task_id: activeTask.id,
            proof_data: proofData,
            status: 'Pending'
          }])
        if (insertErr) throw insertErr
      }
      
      const taskName = activeTask.name
      await fetchData()
      setActiveTask(null)
      setProofData("")
      setSuccessMsg(`Task "${taskName}" submitted successfully! Your submission is now under review.`)
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err: any) {
      console.error("Submission error:", err)
      setSubmitError(err.message || "Failed to submit task proof. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-bg-card rounded w-1/3 mb-8"></div>
        {[1,2,3].map(i => <div key={i} className="h-32 bg-bg-card rounded-xl border border-border-dark"></div>)}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <SectionHeader title="My Tasks" subtitle="Complete assigned tasks to earn points and level up." />

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 flex items-center gap-3 text-sm animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && <ErrorAlert message={error} onRetry={fetchData} className="mb-4" />}
      
      <div className="space-y-4">
        {tasks.length === 0 && <p className="text-text-muted">No tasks available right now.</p>}
        {tasks.map(task => {
          const mySubs = submissions.filter(s => s.task_id === task.id)
          const latestSub = mySubs.length > 0 ? mySubs[0] : null
          const status = latestSub ? latestSub.status : 'Not Started'
          
          const canStart = status === 'Not Started' || status === 'Rejected' || task.is_repeatable
          
          return (
            <Card key={task.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-border-dark/80 transition-colors">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{task.name}</h3>
                  {status === 'Not Started' && <Badge variant="default">New</Badge>}
                  {status === 'Pending' && !task.is_repeatable && <Badge variant="warning">Under Review</Badge>}
                  {status === 'Approved' && !task.is_repeatable && <Badge variant="success">Completed</Badge>}
                  {status === 'Rejected' && !task.is_repeatable && <Badge variant="error">Rejected</Badge>}
                  {!task.is_active && <Badge variant="outline">Inactive</Badge>}
                  {task.is_repeatable && <Badge variant="default">Repeatable</Badge>}
                </div>
                <p className="text-text-muted text-sm mb-3">{task.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium mb-3">
                  <span className="text-primary font-bold">+{task.points} Points</span>
                  <span className="text-text-muted bg-border-dark px-2 py-1 rounded">Proof: {task.required_proof_type}</span>
                </div>
                {latestSub?.status === 'Rejected' && latestSub?.rejection_reason && (
                  <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block mb-0.5">Submission Rejected</span>
                      {latestSub.rejection_reason}
                    </div>
                  </div>
                )}
                {task.is_repeatable && mySubs.length > 0 && (
                  <div className="text-xs text-text-muted mt-2">
                    Previous submissions: {mySubs.filter(s => s.status === 'Approved').length} Approved, {mySubs.filter(s => s.status === 'Pending').length} Pending
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                {canStart && task.is_active && (
                  <Button onClick={() => { setActiveTask(task); setProofData("") }}>
                    {task.is_repeatable ? 'Submit Task' : status === 'Rejected' ? 'Resubmit Proof' : 'Start Task'} <PlayCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {status === 'Pending' && !task.is_repeatable && (
                  <Button variant="outline" disabled>In Review <Clock className="w-4 h-4 ml-2" /></Button>
                )}
                {status === 'Approved' && !task.is_repeatable && (
                  <Button variant="secondary" className="text-green-600 hover:text-green-700 hover:bg-white" disabled>Done <CheckCircle2 className="w-4 h-4 ml-2" /></Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Task Submission Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full max-w-lg shadow-2xl relative bg-bg-card my-auto max-h-[90dvh] overflow-y-auto border border-border-dark">
            <button 
              onClick={() => setActiveTask(null)} 
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">{activeTask.name}</h2>
            <p className="text-text-muted mb-6 text-sm">{activeTask.description}</p>
            
            {submitError && <ErrorAlert message={submitError} className="mb-4" />}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Submit Proof ({activeTask.required_proof_type})
                </label>
                
                {(activeTask.required_proof_type === 'Image' || activeTask.required_proof_type === 'Screenshot') ? (
                  <div className="space-y-2">
                    <input type="hidden" required value={proofData} />
                    {proofData ? (
                      <div className="relative border border-border-dark rounded overflow-hidden">
                        <img src={proofData} alt="Proof" className="w-full h-40 object-cover" />
                        <button type="button" onClick={() => setProofData("")} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black transition-colors"><XCircle className="w-5 h-5 text-white" /></button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="w-full h-32 flex flex-col items-center justify-center border-dashed hover:border-primary/50" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                        <Upload className="w-6 h-6 mb-2 text-text-muted" />
                        {uploadingImage ? "Uploading..." : "Click to Upload Image"}
                      </Button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                ) : (activeTask.required_proof_type === 'URL' || activeTask.required_proof_type === 'Video URL') ? (
                  <input 
                    required 
                    type="url" 
                    placeholder="https://..." 
                    value={proofData} 
                    onChange={e => setProofData(e.target.value)} 
                    className="w-full bg-bg-dark border border-border-dark rounded-md p-3 text-white focus:outline-none focus:border-primary transition-colors hover:border-primary/50"
                  />
                ) : (
                  <textarea 
                    required 
                    placeholder="Enter details here..." 
                    value={proofData} 
                    onChange={e => setProofData(e.target.value)} 
                    className="w-full bg-bg-dark border border-border-dark rounded-md p-3 text-white min-h-[120px] focus:outline-none focus:border-primary transition-colors hover:border-primary/50"
                  />
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setActiveTask(null)} className="flex-1 hover:bg-white/5">Cancel</Button>
                <Button type="submit" className="flex-1 hover:-translate-y-0.5 transition-transform" disabled={submitting || (['Image', 'Screenshot'].includes(activeTask.required_proof_type) && !proofData)}>
                  {submitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
