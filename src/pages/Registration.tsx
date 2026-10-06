import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, ChevronRight } from "lucide-react"

// India state → district → city data
const INDIA_LOCATIONS: Record<string, Record<string, string[]>> = {
  "Andhra Pradesh": {
    "Visakhapatnam": ["Vizag City", "Bheemunipatnam", "Anakapalle"],
    "Vijayawada": ["Vijayawada", "Machilipatnam", "Gudivada"],
    "Guntur": ["Guntur", "Tenali", "Narasaraopet"],
    "Tirupati": ["Tirupati", "Chittoor", "Madanapalle"],
    "Kurnool": ["Kurnool", "Nandyal", "Adoni"],
    "Kakinada": ["Kakinada", "Rajahmundry", "Amalapuram"],
    "Nellore": ["Nellore", "Kavali", "Gudur"],
  },
  "Assam": {
    "Kamrup Metropolitan": ["Guwahati", "Jalukbari", "Maligaon"],
    "Dibrugarh": ["Dibrugarh", "Naharkatia", "Moran"],
    "Jorhat": ["Jorhat", "Mariani", "Titabor"],
    "Silchar": ["Silchar", "Sonai", "Jiribam"],
  },
  "Bihar": {
    "Patna": ["Patna City", "Danapur", "Phulwari Sharif"],
    "Gaya": ["Gaya", "Bodh Gaya", "Sherghati"],
    "Muzaffarpur": ["Muzaffarpur", "Kanti", "Motipur"],
    "Bhagalpur": ["Bhagalpur", "Kahalgaon", "Sultanganj"],
    "Darbhanga": ["Darbhanga", "Benipur", "Jale"],
  },
  "Chhattisgarh": {
    "Raipur": ["Raipur", "Arang", "Tilda"],
    "Bilaspur": ["Bilaspur", "Mungeli", "Korba"],
    "Durg": ["Durg", "Bhilai", "Rajnandgaon"],
  },
  "Delhi": {
    "Central Delhi": ["Connaught Place", "Chandni Chowk", "Paharganj"],
    "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Lajpat Nagar"],
    "North Delhi": ["Pitampura", "Rohini", "Shalimar Bagh"],
    "East Delhi": ["Laxmi Nagar", "Preet Vihar", "Shahdara"],
    "West Delhi": ["Janakpuri", "Rajouri Garden", "Tilak Nagar"],
    "New Delhi": ["Vasant Kunj", "Vasant Vihar", "R K Puram"],
  },
  "Goa": {
    "North Goa": ["Panaji", "Mapusa", "Calangute", "Porvorim"],
    "South Goa": ["Margao", "Vasco da Gama", "Ponda"],
  },
  "Gujarat": {
    "Ahmedabad": ["Ahmedabad", "Gandhinagar", "Naroda"],
    "Surat": ["Surat", "Udhna", "Katargam"],
    "Vadodara": ["Vadodara", "Karjan", "Waghodia"],
    "Rajkot": ["Rajkot", "Gondal", "Jetpur"],
    "Bhavnagar": ["Bhavnagar", "Sihor", "Palitana"],
    "Jamnagar": ["Jamnagar", "Dwarka", "Khambhalia"],
  },
  "Haryana": {
    "Gurugram": ["Gurugram", "Pataudi", "Sohna"],
    "Faridabad": ["Faridabad", "Ballabhgarh", "Palwal"],
    "Ambala": ["Ambala", "Ambala Cantonment", "Naraingarh"],
    "Hisar": ["Hisar", "Hansi", "Fatehabad"],
    "Rohtak": ["Rohtak", "Jhajjar", "Bahadurgarh"],
    "Panipat": ["Panipat", "Samalkha", "Israna"],
    "Karnal": ["Karnal", "Assandh", "Gharaunda"],
  },
  "Himachal Pradesh": {
    "Shimla": ["Shimla", "Rampur", "Solan"],
    "Kangra": ["Dharamshala", "Palampur", "Kangra"],
    "Mandi": ["Mandi", "Sundernagar", "Bilaspur"],
    "Kullu": ["Kullu", "Manali", "Banjar"],
  },
  "Jharkhand": {
    "Ranchi": ["Ranchi", "Hatia", "Namkum"],
    "Dhanbad": ["Dhanbad", "Jharia", "Sindri"],
    "Jamshedpur": ["Jamshedpur", "Jugsalai", "Mango"],
    "Bokaro": ["Bokaro Steel City", "Chas", "Bermo"],
  },
  "Karnataka": {
    "Bengaluru Urban": ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout", "Marathahalli"],
    "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Nelamangala"],
    "Mysuru": ["Mysuru City", "Nanjangud", "Hunsur"],
    "Hubli-Dharwad": ["Hubli", "Dharwad", "Kundgol"],
    "Belagavi": ["Belagavi", "Gokak", "Bailhongal"],
    "Mangaluru": ["Mangaluru", "Udupi", "Bantwal"],
    "Tumakuru": ["Tumakuru", "Tiptur", "Gubbi"],
    "Shivamogga": ["Shivamogga", "Bhadravati", "Sagar"],
    "Ballari": ["Ballari", "Hospet", "Sandur"],
    "Hassan": ["Hassan", "Arsikere", "Sakleshpur"],
  },
  "Kerala": {
    "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad"],
    "Ernakulam": ["Kochi", "Aluva", "Perumbavoor", "Angamaly"],
    "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy"],
    "Thrissur": ["Thrissur", "Chalakudy", "Irinjalakuda"],
    "Malappuram": ["Malappuram", "Tirur", "Perinthalmanna"],
    "Palakkad": ["Palakkad", "Ottappalam", "Shoranur"],
    "Kollam": ["Kollam", "Karunagappally", "Punalur"],
    "Kannur": ["Kannur", "Thalassery", "Payyanur"],
  },
  "Madhya Pradesh": {
    "Bhopal": ["Bhopal", "Berasia", "Hoshangabad"],
    "Indore": ["Indore", "Mhow", "Pithampur"],
    "Gwalior": ["Gwalior", "Morena", "Bhind"],
    "Jabalpur": ["Jabalpur", "Katni", "Sihora"],
    "Ujjain": ["Ujjain", "Maksi", "Nagda"],
    "Sagar": ["Sagar", "Rahatgarh", "Khurai"],
    "Rewa": ["Rewa", "Satna", "Sidhi"],
  },
  "Maharashtra": {
    "Mumbai City": ["Colaba", "Fort", "Byculla", "Dadar", "Matunga"],
    "Mumbai Suburban": ["Andheri", "Bandra", "Borivali", "Malad", "Kandivali", "Goregaon"],
    "Pune": ["Shivajinagar", "Kothrud", "Viman Nagar", "Hinjewadi", "Wakad", "Baner"],
    "Thane": ["Thane", "Navi Mumbai", "Kalyan", "Dombivli", "Ulhasnagar"],
    "Nagpur": ["Nagpur", "Wardha", "Yavatmal"],
    "Nashik": ["Nashik", "Malegaon", "Igatpuri"],
    "Aurangabad": ["Aurangabad", "Jalna", "Parbhani"],
    "Kolhapur": ["Kolhapur", "Ichalkaranji", "Sangli"],
    "Solapur": ["Solapur", "Barshi", "Pandharpur"],
    "Amravati": ["Amravati", "Akola", "Buldhana"],
  },
  "Manipur": {
    "Imphal West": ["Imphal", "Lamphel", "Khurai"],
    "Imphal East": ["Porompat", "Heingang", "Sawombung"],
  },
  "Meghalaya": {
    "East Khasi Hills": ["Shillong", "Cherrapunji", "Mawlai"],
    "West Garo Hills": ["Tura", "Dalu", "Resubelpara"],
  },
  "Odisha": {
    "Khordha": ["Bhubaneswar", "Khordha", "Jatni"],
    "Cuttack": ["Cuttack", "Choudwar", "Jagatsinghpur"],
    "Berhampur": ["Berhampur", "Bhanjanagar", "Aska"],
    "Rourkela": ["Rourkela", "Sundargarh", "Jharsuguda"],
    "Sambalpur": ["Sambalpur", "Burla", "Deogarh"],
  },
  "Punjab": {
    "Ludhiana": ["Ludhiana", "Khanna", "Sahnewal"],
    "Amritsar": ["Amritsar", "Batala", "Tarn Taran"],
    "Jalandhar": ["Jalandhar", "Phagwara", "Kapurthala"],
    "Patiala": ["Patiala", "Rajpura", "Nabha"],
    "Mohali": ["Mohali", "Zirakpur", "Kharar"],
    "Bathinda": ["Bathinda", "Rampura Phul", "Mansa"],
  },
  "Rajasthan": {
    "Jaipur": ["Jaipur", "Sanganer", "Chomu"],
    "Jodhpur": ["Jodhpur", "Phalodi", "Barmer"],
    "Udaipur": ["Udaipur", "Rajsamand", "Nathdwara"],
    "Kota": ["Kota", "Baran", "Jhalawar"],
    "Ajmer": ["Ajmer", "Pushkar", "Beawar"],
    "Bikaner": ["Bikaner", "Nokha", "Lunkaransar"],
    "Alwar": ["Alwar", "Bhiwadi", "Tijara"],
    "Sikar": ["Sikar", "Fatehpur Shekhawati", "Laxmangarh"],
  },
  "Tamil Nadu": {
    "Chennai": ["Anna Nagar", "T. Nagar", "Adyar", "Velachery", "Tambaram", "Perambur"],
    "Coimbatore": ["Coimbatore", "Tirupur", "Pollachi"],
    "Madurai": ["Madurai", "Dindigul", "Ramanathapuram"],
    "Tiruchirappalli": ["Trichy", "Karur", "Pudukkottai"],
    "Salem": ["Salem", "Namakkal", "Erode"],
    "Vellore": ["Vellore", "Ranipet", "Arakkonam"],
    "Tirunelveli": ["Tirunelveli", "Thoothukudi", "Nagercoil"],
    "Thanjavur": ["Thanjavur", "Kumbakonam", "Ariyalur"],
  },
  "Telangana": {
    "Hyderabad": ["Hyderabad", "Secunderabad", "Kukatpally", "Madhapur", "HITEC City"],
    "Rangareddy": ["LB Nagar", "Uppal", "Alwal", "Medchal"],
    "Warangal": ["Warangal", "Hanamkonda", "Kazipet"],
    "Karimnagar": ["Karimnagar", "Ramagundam", "Peddapalli"],
    "Nizamabad": ["Nizamabad", "Bodhan", "Kamareddy"],
    "Khammam": ["Khammam", "Kothagudem", "Bhadrachalam"],
  },
  "Uttar Pradesh": {
    "Lucknow": ["Lucknow", "Chinhat", "Bakshi Ka Talab"],
    "Agra": ["Agra", "Firozabad", "Mathura"],
    "Kanpur": ["Kanpur", "Unnao", "Fatehpur"],
    "Varanasi": ["Varanasi", "Jaunpur", "Ghazipur"],
    "Allahabad": ["Prayagraj", "Naini", "Phulpur"],
    "Ghaziabad": ["Ghaziabad", "Noida", "Greater Noida"],
    "Meerut": ["Meerut", "Hapur", "Modinagar"],
    "Bareilly": ["Bareilly", "Badaun", "Pilibhit"],
    "Gorakhpur": ["Gorakhpur", "Deoria", "Maharajganj"],
    "Moradabad": ["Moradabad", "Sambhal", "Amroha"],
  },
  "Uttarakhand": {
    "Dehradun": ["Dehradun", "Rishikesh", "Haridwar"],
    "Nainital": ["Nainital", "Haldwani", "Ramnagar"],
    "Pauri Garhwal": ["Pauri", "Kotdwar", "Srinagar"],
  },
  "West Bengal": {
    "Kolkata": ["Kolkata", "Howrah", "Salt Lake City", "New Town"],
    "North 24 Parganas": ["Barasat", "Dum Dum", "Bongaon"],
    "South 24 Parganas": ["Diamond Harbour", "Baruipur", "Kultali"],
    "Murshidabad": ["Berhampore", "Jangipur", "Lalbagh"],
    "Barddhaman": ["Durgapur", "Asansol", "Burdwan"],
    "Jalpaiguri": ["Jalpaiguri", "Siliguri", "Darjeeling"],
    "Hooghly": ["Chinsurah", "Serampore", "Chandannagar"],
  },
}

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const Registration = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "", mobile_number: "",
    college_name: "", course: "", branch: "", current_year: "",
    state: "", district: "", city: "",
    linkedin_url: "", instagram_url: "", youtube_url: "",
    motivation: "", areas_of_interest: "", agreement: false,
    referred_by: ""
  })

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) setFormData(prev => ({ ...prev, referred_by: refCode }))
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', city: '' }))
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, city: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError

      const { error: dbError } = await supabase.from('ambassadors').insert([{
        user_id: authData.user?.id,
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        college_name: formData.college_name,
        course: formData.course,
        branch: formData.branch,
        current_year: formData.current_year,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        youtube_url: formData.youtube_url || null,
        motivation: formData.motivation,
        areas_of_interest: formData.areas_of_interest,
        status: 'Pending',
        referral_code: generateReferralCode(),
        referred_by: formData.referred_by || null,
      }])

      if (dbError) throw dbError
      navigate('/status')
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const states = Object.keys(INDIA_LOCATIONS).sort()
  const districts = formData.state ? Object.keys(INDIA_LOCATIONS[formData.state] || {}).sort() : []
  const cities = (formData.state && formData.district)
    ? (INDIA_LOCATIONS[formData.state]?.[formData.district] || []).sort()
    : []

  const inputClass = "w-full bg-bg-dark border border-border-dark rounded-lg p-3 text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all hover:border-border-dark/80 disabled:opacity-50 disabled:cursor-not-allowed"
  const labelClass = "block text-sm font-medium text-text-muted mb-1.5"

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Startups<span className="text-primary">India</span>
          </h1>
          <p className="text-text-muted mt-2">Ambassador Program Application</p>
        </div>

        <Card className="shadow-2xl">
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Details */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-border-dark flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">1</span>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input required name="full_name" placeholder="e.g. Rahul Sharma" onChange={handleChange} value={formData.full_name} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input required type="email" name="email" placeholder="you@example.com" onChange={handleChange} value={formData.email} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <input required name="mobile_number" placeholder="+91 98765 43210" onChange={handleChange} value={formData.mobile_number} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      onChange={handleChange}
                      value={formData.password}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: College Details */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-border-dark flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">2</span>
                College Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>College Name *</label>
                  <input required name="college_name" placeholder="Full college name" onChange={handleChange} value={formData.college_name} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Course *</label>
                  <input required name="course" placeholder="e.g. B.Tech, BCA, MBA" onChange={handleChange} value={formData.course} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Branch *</label>
                  <input required name="branch" placeholder="e.g. Computer Science" onChange={handleChange} value={formData.branch} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Current Year *</label>
                  <select required name="current_year" onChange={handleChange} value={formData.current_year} className={inputClass}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>

                {/* Cascading Location Dropdowns */}
                <div>
                  <label className={labelClass}>State *</label>
                  <select required name="state" onChange={handleChange} value={formData.state} className={inputClass}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>District *</label>
                  <select required name="district" onChange={handleChange} value={formData.district} disabled={!formData.state} className={inputClass}>
                    <option value="">{formData.state ? "Select District" : "Select State first"}</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>City / Area *</label>
                  <select required name="city" onChange={handleChange} value={formData.city} disabled={!formData.district} className={inputClass}>
                    <option value="">{formData.district ? "Select City" : "Select District first"}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Social Details */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-border-dark flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">3</span>
                Social Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input type="url" name="linkedin_url" placeholder="linkedin.com/in/yourprofile" onChange={handleChange} value={formData.linkedin_url} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input type="url" name="instagram_url" placeholder="instagram.com/yourhandle" onChange={handleChange} value={formData.instagram_url} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>YouTube URL <span className="text-text-muted font-normal">(Optional)</span></label>
                  <input type="url" name="youtube_url" placeholder="youtube.com/c/yourchannel" onChange={handleChange} value={formData.youtube_url} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Section 4: Additional Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-border-dark flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">4</span>
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Why do you want to become an Ambassador? *</label>
                  <textarea
                    required
                    name="motivation"
                    placeholder="Tell us about your passion for startups and entrepreneurship..."
                    onChange={handleChange}
                    value={formData.motivation}
                    rows={4}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Areas of Interest *</label>
                  <input
                    required
                    name="areas_of_interest"
                    placeholder="e.g. Technology, Marketing, Social Impact"
                    onChange={handleChange}
                    value={formData.areas_of_interest}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border-dark hover:border-primary/30 transition-colors bg-bg-dark/50">
              <input
                required
                type="checkbox"
                name="agreement"
                onChange={handleChange}
                checked={formData.agreement}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-text-muted text-sm leading-relaxed">
                I agree to the{' '}
                <span className="text-primary">StartupsIndia Ambassador Program</span>{' '}
                terms and conditions. I confirm that all information provided is accurate.
              </span>
            </label>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Submitting Application..." : (
                  <span className="flex items-center gap-2">
                    Submit Application
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-center text-sm text-text-muted hover:text-white transition-colors py-2"
              >
                Already have an account? <span className="text-primary font-medium">Login</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
