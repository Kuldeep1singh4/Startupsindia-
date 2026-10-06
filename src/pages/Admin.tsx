import { useState, useEffect } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Button } from "../components/Button"
import { supabase } from "../lib/supabase"
import { AdminDashboard } from "./admin/AdminDashboard"
import { AmbassadorMgmt } from "./admin/AmbassadorMgmt"
import { TaskMgmt } from "./admin/TaskMgmt"
import { TaskVerification } from "./admin/TaskVerification"
import { LevelMgmt } from "./admin/LevelMgmt"
import { RewardMgmt } from "./admin/RewardMgmt"

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('ambassadors').select('role').eq('user_id', user.id).single()
        if (data && data.role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      }
      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) return <div className="text-white text-center py-12">Checking admin access...</div>
  if (!isAdmin) return <div className="text-white text-center py-12">Access Denied: Admin Only.</div>

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'verification', label: 'Verifications' },
    { id: 'ambassadors', label: 'Ambassadors' },
    { id: 'tasks', label: 'Task Mgmt' },
    { id: 'levels', label: 'Levels' },
    { id: 'rewards', label: 'Rewards' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader title="Admin Portal" subtitle="Manage the StartupsIndia Ambassador Platform." />
      
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-border-dark">
        {tabs.map(tab => (
          <Button 
            key={tab.id} 
            variant={activeTab === tab.id ? 'primary' : 'ghost'} 
            onClick={() => setActiveTab(tab.id)}
            size="sm"
            className="whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'verification' && <TaskVerification />}
        {activeTab === 'ambassadors' && <AmbassadorMgmt />}
        {activeTab === 'tasks' && <TaskMgmt />}
        {activeTab === 'levels' && <LevelMgmt />}
        {activeTab === 'rewards' && <RewardMgmt />}
      </div>
    </div>
  )
}
