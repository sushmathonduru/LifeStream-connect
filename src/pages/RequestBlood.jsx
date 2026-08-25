import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Droplets } from "lucide-react"
import { db } from "../firebase/config"
import { ref, push, set, onValue } from "firebase/database"
import { useAuth } from "../context/AuthContext"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function RequestBlood() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [patientName, setPatientName] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [hospital, setHospital] = useState("")
  const [city, setCity] = useState("")
  const [units, setUnits] = useState("1")
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isDonor, setIsDonor] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const profileRef = ref(db, "users/" + currentUser.uid)
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setIsDonor(data.isDonor === true)
      } else {
        setIsDonor(false)
      }
    })

    return function () {
      unsubscribe()
    }
  }, [currentUser])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!patientName || !bloodGroup || !hospital || !city || !units || !contact) {
      return
    }

    setLoading(true)
    try {
      const requestId = push(ref(db, "requests")).key
      await set(ref(db, "requests/" + requestId), {
        patientName: patientName,
        bloodGroup: bloodGroup,
        hospital: hospital,
        city: city,
        units: Number(units),
        contact: contact,
        notes: notes,
        userId: currentUser.uid,
        status: "pending",
        createdAt: Date.now()
      })

      setSuccess(true)
      setPatientName("")
      setBloodGroup("")
      setHospital("")
      setCity("")
      setUnits("1")
      setContact("")
      setNotes("")

      setTimeout(function () {
        setSuccess(false)
        navigate("/my-requests")
      }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all border border-white/30"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Blood Request</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Submit a standard blood request to find matched donors
              </p>
            </div>
          </div>
          <div className="w-11 h-11 bg-white/20 text-white border border-white/30 rounded-xl flex items-center justify-center text-xl shrink-0">
            <Droplets size={22} />
          </div>
        </div>

        {isDonor && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900">
            <p className="text-xs font-extrabold">Requesting as a Patient</p>
            <p className="text-xs text-blue-700 font-medium mt-0.5">Your active donor profile remains registered in the system.</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-bold text-center">
            ✅ Blood request created successfully! Redirecting to tracking...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Patient Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter full patient name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Blood Group *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map(function (group) {
                  return (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Units Required *</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                min="1"
                max="10"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hospital Name *</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. St. Jude Memorial Hospital"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Contact Phone *</label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Specify doctor instructions, room/ward number, or urgent timing..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold py-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Submit Blood Request"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
