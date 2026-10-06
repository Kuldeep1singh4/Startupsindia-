import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"

export const ApplicationStatus = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        setLoading(false)
        return
      }

      const { data } = await supabase.from('ambassadors')
        .select('status')
        .eq('user_id', authData.user.id)
        .single()
      
      if (data) setStatus(data.status)
      setLoading(false)
    }
    fetchStatus()
  }, [])

  if (loading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center py-10">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📝</div>
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
        <p className="text-text-muted mb-6">Thank you for applying to become a StartupsIndia Ambassador.</p>
        
        <div className="mb-8">
          <p className="text-sm text-text-muted mb-2">Current Status:</p>
          <Badge variant={status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning'} className="text-base px-4 py-1">
            {status || 'Unknown'}
          </Badge>
        </div>

        {status === 'Approved' ? (
          <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">Return Home</Button>
        )}
      </Card>
    </div>
  )
}
