import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { Logo } from "../components/Logo"
import { FileText, Edit3, Save, X, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react"

interface TermSection {
  id: string
  title: string
  content: string
}

const DEFAULT_TERMS: TermSection[] = [
  {
    id: "1",
    title: "1. Acceptance of Terms",
    content: "By applying for, participating in, or maintaining an account in the StartupsIndia Ambassador Program, you agree to be legally bound by these Terms and Conditions, our Privacy Policy, and any supplemental program guidelines communicated by the StartupsIndia administration team."
  },
  {
    id: "2",
    title: "2. Eligibility & Application",
    content: "The Program is open to active college or university students in India who are at least 18 years of age. All registration details provided during the application process must be truthful, accurate, and current. StartupsIndia reserves the right to verify student credentials and reject applications at its sole discretion."
  },
  {
    id: "3",
    title: "3. Ambassador Code of Conduct",
    content: "Ambassadors represent StartupsIndia within their educational institutions and communities. Ambassadors must act with professionalism, integrity, and respect. Any form of harassment, hate speech, misrepresentation, spamming, or actions damaging to StartupsIndia's reputation will result in immediate disqualification."
  },
  {
    id: "4",
    title: "4. Tasks, Verification & Proof Submissions",
    content: "Ambassadors earn points by completing assigned tasks and submitting verifiable proof (e.g., live links, social shares, event photos). All submissions are subject to manual or automated verification by the admin team. Submitting falsified, duplicated, or deceptive proof will result in point deduction, task rejection, or account termination."
  },
  {
    id: "5",
    title: "5. Points, Levels & Rewards",
    content: "Points and badges awarded have no monetary cash value and are non-transferable. Levels, milestone rewards, merchandise, and certificates are granted according to the current program criteria and are subject to availability. StartupsIndia reserves the right to modify point values or rewards at any time."
  },
  {
    id: "6",
    title: "6. Intellectual Property & Brand Usage",
    content: "StartupsIndia grants ambassadors a limited, revocable, non-exclusive license to use official promotional assets, badges, and logos solely for authorized campaign activities. Ambassadors shall not alter trademarks or create unauthorized merchandise without prior written consent."
  },
  {
    id: "7",
    title: "7. Confidentiality & Non-Disclosure",
    content: "Ambassadors may gain early access to upcoming features, campaigns, or strategic initiatives. Ambassadors agree to keep non-public materials strictly confidential until officially released by StartupsIndia."
  },
  {
    id: "8",
    title: "8. Termination & Revocation",
    content: "StartupsIndia reserves the right to suspend or terminate an ambassador's participation at any time for violation of these terms or inactivity. Upon termination, access to the ambassador portal and rights to claim pending rewards shall cease."
  },
  {
    id: "9",
    title: "9. Amendments & Governing Law",
    content: "These Terms may be updated periodically by StartupsIndia administration. Continued participation in the program constitutes acceptance of revised terms. These terms are governed by the laws of India, subject to the jurisdiction of the courts of New Delhi."
  }
]

const STORAGE_KEY = "startupsindia_terms_v1"
const STORAGE_DATE_KEY = "startupsindia_terms_updated_v1"

export function Terms() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [sections, setSections] = useState<TermSection[]>(DEFAULT_TERMS)
  const [lastUpdated, setLastUpdated] = useState("October 2026")
  const [isEditing, setIsEditing] = useState(false)
  const [editSections, setEditSections] = useState<TermSection[]>(DEFAULT_TERMS)
  const [editDate, setEditDate] = useState("October 2026")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const savedDate = localStorage.getItem(STORAGE_DATE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSections(parsed)
        setEditSections(parsed)
      }
      if (savedDate) {
        setLastUpdated(savedDate)
        setEditDate(savedDate)
      }
    } catch (e) {
      console.error("Failed to load saved terms", e)
    }
  }, [])

  const handleStartEdit = () => {
    setEditSections(JSON.parse(JSON.stringify(sections)))
    setEditDate(lastUpdated)
    setIsEditing(true)
    setSaveSuccess(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleResetDefault = () => {
    if (window.confirm("Reset all terms and conditions to system defaults?")) {
      setEditSections(DEFAULT_TERMS)
      setEditDate("October 2026")
    }
  }

  const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    const next = [...editSections]
    next[index] = { ...next[index], [field]: value }
    setEditSections(next)
  }

  const handleAddSection = () => {
    const newId = String(Date.now())
    setEditSections([
      ...editSections,
      {
        id: newId,
        title: `${editSections.length + 1}. New Policy Section`,
        content: "Enter policy details and guidelines here."
      }
    ])
  }

  const handleDeleteSection = (index: number) => {
    if (editSections.length <= 1) return
    const next = editSections.filter((_, i) => i !== index)
    setEditSections(next)
  }

  const handleSave = () => {
    if (!isAdmin) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editSections))
      localStorage.setItem(STORAGE_DATE_KEY, editDate)
      setSections(editSections)
      setLastUpdated(editDate)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      console.error("Failed to save terms", e)
      alert("Error saving terms: storage limit exceeded.")
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-primary/20">
      {/* Top Banner Navigation — Scrolls with main body per Phase 10 */}
      <header className="bg-bg-card border-b border-border-dark px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-text-muted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="h-4 w-px bg-border-dark hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <Logo size="sm" to="/" />
            <span className="font-semibold text-xs text-text-muted hidden sm:inline-block border-l border-border-dark pl-2.5">
              Program Terms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="border-primary/40 text-primary hover:bg-primary/10 gap-1.5 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Terms (Admin)
            </Button>
          )}

          {isAdmin && isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-text-muted hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetDefault}
                className="text-xs gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="text-xs gap-1 shadow-lg shadow-primary/25"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Terms and Conditions have been successfully updated and saved!</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs border-primary/30 text-primary">
            Official Program Agreement
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Terms & Conditions
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto">
            Please read these terms carefully before participating as a StartupsIndia Ambassador.
          </p>
          <div className="mt-4 text-xs text-text-muted">
            {isEditing ? (
              <div className="inline-flex items-center gap-2 bg-bg-card px-3 py-1.5 rounded-lg border border-border-dark">
                <span>Effective Date / Last Updated:</span>
                <input
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-bg-dark border border-border-dark rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            ) : (
              <span>Last Updated: {lastUpdated}</span>
            )}
          </div>
        </div>

        {/* Admin notice indicator */}
        {isAdmin && (
          <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs text-primary">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 shrink-0" />
              <span>You are viewing this as an <strong>Administrator</strong>. You have permissions to update these terms.</span>
            </div>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="underline hover:text-white font-semibold transition-colors"
              >
                Click to Edit
              </button>
            )}
          </div>
        )}

        {/* Content Section */}
        {isEditing ? (
          <div className="space-y-6">
            {editSections.map((sec, idx) => (
              <Card key={sec.id || idx} className="p-5 border-border-dark bg-bg-card/70 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                    className="flex-1 bg-bg-dark border border-border-dark rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-primary"
                    placeholder="Section Title"
                  />
                  {editSections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(idx)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <textarea
                  value={sec.content}
                  onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                  rows={4}
                  className="w-full bg-bg-dark border border-border-dark rounded-lg p-3 text-xs sm:text-sm text-text-muted focus:text-white focus:outline-none focus:border-primary resize-y leading-relaxed"
                  placeholder="Section text and policy statements..."
                />
              </Card>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSection}
                className="border-dashed border-border-dark hover:border-primary text-xs"
              >
                + Add Another Section
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} className="text-xs">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((sec) => (
              <Card key={sec.id} className="p-5 sm:p-6 border-border-dark bg-bg-card/50 hover:bg-bg-card/70 transition-colors">
                <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {sec.title}
                </h2>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-3.5 border-l border-white/5">
                  {sec.content}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-text-muted border-t border-border-dark pt-8">
          <p>© {new Date().getFullYear()} StartupsIndia Ambassador Program. All rights reserved.</p>
          <p className="mt-1">For questions regarding these terms, contact <a href="mailto:support@startupsindia.org" className="text-primary hover:underline">support@startupsindia.org</a></p>
        </div>
      </main>
    </div>
  )
}
