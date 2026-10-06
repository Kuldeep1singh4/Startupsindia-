import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"

export const Dashboard = () => (
  <div>
    <SectionHeader title="Dashboard" subtitle="Welcome back, complete tasks and earn points." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <p className="text-text-muted text-sm mb-1">Current Level</p>
        <h3 className="text-xl font-bold flex items-center gap-2">
          🥈 Silver <Badge variant="success">Active</Badge>
        </h3>
      </Card>
      <Card>
        <p className="text-text-muted text-sm mb-1">Total Points</p>
        <h3 className="text-2xl font-bold text-primary">1,250</h3>
      </Card>
      <Card>
        <p className="text-text-muted text-sm mb-1">Tasks Completed</p>
        <h3 className="text-2xl font-bold">12</h3>
      </Card>
    </div>
  </div>
)

export const Tasks = () => (
  <div>
    <SectionHeader title="My Tasks" subtitle="Complete assigned tasks to earn points." />
    <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold">Share Campaign</h3>
          <Badge variant="warning">In Progress</Badge>
        </div>
        <p className="text-text-muted text-sm">Share the official campaign on Instagram.</p>
      </div>
      <Button>Submit Proof</Button>
    </Card>
  </div>
)

export const Leaderboard = () => (
  <div>
    <SectionHeader title="Leaderboard" subtitle="See how you rank across India." />
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-text-muted">#1</span>
        <div>
          <h4 className="font-bold">Rahul Sharma</h4>
          <p className="text-sm text-text-muted">ABC College</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">4,500</p>
        <p className="text-xs text-text-muted">Points</p>
      </div>
    </Card>
  </div>
)

export const Rewards = () => (
  <div>
    <SectionHeader title="Rewards" subtitle="Unlock exclusive benefits as you level up." />
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">StartupsIndia Kit</h3>
        <Badge variant="success">Unlocked</Badge>
      </div>
      <Button variant="outline" className="w-full">Claim Reward</Button>
    </Card>
  </div>
)

export const Profile = () => (
  <div>
    <SectionHeader title="My Profile" subtitle="Manage your ambassador details." />
    <Card>
      <h3 className="font-bold mb-4">Personal Information</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-muted">Full Name</p>
          <p className="font-medium">John Doe</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">Email</p>
          <p className="font-medium">john@example.com</p>
        </div>
      </div>
      <Button variant="secondary" className="mt-6">Edit Profile</Button>
    </Card>
  </div>
)

export const Certificates = () => (
  <div>
    <SectionHeader title="Certificates" subtitle="View and download your earned certificates." />
    <Card className="text-center py-12">
      <p className="text-text-muted mb-4">You haven't earned any certificates yet.</p>
      <Button variant="outline">View Requirements</Button>
    </Card>
  </div>
)

export const Notifications = () => (
  <div>
    <SectionHeader title="Notifications" subtitle="Stay updated with the latest alerts." />
    <Card>
      <p className="text-text-muted">No new notifications.</p>
    </Card>
  </div>
)

export const Admin = () => (
  <div>
    <SectionHeader title="Admin Panel" subtitle="Manage ambassadors, tasks, and rewards." />
    <Card>
      <p className="text-text-muted">Admin functionalities will be built here.</p>
    </Card>
  </div>
)

export const Landing = () => (
  <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-3xl font-bold text-white mb-6">S</div>
    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Where Founders Transform</h1>
    <p className="text-text-muted text-lg md:text-xl max-w-2xl mb-8">Passion into scalable businesses.</p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button size="lg">Start Your Journey</Button>
      <Button variant="outline" size="lg">Explore Programs</Button>
    </div>
  </div>
)

export const Registration = () => (
  <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Become an Ambassador</h2>
      <Button className="w-full mb-4">Submit Application</Button>
      <Button variant="ghost" className="w-full text-sm">Back to Home</Button>
    </Card>
  </div>
)

export const Login = () => (
  <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
      <Button className="w-full mb-4">Login to Dashboard</Button>
      <Button variant="ghost" className="w-full text-sm">Don't have an account?</Button>
    </Card>
  </div>
)
