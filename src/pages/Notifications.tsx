import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Bell } from "lucide-react"

export const Notifications = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader title="Notifications" subtitle="Stay updated on your task approvals and rewards." />
      
      <Card className="p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-bg-dark border border-border-dark rounded-full flex items-center justify-center text-text-muted mb-4">
          <Bell className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
        <p className="text-text-muted max-w-md">You're all caught up! When admins review your tasks or you unlock new rewards, they will appear here.</p>
      </Card>
    </div>
  )
}
