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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 mb-5 font-medium hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[28px] p-5 text-white shadow-lg shadow-red-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm text-red-100">Request blood for patients fast</p>
              <h1 className="text-2xl font-bold">Create Request</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-10 space-y-5">
        {isDonor && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-blue-900 shadow-sm">
            <p className="text-sm font-semibold">You are requesting as a patient</p>
            <p className="text-xs mt-1 text-blue-700">Your donor status remains active</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 shadow-sm">
            Request submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[28px] p-5 md:p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Units</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                min="1"
                max="10"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Hospital name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                placeholder="Additional details"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-red-200/60 flex items-center justify-center gap-2 transition hover:brightness-105"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Broadcast Request"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
