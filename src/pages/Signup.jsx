import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { ref, set } from "firebase/database";
import { Droplets, User, Mail, Phone, MapPin, Lock, ArrowRight } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const isDonor = role === "donor";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name || !email || !phone || !bloodGroup || !city || !password || !confirm) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const credential = await signup(email, password);
      const uid = credential.user.uid;
      await set(ref(db, "users/" + uid), {
        name: name,
        email: email,
        phone: phone,
        bloodGroup: bloodGroup,
        city: city,
        isDonor: isDonor,
        available: isDonor,
        createdAt: Date.now()
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden my-6">
        {/* Header */}
        <div className="bg-red-600 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md mb-3">
            <Droplets size={32} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Your Account</h1>
          <p className="text-red-100 text-xs font-medium mt-1">
            Join the LifeStream Emergency Blood Network
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
              <p className="text-rose-600 text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  role === "patient"
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Patient / Requester
              </button>
              <button
                type="button"
                onClick={() => setRole("donor")}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  role === "donor"
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Blood Donor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Blood Group *
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-red-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
