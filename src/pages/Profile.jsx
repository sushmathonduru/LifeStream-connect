import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update } from "firebase/database"
import { Phone, Mail, MapPin, Droplets, LogOut, Edit, Check, X } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null)
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "", phone: "", city: "", bloodGroup: ""
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return
    const userRef = ref(db, "users/" + currentUser.uid)
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setUserProfile(data)
        setAvailable(data.available || false)
        setEditForm({
          name: data.name || "",
          phone: data.phone || "",
          city: data.city || "",
          bloodGroup: data.bloodGroup || ""
        })
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [currentUser])

  async function handleSaveProfile() {
    if (!editForm.name || !editForm.phone || !editForm.city || !editForm.bloodGroup) {
      return
    }
    try {
      setSaving(true)
      await update(ref(db, "users/" + currentUser.uid), {
        name: editForm.name,
        phone: editForm.phone,
        city: editForm.city,
        bloodGroup: editForm.bloodGroup,
        updatedAt: Date.now()
      })
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.log("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable() {
    const newValue = !available
    setAvailable(newValue)
    await update(ref(db, "users/" + currentUser.uid), {
      available: newValue
    })
  }

  async function becomeDonor() {
    await update(ref(db, "users/" + currentUser.uid), {
      isDonor: true,
      available: true
    })
    setSuccess("You are now registered as a donor!")
    setTimeout(() => setSuccess(""), 3000)
  }

  async function handleLogout() {
    try {
      await logout()
      navigate("/login")
    } catch (err) {
      console.log("Logout error:", err)
    }
  }

  function getInitials() {
    if (userProfile && userProfile.name) {
      return userProfile.name.charAt(0).toUpperCase()
    }
    if (currentUser && currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Avatar & Rank Header */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 bg-white text-red-600 font-black text-3xl rounded-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-white/40">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {userProfile ? userProfile.name : currentUser.email.split("@")[0]}
              </h2>
              {userProfile && userProfile.bloodGroup && (
                <span className="bg-white/20 backdrop-blur-xs border border-white/30 text-white text-xs font-black px-3 py-1 rounded-full">
                  Group {userProfile.bloodGroup}
                </span>
              )}
            </div>
            <p className="text-xs text-red-100 font-medium mt-1">
              {currentUser.email} • {userProfile && userProfile.city ? userProfile.city : "Location not set"}
            </p>
            {userProfile && userProfile.isDonor && (
              <span className="inline-block bg-white/20 backdrop-blur-xs border border-white/30 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mt-2">
                ✓ Active Donor Status Registered
              </span>
            )}
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-emerald-800 text-xs font-bold">{success}</p>
          </div>
        )}

        {/* Edit Form / Information Card */}
        {isEditing ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Edit Account Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Full Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Phone Number</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">City</label>
                <input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Blood Group</label>
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Account Information</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <Mail className="text-slate-400 shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <Phone className="text-slate-400 shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    {userProfile && userProfile.phone ? userProfile.phone : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <Droplets className="text-slate-400 shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    {userProfile && userProfile.bloodGroup ? userProfile.bloodGroup : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <MapPin className="text-slate-400 shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">City / Location</p>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    {userProfile && userProfile.city ? userProfile.city : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donor Availability Toggle */}
        {userProfile && userProfile.isDonor && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Donor Availability Status</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {available ? "You are currently visible to patients in emergency donor search" : "Your donor profile is currently hidden from search"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAvailable}
              style={{
                width: '56px',
                height: '28px',
                borderRadius: '9999px',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: available ? 'flex-end' : 'flex-start',
                backgroundColor: available ? '#10b981' : '#cbd5e1',
                transition: 'all 0.2s ease-in-out',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={available ? "Click to set unavailable" : "Click to set available"}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  display: 'block',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </button>
          </div>
        )}

        {userProfile && !userProfile.isDonor && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200/80 text-center space-y-3">
            <h4 className="font-black text-slate-900 text-base">Register as a Blood Donor</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Help save lives in emergency situations. You can toggle your availability anytime.
            </p>
            <button
              onClick={becomeDonor}
              className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all"
            >
              Become an Active Donor
            </button>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 rounded-2xl py-3.5 font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={16} />
          <span>Log Out of LifeStream</span>
        </button>
      </div>
    </div>
  )
}