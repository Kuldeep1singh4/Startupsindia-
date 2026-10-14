import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { Select, Input } from "../../components/FormControls"
import { Shield, ShieldOff, Edit2, Trash2, Search, ChevronDown, ChevronUp, X, CheckCircle2 } from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"

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
  const [locationFilter, setLocationFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingAmb, setEditingAmb] = useState<Ambassador | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (user) {
        const { data: p, error: pErr } = await supabase.from('ambassadors').select('id').eq('user_id', user.id).single()
        if (pErr) console.warn("Admin profile check note:", pErr.message)
        if (p) setAdminId(p.id)
      }
      const { data, error: ambErr } = await supabase
        .from('ambassadors')
        .select('id, full_name, email, mobile_number, college_name, city, state, status, role, total_points, current_level, created_at')
        .order('created_at', { ascending: false })
      if (ambErr) throw ambErr
      if (data) { setAmbassadors(data); setFiltered(data) }
    } catch (err: any) {
      console.error("Failed to fetch ambassadors:", err)
      setError(err.message || "Failed to load ambassador records.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Client-side filter + search (including location filter and location search)
  useEffect(() => {
    let result = ambassadors
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
    if (roleFilter !== 'all') result = result.filter(a => a.role === roleFilter)
    if (locationFilter !== 'all') {
      result = result.filter(a =>
        a.state?.toLowerCase() === locationFilter.toLowerCase() ||
        a.city?.toLowerCase() === locationFilter.toLowerCase()
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(a =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.college_name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.state?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [ambassadors, statusFilter, roleFilter, locationFilter, searchQuery])

  const handleStatusChange = async (amb: Ambassador, newStatus: string) => {
    setActionLoading(amb.id)
    setFeedbackMsg(null)
    try {
      const { error: updErr } = await supabase.from('ambassadors').update({ status: newStatus }).eq('id', amb.id)
      if (updErr) throw updErr
      setAmbassadors(prev => prev.map(a => a.id === amb.id ? { ...a, status: newStatus } : a))
      setFeedbackMsg({ type: 'success', text: `Status for ${amb.full_name} updated to ${newStatus}.` })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Status update error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to update status." })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleToggle = async (amb: Ambassador) => {
    if (!adminId) return
    const newRole = amb.role === 'admin' ? 'ambassador' : 'admin'
    setActionLoading(amb.id)
    setFeedbackMsg(null)
    try {
      const { error: roleErr } = await supabase.from('ambassadors').update({ role: newRole }).eq('id', amb.id)
      if (roleErr) throw roleErr

      await supabase.from('admin_logs').insert([{ admin_id: adminId, target_ambassador_id: amb.id, old_role: amb.role, new_role: newRole }]).select()
      setAmbassadors(prev => prev.map(a => a.id === amb.id ? { ...a, role: newRole } : a))
      setFeedbackMsg({ type: 'success', text: `${amb.full_name} is now designated as ${newRole === 'admin' ? 'Platform Administrator' : 'Ambassador'}.` })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Role toggle error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to toggle role." })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this ambassador record? This cannot be undone.')) return
    setActionLoading(id)
    setFeedbackMsg(null)
    try {
      const { error: delErr } = await supabase.from('ambassadors').delete().eq('id', id)
      if (delErr) throw delErr
      setAmbassadors(prev => prev.filter(a => a.id !== id))
      setFeedbackMsg({ type: 'success', text: "Ambassador record deleted successfully." })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Delete error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete record." })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAmb) return
    const fd = new FormData(e.currentTarget)
    const updates = {
      status: fd.get('status') as string,
      total_points: parseInt(fd.get('total_points') as string) || editingAmb.total_points,
    }
    setFeedbackMsg(null)
    try {
      const { error: updErr } = await supabase.from('ambassadors').update(updates).eq('id', editingAmb.id)
      if (updErr) throw updErr
      setAmbassadors(prev => prev.map(a => a.id === editingAmb.id ? { ...a, ...updates } : a))
      setFeedbackMsg({ type: 'success', text: `Details updated for ${editingAmb.full_name}.` })
      setEditingAmb(null)
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Edit save error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to save edits." })
    }
  }

  const statusCounts = {
    all: ambassadors.length,
    Pending: ambassadors.filter(a => a.status === 'Pending').length,
    Approved: ambassadors.filter(a => a.status === 'Approved').length,
    Rejected: ambassadors.filter(a => a.status === 'Rejected').length,
  }

  const availableLocations = Array.from(
    new Set(
      ambassadors
        .flatMap(a => [a.state, a.city])
        .filter(Boolean) as string[]
    )
  ).sort()

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || locationFilter !== 'all' || roleFilter !== 'all'

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {error && <ErrorAlert message={error} onRetry={fetchData} />}

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
            <X className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Search + Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, college, city, or state..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-bg-dark border border-border-dark rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Location Filter */}
          <Select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="text-xs"
          >
            <option value="all">📍 All Locations</option>
            {availableLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs"
          >
            <option value="all">Status: All ({statusCounts.all})</option>
            <option value="Pending">Pending ({statusCounts.Pending})</option>
            <option value="Approved">Approved ({statusCounts.Approved})</option>
            <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
          </Select>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs col-span-2 sm:col-span-1"
          >
            <option value="all">Role: All</option>
            <option value="ambassador">Ambassadors</option>
            <option value="admin">Administrators</option>
          </Select>
        </div>
      </div>

      {/* Filter status row */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span>Showing {filtered.length} of {ambassadors.length} records</span>
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setLocationFilter('all')
              setRoleFilter('all')
            }}
            className="text-primary hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

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
                    <div>
                      <span className="font-semibold text-white">Role / Level:</span><br />
                      {amb.role === 'admin' ? (
                        <span className="text-primary font-bold">Platform Administrator</span>
                      ) : (
                        amb.current_level || 'Bronze Ambassador'
                      )}
                    </div>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-sm bg-bg-card rounded-2xl shadow-2xl my-auto border border-border-dark">
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
