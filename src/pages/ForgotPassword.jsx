import { useState } from "react"
import { Link } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"
import { KeyRound, Mail, ArrowLeft } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleReset(e) {
    if (e) e.preventDefault()
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    try {
      setError("")
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.")
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else {
        setError("Failed to send reset email. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xs">
            ✅
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Check Your Inbox</h2>
          <p className="text-xs text-slate-500 font-medium">
            Password reset link has been sent to <br />
            <strong className="text-red-600 font-bold">{email}</strong>
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-left space-y-2">
            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Next Steps</p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Open your email inbox
            </p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Click the password reset link
            </p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Log back in to LifeStream Connect
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setSent(false)}
              className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
            >
              Resend Reset Email
            </button>
            <Link
              to="/login"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider block transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md mb-3">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
          <p className="text-red-100 text-xs font-medium mt-1">
            Enter your email to receive password recovery instructions
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleReset} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
              <p className="text-rose-600 text-xs font-bold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}