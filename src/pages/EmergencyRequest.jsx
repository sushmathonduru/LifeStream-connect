import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, push, onValue } from "firebase/database"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const urgencyLevels = [
  { label: "Critical", style: "bg-red-600 text-white border-red-600" },
  { label: "High", style: "bg-orange-500 text-white border-orange-500" },
  { label: "Medium", style: "bg-yellow-500 text-white border-yellow-500" }
]

export default function EmergencyRequest() {
  const [selectedGroup, setSelectedGroup] = useState("")
  const [urgency, setUrgency] = useState("Critical")
  const [city, setCity] = useState("")
  const [hospital, setHospital] = useState("")
  const [units, setUnits] = useState("1")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [donorCount, setDonorCount] = useState(0)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const usersRef = ref(db, "users")
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const donors = Object.values(data).filter(function (user) {
          return user && user.isDonor === true && user.available === true
        })
        setDonorCount(donors.length)
      } else {
        setDonorCount(0)
      }
    })
  }, [])

  async function handleBroadcast() {
    if (!selectedGroup || !city || !hospital) {
      setError("Please fill all fields and select a blood group.")
      return
    }
    try {
      setError("")
      setLoading(true)
      const emergencyRef = await push(ref(db, "emergency"), {
        bloodGroup: selectedGroup,
        city: city,
        hospital: hospital,
        units: units,
        urgency: urgency,
        userId: currentUser.uid,
        status: "active",
        createdAt: Date.now()
      })
      const emergencyId = emergencyRef.key
      const usersSnapshot = await new Promise(function (resolve) {
        onValue(ref(db, "users"), function (snap) {
          resolve(snap)
        }, { onlyOnce: true })
      })
      const users = usersSnapshot.val()
      let notifiedCount = 0
      if (users) {
        const donorEntries = Object.entries(users).filter(function ([uid, user]) {
          return user.isDonor === true && uid !== currentUser.uid
        })
        for (const [uid] of donorEntries) {
          await push(ref(db, "notifications/" + uid), {
            type: "alert",
            title: "🚨 EMERGENCY: " + selectedGroup + " Blood Needed!",
            message: urgency + " - " + hospital +
              " in " + city + " needs " + units + " unit(s). " +
              "Please respond immediately!",
            read: false,
            createdAt: Date.now(),
            emergencyId: emergencyId
          })
          notifiedCount++
        }
      }
      setDonorCount(notifiedCount)
      setSent(true)
      setSelectedGroup("")
      setCity("")
      setHospital("")
      setUnits("1")
      setTimeout(function () {
        setSent(false)
      }, 6000)
    } catch (err) {
      setError("Failed to broadcast. Please try again.")
      console.log("Emergency error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xs text-white border border-white/30 rounded-xl flex items-center justify-center text-2xl shrink-0 animate-pulse">
              <AlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Emergency Blood Request</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Broadcast an instant urgent request to {donorCount} registered available donors
              </p>
            </div>
          </div>
        </div>

        {sent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="text-emerald-600 shrink-0" size={22} />
            <div>
              <p className="text-emerald-800 font-extrabold text-sm">
                Emergency Alert Broadcasted!
              </p>
              <p className="text-emerald-700 text-xs font-medium mt-0.5">
                {donorCount} donor(s) have been notified instantly via alert notifications.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="text-rose-700 text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Blood Group Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
            Select Required Blood Group *
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map(function (group) {
              const active = selectedGroup === group
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={
                    "py-3 rounded-xl text-sm font-black border transition-all " +
                    (active
                      ? "bg-red-600 text-white border-red-600 shadow-xs scale-[1.02]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100")
                  }
                >
                  {group}
                </button>
              )
            })}
          </div>
        </div>

        {/* Urgency Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
            Urgency Level *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {urgencyLevels.map(function (item) {
              const active = urgency === item.label
              return (
                <button
                  key={item.label}
                  onClick={() => setUrgency(item.label)}
                  className={
                    "py-3 rounded-xl text-xs font-bold border transition-all " +
                    (active
                      ? item.style + " shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100")
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Location & Hospital Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Hospital & Request Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Hospital Name *
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. City General Hospital"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Units Required
            </label>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              min="1"
              max="10"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Submit Broadcast Button */}
        <button
          onClick={handleBroadcast}
          disabled={loading}
          className="w-full bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold py-4 rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Notifying Nearby Donors...</span>
            </>
          ) : (
            <>
              <AlertCircle size={18} />
              <span>Broadcast Emergency Alert</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}