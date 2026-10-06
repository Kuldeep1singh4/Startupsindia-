import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { supabase } from "../../lib/supabase"
import { Shield, ShieldOff, Edit2, Trash2 } from "lucide-react"

type Ambassador = {
  id: string
  full_name: string
  email: string
  college_name: string
  status: string
  role: string
  total_points: number
}

export const AmbassadorMgmt = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState<string | null>(null)
  
  const [editingAmb, setEditingAmb] = useState<Ambassador | null>(null)

  const fetchAmbassadors = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('ambassadors').select('id').eq('user_id', user.id).single()
      if (profile) setAdminId(profile.id)
    }

    const { data } = await supabase
      .from('ambassadors')
      .select('id, full_name, email, college_name, status, role, total_points')
      .order('created_at', { ascending: false })
    
    if (data) setAmbassadors(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAmbassadors()
  }, [])

  const handleRoleToggle = async (amb: Ambassador) => {
    if (!adminId) return
    const newRole = amb.role === 'admin' ? 'ambassador' : 'admin'
    const { error } = await supabase.from('ambassadors').update({ role: newRole }).eq('id', amb.id)
    if (!error) {
      await supabase.from('admin_logs').insert([{ admin_id: adminId, target_ambassador_id: amb.id, old_role: amb.role, new_role: newRole }])
      setAmbassadors(prev => prev.map(a => a.id === amb.id ? { ...a, role: newRole } : a))
    }
  }
  
  const handleEditSubmit = async (e: any) => {
    e.preventDefault()
    if (!editingAmb || !adminId) return
    const formData = new FormData(e.target)
    const status = formData.get('status') as string
    
    // Update status
    await supabase.from('ambassadors').update({ status }).eq('id', editingAmb.id)
    
    // Handle point override
    const addPoints = parseInt(formData.get('add_points') as string)
    if (addPoints && addPoints !== 0) {
      await supabase.from('admin_point_overrides').insert([{
        admin_id: adminId,
        ambassador_id: editingAmb.id,
        points_added: addPoints,
        reason: formData.get('reason') as string
      }])
    }
    
    setEditingAmb(null)
    fetchAmbassadors()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this ambassador?')) {
      await supabase.from('ambassadors').delete().eq('id', id)
      fetchAmbassadors()
    }
  }

  if (loading) return (
    <Card>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-bg-dark rounded w-1/3 mb-6"></div>
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-bg-dark rounded"></div>)}
      </div>
    </Card>
  )

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-6">Ambassador Management</h3>
      
      {editingAmb && (
        <Card className="mb-6 border border-primary/50 bg-bg-dark/50">
          <h4 className="font-bold text-white mb-4">Edit Ambassador: {editingAmb.full_name}</h4>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Status</label>
              <select name="status" defaultValue={editingAmb.status} className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white">
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-border-dark">
              <label className="block text-sm text-text-muted mb-1 font-bold">Manual Point Override</label>
              <p className="text-xs text-text-muted mb-3">Add or subtract points. This will trigger a recalculation.</p>
              <div className="flex gap-4">
                <input type="number" name="add_points" defaultValue={0} className="w-1/3 p-2 rounded bg-bg-dark border border-border-dark text-white" />
                <input type="text" name="reason" placeholder="Reason for override..." className="flex-1 p-2 rounded bg-bg-dark border border-border-dark text-white" />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="ghost" type="button" onClick={() => setEditingAmb(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-dark bg-bg-dark/50">
              <th className="p-4 text-text-muted font-bold text-sm">Name / Email</th>
              <th className="p-4 text-text-muted font-bold text-sm">College</th>
              <th className="p-4 text-text-muted font-bold text-sm">Status</th>
              <th className="p-4 text-text-muted font-bold text-sm">Points</th>
              <th className="p-4 text-text-muted font-bold text-sm">Role</th>
              <th className="p-4 text-text-muted font-bold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ambassadors.map(amb => (
              <tr key={amb.id} className="border-b border-border-dark/50 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{amb.full_name}</div>
                  <div className="text-xs text-text-muted">{amb.email}</div>
                </td>
                <td className="p-4 text-text-muted text-sm">{amb.college_name}</td>
                <td className="p-4">
                  <Badge variant={amb.status === 'Approved' ? 'success' : amb.status === 'Pending' ? 'warning' : 'error'}>
                    {amb.status}
                  </Badge>
                </td>
                <td className="p-4 text-white font-bold">{amb.total_points}</td>
                <td className="p-4">
                  <Badge variant={amb.role === 'admin' ? 'default' : 'outline'}>
                    {amb.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-4 text-right flex justify-end gap-2 items-center h-full">
                  <Button 
                    size="sm" 
                    variant={amb.role === 'admin' ? 'outline' : 'primary'}
                    onClick={() => handleRoleToggle(amb)}
                  >
                    {amb.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingAmb(amb)}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(amb.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
