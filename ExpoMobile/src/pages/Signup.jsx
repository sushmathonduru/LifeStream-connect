import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, set } from "../firebase/config"
import { Droplets, User, Mail, Phone, MapPin, Lock, ShieldCheck, Heart } from "lucide-react-native"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function Signup({ navigation }) {
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
  const navigate = (path) => { const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard"); }

  const isDonor = role === "donor"

  async function handleSubmit() {
    setError("")

    if (!name || !email || !phone || !bloodGroup || !city || !password || !confirm) {
      setError("Please fill in all required fields.")
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 28 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View className="items-center pt-2 pb-6 text-center">
            <View className="w-16 h-16 bg-red-600 rounded-3xl items-center justify-center shadow-lg mb-3">
              <Droplets size={32} color="#ffffff" />
            </View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Create Account</Text>
            <Text className="text-xs font-bold text-slate-500 mt-1">
              Join the Emergency Donor Network
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col gap-4 mb-6">
            {!!error && (
              <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
                <Text className="text-rose-600 text-xs font-bold text-center">{error}</Text>
              </View>
            )}

            {/* Role Tabs */}
            <View className="bg-slate-100 p-1.5 rounded-2xl flex flex-row gap-2">
              <TouchableOpacity
                onPress={() => setRole("patient")}
                className={"flex-1 py-3 rounded-xl flex flex-row items-center justify-center gap-2 " + (role === "patient" ? "bg-white shadow-xs border border-slate-200/60" : "")}
              >
                <Heart size={16} color={role === "patient" ? "#dc2626" : "#64748b"} />
                <Text className={"text-xs font-extrabold " + (role === "patient" ? "text-slate-900" : "text-slate-500")}>Need Blood</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole("donor")}
                className={"flex-1 py-3 rounded-xl flex flex-row items-center justify-center gap-2 " + (role === "donor" ? "bg-red-600 shadow-xs" : "")}
              >
                <ShieldCheck size={16} color={role === "donor" ? "#ffffff" : "#64748b"} />
                <Text className={"text-xs font-extrabold " + (role === "donor" ? "text-white" : "text-slate-500")}>Can Donate</Text>
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Full Name *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <User size={18} color="#94a3b8" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Email Address */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Email Address *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Mail size={18} color="#94a3b8" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Phone Number *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Phone size={18} color="#94a3b8" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* City */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">City *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <MapPin size={18} color="#94a3b8" />
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Chennai, Mumbai"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Blood Group */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Blood Group *</Text>
              <View className="flex flex-row flex-wrap gap-2 pt-1">
                {bloodGroups.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setBloodGroup(g)}
                    className={"px-4 py-2.5 rounded-xl border flex items-center justify-center " + (bloodGroup === g ? "bg-red-600 border-red-600 shadow-xs" : "bg-slate-50 border-slate-200")}
                  >
                    <Text className={"text-xs font-black " + (bloodGroup === g ? "text-white" : "text-slate-700")}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Password */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Password *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Lock size={18} color="#94a3b8" />
                <TextInput
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Confirm Password *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Lock size={18} color="#94a3b8" />
                <TextInput
                  secureTextEntry={true}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 py-4 rounded-2xl shadow-md items-center justify-center mt-3 active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Sign in prompt */}
            <View className="flex flex-row items-center justify-center pt-2 gap-1">
              <Text className="text-slate-500 font-semibold text-xs">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigate("/login")}>
                <Text className="text-red-600 font-black text-xs">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center pb-6">
            <Text className="text-[11px] text-slate-400 font-bold">
              LifeStream Mobile Connect • v1.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
