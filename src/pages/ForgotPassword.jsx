import { useState } from "react"
import { Link } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleReset() {
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Sent!</h2>
        <p className="text-gray-500 text-sm text-center mb-2">
          Password reset link has been sent to
        </p>
        <p className="text-red-600 font-semibold text-sm mb-8">{email}</p>

        <div className="bg-gray-50 rounded-2xl p-4 w-full mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Next Steps</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Check your email inbox</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Click the reset link in the email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Create your new password</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Come back and login</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setSent(false) }}
          className="w-full border-2 border-red-600 text-red-600 font-semibold py-3 rounded-2xl mb-3"
        >
          Resend Email
        </button>

        <Link
          to="/login"
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 rounded-2xl text-center block"
        >
          Back to Login
        </Link>

        <p className="text-xs text-gray-400 text-center mt-4">
          Check spam folder if you don't see the email
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-red-600 to-red-800 flex flex-col items-center justify-center py-14 px-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-5">
          <span className="text-4xl">🔐</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Forgot Password</h1>
        <p className="text-red-200 text-sm mt-1 text-center">
          Enter your email to receive a reset link
        </p>
      </div>

      <div className="flex-1 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 bg-gray-50"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <Link
          to="/login"
          className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl text-center block"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}