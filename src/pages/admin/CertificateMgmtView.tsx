import { useEffect, useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { Input, Textarea, Select } from "../../components/FormControls"
import { Award, Plus, Edit2, Trash2, X, CheckCircle2, Upload, ShieldCheck } from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"

export type CertificateItem = {
  id: string
  name: string
  designation: string
  min_points: number
  description?: string
  certificate_image?: string | null
  badge_image?: string | null
  is_active: boolean
}

const STORAGE_KEY = "startupsindia_certificates_v1"

const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-bronze",
    name: "Bronze Certificate",
    designation: "Campus Ambassador",
    min_points: 0,
    description: "Official accreditation awarded for joining the StartupsIndia Ambassador program.",
    certificate_image: null,
    is_active: true,
  },
  {
    id: "cert-silver",
    name: "Silver Certificate",
    designation: "Sr. Campus Ambassador",
    min_points: 2000,
    description: "Granted for exceptional campus community leadership and initiative execution.",
    certificate_image: null,
    is_active: true,
  },
  {
    id: "cert-gold",
    name: "Gold Certificate",
    designation: "City Ambassador",
    min_points: 5000,
    description: "Awarded to top performers representing StartupsIndia at the municipal level.",
    certificate_image: null,
    is_active: true,
  },
  {
    id: "cert-platinum",
    name: "Platinum Certificate",
    designation: "District Ambassador",
    min_points: 10000,
    description: "High distinction certificate acknowledging district-level entrepreneurship drive.",
    certificate_image: null,
    is_active: true,
  },
  {
    id: "cert-diamond",
    name: "Diamond Certificate",
    designation: "State Ambassador",
    min_points: 20000,
    description: "Prestigious state-level award representing premier college ambassadors.",
    certificate_image: null,
    is_active: true,
  },
  {
    id: "cert-national",
    name: "National Certificate",
    designation: "National Ambassador",
    min_points: 50000,
    description: "Highest national honors for nationwide student leadership and startup ecosystem impact.",
    certificate_image: null,
    is_active: true,
  },
]

const BLANK_CERTIFICATE: Omit<CertificateItem, "id"> = {
  name: "",
  designation: "",
  min_points: 0,
  description: "",
  certificate_image: null,
  badge_image: null,
  is_active: true,
}

export function CertificateMgmtView() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCert, setEditingCert] = useState<Partial<CertificateItem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Try local storage cache
      let loadedCerts = INITIAL_CERTIFICATES
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedCerts = parsed
          }
        } catch (e) {
          console.warn("Could not parse certificates cache", e)
        }
      }

      // 2. Try fetching from levels_config in Supabase to sync points and levels
      const { data: lvls, error: lvlErr } = await supabase
        .from("levels_config")
        .select("*")
        .order("min_points", { ascending: true })

      if (!lvlErr && lvls && lvls.length > 0) {
        // Merge Supabase level updates into certificates
        const merged = lvls.map((lvl) => {
          const matched = loadedCerts.find(
            (c) => c.name.toLowerCase().includes(lvl.name?.toLowerCase()) || c.id === lvl.id
          )
          return {
            id: lvl.id || matched?.id || `cert-${lvl.name}`,
            name: `${lvl.name.charAt(0).toUpperCase() + lvl.name.slice(1)} Certificate`,
            designation: lvl.designation || matched?.designation || "Ambassador",
            min_points: lvl.min_points ?? 0,
            description: matched?.description || `Awarded for achieving the rank of ${lvl.designation}.`,
            certificate_image: lvl.certificate || matched?.certificate_image || null,
            badge_image: lvl.badge || matched?.badge_image || null,
            is_active: matched ? matched.is_active : true,
          }
        })
        loadedCerts = merged
      }

      setCertificates(loadedCerts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedCerts))
    } catch (err: any) {
      console.error("Failed to fetch certificates:", err)
      setError(err.message || "Failed to load certificates configuration.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const openNew = () => {
    setIsNew(true)
    setEditingCert({ ...BLANK_CERTIFICATE })
    setPreviewImage(null)
  }

  const openEdit = (cert: CertificateItem) => {
    setIsNew(false)
    setEditingCert({ ...cert })
    setPreviewImage(cert.certificate_image || null)
  }

  const closeForm = () => {
    setEditingCert(null)
    setIsNew(false)
    setPreviewImage(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
      setUploadingImage(false)
    }
    reader.onerror = () => {
      setFeedbackMsg({ type: "error", text: "Failed to read certificate image file." })
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCert) return
    const fd = new FormData(e.currentTarget)
    const certImage = previewImage || (fd.get("certificate_url") as string) || null

    const payload: CertificateItem = {
      id: editingCert.id || `cert-${Date.now()}`,
      name: fd.get("name") as string,
      designation: fd.get("designation") as string,
      min_points: parseInt(fd.get("min_points") as string) || 0,
      description: fd.get("description") as string,
      certificate_image: certImage,
      is_active: fd.get("is_active") === "true",
    }

    setFeedbackMsg(null)
    try {
      let updated: CertificateItem[]
      if (isNew) {
        updated = [...certificates, payload]
      } else {
        updated = certificates.map((c) => (c.id === payload.id ? payload : c))
      }

      setCertificates(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      // Also try syncing to levels_config if matched
      try {
        if (!isNew && editingCert.id) {
          await supabase
            .from("levels_config")
            .update({
              name: payload.name.replace(" Certificate", ""),
              designation: payload.designation,
              min_points: payload.min_points,
              certificate: certImage,
            })
            .eq("id", editingCert.id)
        }
      } catch (dbErr) {
        console.warn("Database sync note:", dbErr)
      }

      setFeedbackMsg({
        type: "success",
        text: `Certificate "${payload.name}" saved successfully.`,
      })
      setTimeout(() => setFeedbackMsg(null), 3500)
      closeForm()
    } catch (err: any) {
      console.error("Save certificate error:", err)
      setFeedbackMsg({ type: "error", text: err.message || "Failed to save certificate." })
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate template?")) return
    const updated = certificates.filter((c) => c.id !== id)
    setCertificates(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setFeedbackMsg({ type: "success", text: "Certificate template removed." })
    setTimeout(() => setFeedbackMsg(null), 3500)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {error && <ErrorAlert message={error} onRetry={fetchCertificates} />}

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Certificate Management
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Configure certificate templates, point thresholds, and accreditation artwork.
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Certificate
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-bg-card rounded-2xl border border-border-dark" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <Card className="py-16 text-center">
          <Award className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-20" />
          <p className="text-text-muted text-sm">No certificate templates configured yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="p-0 flex flex-col justify-between hover:border-primary/40 transition-all relative overflow-hidden group shadow-lg"
            >
              {/* Certificate Template Header */}
              <div className="relative w-full h-44 bg-gradient-to-br from-[#1a1c23] to-bg-dark border-b border-border-dark flex items-center justify-center p-3 overflow-hidden">
                {cert.certificate_image ? (
                  <img
                    src={cert.certificate_image}
                    alt={cert.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg border border-primary/20 bg-bg-card/70 p-3 flex flex-col justify-between text-center">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-text-muted">
                      <span>StartupsIndia</span>
                      <span className="text-primary font-bold">Accredited</span>
                    </div>
                    <div className="my-auto">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-1">
                        <Award className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-xs text-white leading-tight">{cert.name}</h5>
                      <p className="text-[10px] text-text-muted">{cert.designation}</p>
                    </div>
                    <div className="text-[9px] text-text-muted border-t border-border-dark/40 pt-1">
                      Min {cert.min_points.toLocaleString()} Points
                    </div>
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <span className="bg-primary/90 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                    {cert.min_points.toLocaleString()} pts
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 bg-bg-dark/70 backdrop-blur-md p-1 rounded-lg border border-border-dark opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cert)}
                    className="p-1.5 text-text-muted hover:text-white rounded hover:bg-white/10 transition-colors"
                    title="Edit Certificate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1.5 text-text-muted hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                    title="Delete Certificate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-white text-sm line-clamp-1">{cert.name}</h4>
                    <Badge variant={cert.is_active ? "success" : "default"} className="text-[10px] py-0 px-2">
                      {cert.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-primary mb-1">{cert.designation}</p>
                  <p className="text-text-muted text-xs leading-relaxed line-clamp-2">
                    {cert.description || "Awarded upon reaching the required point milestone."}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-dark flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Official Seal
                  </span>
                  <span>Requires Rank: <strong className="text-white">{cert.designation}</strong></span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {editingCert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-bg-card rounded-2xl shadow-2xl my-auto max-h-[90dvh] overflow-y-auto border border-border-dark p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isNew ? "Create Certificate Template" : "Edit Certificate Template"}
                </h3>
              </div>
              <button onClick={closeForm} className="text-text-muted hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Template Artwork Upload */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Certificate Template Artwork / Preview Image
                </label>

                {previewImage ? (
                  <div className="relative border border-border-dark rounded-xl overflow-hidden mb-3 bg-bg-dark h-40 group">
                    <img src={previewImage} alt="Certificate preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-xs text-white">
                      Custom Artwork Attached
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-dark hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-bg-dark/50 mb-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-white mb-0.5">
                      {uploadingImage ? "Reading image..." : "Upload Certificate Artwork"}
                    </p>
                    <p className="text-[11px] text-text-muted">PNG, JPG, SVG or WEBP (Max 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">or URL:</span>
                  <input
                    type="url"
                    name="certificate_url"
                    value={previewImage || ""}
                    onChange={(e) => setPreviewImage(e.target.value)}
                    placeholder="https://example.com/certificate.png"
                    className="flex-1 bg-bg-dark border border-border-dark rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted/50 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <Input
                label="Certificate Title"
                name="name"
                required
                defaultValue={editingCert.name}
                placeholder="e.g. Gold Certificate"
              />

              <Input
                label="Rank / Designation"
                name="designation"
                required
                defaultValue={editingCert.designation}
                placeholder="e.g. City Ambassador"
              />

              <Input
                label="Points Required to Unlock"
                name="min_points"
                type="number"
                required
                min={0}
                defaultValue={editingCert.min_points ?? 0}
              />

              <Textarea
                label="Description & Award Criteria"
                name="description"
                rows={2}
                defaultValue={editingCert.description}
                placeholder="Accreditation details displayed on ambassador dashboard..."
              />

              <Select
                label="Status"
                name="is_active"
                defaultValue={editingCert.is_active ? "true" : "false"}
              >
                <option value="true">Active (Visible to Ambassadors)</option>
                <option value="false">Archived (Hidden)</option>
              </Select>

              <div className="flex gap-2 justify-end pt-3 border-t border-border-dark">
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isNew ? "Create Certificate" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
