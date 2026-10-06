import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { Select, Input } from "../../components/FormControls"
import { Shield, ShieldOff, Edit2, Trash2, Search, ChevronDown, ChevronUp, X } from "lucide-react"

type Ambassador = {
  id: string
  full_name: string
  email: string
  mobile_number?: string
  college_name: string
  city?: string
  state?: string
  status: string
  role: string
  total_points: number
  current_level?: string
  created_at: string
}

export function AmbassadorMgmtView() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [filtered, setFiltered] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingAmb, setEditingAmb] = useState<Ambassador | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('ambassadors').select('id').eq('user_id', user.id).single()
      if (p) setAdminId(p.id)
    }
    const { data } = await supabase
      .from('ambassadors')
      .select('id, full_name, email, mobile_number, college_name, city, state, status, role, total_points, current_level, created_at')
      .order('created_at', { ascending: false })
    if (data) { setAmbassadors(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Client-side filter + search
  useEffect(() => {
    let result = ambassadors
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.college_name?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [ambassadors, statusFilter, searchQuery])

  const handleStatusChange = async (amb: Ambassador, newStatus: string) => {
    setActionLoading(amb.id)
    await supabase.from('ambassadors').update({ status: newStatus }).eq('id', amb.id)
    setAmbassadors(prev => prev.map(a => a.id === amb.id ? { ...a, status: newStatus } : a))
    setActionLoading(null)
  }

  const handleRoleToggle = async (amb: Ambassador) => {
    if (!adminId) return
    const newRole = amb.role === 'admin' ? 'ambassador' : 'admin'
    setActionLoading(amb.id)
    const { error } = await supabase.from('ambassadors').update({ role: newRole }).eq('id', amb.id)
    if (!error) {
      await supabase.from('admin_logs').insert([{ admin_id: adminId, target_ambassador_id: amb.id, old_role: amb.role, new_role: newRole }]).select()
      setAmbassadors(prev => prev.map(a => a.id === amb.id ? { ...a, role: newRole } : a))
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this ambassador record? This cannot be undone.')) return
    setActionLoading(id)
    await supabase.from('ambassadors').delete().eq('id', id)
    setAmbassadors(prev => prev.filter(a => a.id !== id))
    setActionLoading(null)
  }

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAmb) return
    const fd = new FormData(e.currentTarget)
    const updates = {
      status: fd.get('status') as string,
      total_points: parseInt(fd.get('total_points') as string) || editingAmb.total_points,
    }
    await supabase.from('ambassadors').update(updates).eq('id', editingAmb.id)
    setAmbassadors(prev => prev.map(a => a.id === editingAmb.id ? { ...a, ...updates } : a))
    setEditingAmb(null)
  }

  const statusCounts = {
    all: ambassadors.length,
    Pending: ambassadors.filter(a => a.status === 'Pending').length,
    Approved: ambassadors.filter(a => a.status === 'Approved').length,
    Rejected: ambassadors.filter(a => a.status === 'Rejected').length,
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-bg-dark border border-border-dark rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">All ({statusCounts.all})</option>
          <option value="Pending">Pending ({statusCounts.Pending})</option>
          <option value="Approved">Approved ({statusCounts.Approved})</option>
          <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-bg-card rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-text-muted text-sm">No ambassadors found.</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(amb => (
            <Card key={amb.id} className="p-0 overflow-hidden hover:border-border-dark/60 transition-colors">
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {amb.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{amb.full_name}</span>
                    {amb.role === 'admin' && (
                      <Badge variant="default" className="text-[9px] shrink-0">ADMIN</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">{amb.email}</p>
                </div>

                {/* Status badge */}
                <Badge
                  variant={amb.status === 'Approved' ? 'success' : amb.status === 'Pending' ? 'warning' : 'error'}
                  className="hidden sm:inline-flex shrink-0"
                >
                  {amb.status}
                </Badge>

                {/* Points */}
                <span className="text-sm font-bold text-primary hidden md:block shrink-0 min-w-[3rem] text-right">
                  {amb.total_points || 0}
                  <span className="text-text-muted font-normal text-xs ml-0.5">pts</span>
                </span>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(expandedId === amb.id ? null : amb.id)}
                  className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                >
                  {expandedId === amb.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded actions panel */}
              {expandedId === amb.id && (
                <div className="border-t border-border-dark bg-bg-dark/40 px-4 py-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-text-muted">
                    <div><span className="font-semibold text-white">College:</span><br />{amb.college_name}</div>
                    <div><span className="font-semibold text-white">Location:</span><br />{[amb.city, amb.state].filter(Boolean).join(', ') || '—'}</div>
                    <div><span className="font-semibold text-white">Phone:</span><br />{amb.mobile_number || '—'}</div>
                    <div><span className="font-semibold text-white">Level:</span><br />{amb.current_level || 'Bronze'}</div>
                    <div className="sm:hidden">
                      <span className="font-semibold text-white">Status:</span><br />
                      <Badge variant={amb.status === 'Approved' ? 'success' : amb.status === 'Pending' ? 'warning' : 'error'} className="mt-0.5">{amb.status}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Joined:</span><br />
                      {new Date(amb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Quick status buttons */}
                    {amb.status !== 'Approved' && (
                      <Button size="sm" onClick={() => handleStatusChange(amb, 'Approved')} disabled={actionLoading === amb.id}
                        className="bg-green-600 hover:bg-green-700 border-none text-white text-xs h-8 px-3">
                        Approve
                      </Button>
                    )}
                    {amb.status !== 'Rejected' && (
                      <Button size="sm" onClick={() => handleStatusChange(amb, 'Rejected')} disabled={actionLoading === amb.id}
                        className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-xs h-8 px-3">
                        Reject
                      </Button>
                    )}
                    {amb.status !== 'Pending' && (
                      <Button size="sm" onClick={() => handleStatusChange(amb, 'Pending')} disabled={actionLoading === amb.id}
                        variant="ghost" className="text-xs h-8 px-3">
                        Set Pending
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleRoleToggle(amb)} disabled={actionLoading === amb.id}
                      variant="outline" className="text-xs h-8 px-3 gap-1.5">
                      {amb.role === 'admin' ? <><ShieldOff className="w-3 h-3" /> Remove Admin</> : <><Shield className="w-3 h-3" /> Make Admin</>}
                    </Button>
                    <Button size="sm" onClick={() => setEditingAmb(amb)}
                      variant="ghost" className="text-xs h-8 px-3 gap-1.5">
                      <Edit2 className="w-3 h-3" /> Edit Points
                    </Button>
                    <Button size="sm" onClick={() => handleDelete(amb.id)} disabled={actionLoading === amb.id}
                      variant="ghost" className="text-xs h-8 px-3 text-red-400 hover:bg-red-500/8 gap-1.5">
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Points modal */}
      {editingAmb && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-bg-card sm:rounded-2xl rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Edit: {editingAmb.full_name}</h3>
              <button onClick={() => setEditingAmb(null)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <Select label="Application Status" name="status" defaultValue={editingAmb.status}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Suspended">Suspended</option>
              </Select>
              <Input label="Total Points" type="number" name="total_points" defaultValue={editingAmb.total_points || 0} />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingAmb(null)}>Cancel</Button>
                <Button type="submit" size="sm">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
