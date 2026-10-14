import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { Logo } from "../components/Logo"
import { supabase } from "../lib/supabase"
import { ErrorAlert } from "../components/ErrorAlert"
import { LoadingState } from "../components/LoadingState"
import { FileText } from "lucide-react"

export const ApplicationStatus = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!authData.user) {
        setLoading(false)
        return
      }

      const { data, error: dbError } = await supabase
        .from('ambassadors')
        .select('status')
        .eq('user_id', authData.user.id)
        .single()
      
      if (dbError) throw dbError
      if (data) setStatus(data.status)
    } catch (err: any) {
      console.error("Failed to check status:", err)
      setError(err.message || "Failed to retrieve application status.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return <LoadingState variant="full-page" message="Checking your application status..." />
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center py-10 px-6 sm:px-8">
        <div className="flex justify-center mb-6">
          <Logo size="lg" to="/" />
        </div>

        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/30">
          <FileText className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
        <p className="text-text-muted mb-6 text-sm">Thank you for applying to become a StartupsIndia Ambassador.</p>
        
        {error && <ErrorAlert message={error} onRetry={fetchStatus} className="mb-6" />}

        <div className="mb-8 p-4 bg-bg-dark rounded-xl border border-border-dark">
          <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Current Review Status</p>
          <Badge variant={status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning'} className="text-sm px-4 py-1">
            {status || 'Pending Review'}
          </Badge>
        </div>

        {status === 'Approved' ? (
          <Button onClick={() => navigate('/dashboard')} className="w-full" size="lg">Go to Dashboard</Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/')} className="w-full" size="lg">Return Home</Button>
        )}
      </Card>
    </div>
  )
}
