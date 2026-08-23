import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, set } from "../firebase/config"
import { Droplets } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [city, setCity] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [role, setRole] = useState("patient")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const isDonor = role === "donor"

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!name || !email || !phone || !bloodGroup || !city || !password || !confirm) {
      setError("Please fill in all fields.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)
      const credential = await signup(email, password)
      const uid = credential.user.uid
      await set(ref(db, "users/" + uid), {
        name,
        email,
        phone,
        bloodGroup,
        city,
        isDonor,
        available: isDonor,
        createdAt: Date.now()
      })
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-5">
      <div className="flex flex-col items-center pt-4 text-center gap-2">
        <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center text-white shadow-md">
          <Droplets size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Join the LifeStream Mobile network
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 my-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <p className="text-rose-600 text-xs font-bold text-center">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765..."
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Blood Group *</label>
            <select
              required
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Confirm *</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm"
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Starting Role</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={
                  "rounded-xl border p-3 text-left cursor-pointer transition " +
                  (role === "patient" ? "border-red-600 bg-white shadow-xs" : "border-slate-200 bg-white")
                }
              >
                <p className="font-bold text-slate-900 text-xs">Patient</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Need blood</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("donor")}
                className={
                  "rounded-xl border p-3 text-left cursor-pointer transition " +
                  (role === "donor" ? "border-red-600 bg-white shadow-xs" : "border-slate-200 bg-white")
                }
              >
                <p className="font-bold text-slate-900 text-xs">Donor</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Can donate</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide mt-1"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium pt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      <div className="text-center text-[11px] text-slate-400 font-medium pb-2">
        LifeStream Mobile Connect • v1.0
      </div>
    </div>
  )
}
