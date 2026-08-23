import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter email and password.")
      return
    }
    try {
      setError("")
      setLoading(true)
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-red-600 to-red-800 flex flex-col items-center justify-center py-14 px-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-5">
          <span className="text-red-600 text-4xl">🩸</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Welcome Back</h1>
        <p className="text-red-200 text-sm mt-1">
          Sign in to access the network
        </p>
      </div>

      <div className="flex-1 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 bg-gray-50"
          />
        </div>

        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 bg-gray-50 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 text-lg"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6 mt-3">
          <Link
            to="/forgot-password"
            className="text-red-600 text-sm font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-600 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}