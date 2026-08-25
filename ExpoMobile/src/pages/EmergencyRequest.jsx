import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, push, set } from "../firebase/config"
import { AlertCircle, CheckCircle, Send, Hospital, MapPin, Hash, Zap } from "lucide-react-native"
import io from "socket.io-client"

const socket = io("http://localhost:5000")
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const urgencyLevels = [
  { label: "Critical", desc: "Immediate transfusion (< 1 hr)" },
  { label: "High", desc: "Urgent within 2 to 4 hours" },
  { label: "Medium", desc: "Required within 12 hours" }
]

export default function EmergencyRequest({ navigation }) {
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }
  const { currentUser, userProfile } = useAuth()

  const [selectedGroup, setSelectedGroup] = useState("")
  const [urgency, setUrgency] = useState("Critical")
  const [hospital, setHospital] = useState("")
  const [city, setCity] = useState(userProfile?.city || "")
  const [units, setUnits] = useState("2")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleBroadcast() {
    if (!selectedGroup) {
      setError("Please select a blood group required.")
      return
    }
    if (!hospital || !city) {
      setError("Please enter hospital name and city.")
      return
    }

    try {
      setError("")
      setSending(true)
      const requestRef = push(ref(db, "requests"))
      const requestData = {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email.split("@")[0],
        patientName: "EMERGENCY: " + (userProfile?.name || "Patient"),
        bloodGroup: selectedGroup,
        units: Number(units) || 1,
        hospital: hospital,
        city: city,
        urgency: urgency,
        isEmergency: true,
        status: "pending",
        createdAt: Date.now()
      }
      await set(requestRef, requestData)

      await set(push(ref(db, "emergency")), {
        requestId: requestRef.key,
        bloodGroup: selectedGroup,
        hospital: hospital,
        city: city,
        urgency: urgency,
        status: "active",
        createdAt: Date.now()
      })

      socket.emit("emergencyAlert", {
        id: requestRef.key,
        bloodGroup: selectedGroup,
        hospital: hospital,
        city: city,
        urgency: urgency,
        timestamp: Date.now()
      })

      setSent(true)
      setTimeout(() => {
        navigate("/my-requests")
      }, 2000)
    } catch (err) {
      console.error(err)
      setError("Failed to send emergency broadcast. Please try again.")
    } finally {
      setSending(false)
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Emergency Header Card */}
          <View className="bg-red-600 rounded-3xl p-5 shadow-md flex flex-row items-center gap-3.5 mb-4">
            <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <AlertCircle size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white tracking-tight">Emergency Broadcast</Text>
              <Text className="text-red-100 text-xs font-semibold mt-0.5">Alert all nearby compatible donors instantly</Text>
            </View>
          </View>

          {!!sent && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-row items-center gap-3 mb-4 shadow-xs">
              <CheckCircle size={22} color="#059669" />
              <View className="flex-1">
                <Text className="text-xs font-extrabold text-emerald-900">Broadcast Alert Sent!</Text>
                <Text className="text-[11px] text-emerald-700 font-semibold mt-0.5">Notifying available donors in {city}...</Text>
              </View>
            </View>
          )}

          {!!error && (
            <View className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 shadow-xs">
              <Text className="text-rose-600 text-xs font-bold text-center">{error}</Text>
            </View>
          )}

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 flex flex-col gap-4 mb-6">
            {/* Blood Group Required */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Required Blood Group *</Text>
              <View className="flex flex-row flex-wrap gap-2 pt-1">
                {bloodGroups.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setSelectedGroup(g)}
                    className={"px-3.5 py-2.5 rounded-xl border flex items-center justify-center " + (selectedGroup === g ? "bg-red-600 border-red-600 shadow-xs" : "bg-slate-50 border-slate-200")}
                  >
                    <Text className={"text-xs font-black " + (selectedGroup === g ? "text-white" : "text-slate-700")}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Urgency Level */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Urgency Level</Text>
              <View className="flex flex-col gap-2 pt-1">
                {urgencyLevels.map((u) => (
                  <TouchableOpacity
                    key={u.label}
                    onPress={() => setUrgency(u.label)}
                    className={"p-3 rounded-2xl border flex flex-row items-center justify-between " + (urgency === u.label ? "bg-red-50 border-red-600" : "bg-slate-50 border-slate-200")}
                  >
                    <View className="flex-1">
                      <Text className={"text-xs font-black " + (urgency === u.label ? "text-red-700" : "text-slate-900")}>{u.label}</Text>
                      <Text className="text-[11px] font-medium text-slate-500 mt-0.5">{u.desc}</Text>
                    </View>
                    {urgency === u.label && <Zap size={16} color="#dc2626" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hospital Name */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Hospital Name & Ward *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Hospital size={16} color="#94a3b8" />
                <TextInput
                  value={hospital}
                  onChangeText={(text) => setHospital(text)}
                  placeholder="e.g. Apollo Hospital, Ward 4"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-xs font-medium text-slate-900"
                />
              </View>
            </View>

            {/* City & Units Grid */}
            <View className="flex flex-row gap-3">
              <View className="flex-1 flex flex-col gap-1.5">
                <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">City *</Text>
                <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3">
                  <MapPin size={16} color="#94a3b8" />
                  <TextInput
                    value={city}
                    onChangeText={(text) => setCity(text)}
                    placeholder="City"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-1.5 text-xs font-medium text-slate-900"
                  />
                </View>
              </View>

              <View className="flex-1 flex flex-col gap-1.5">
                <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Units *</Text>
                <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3">
                  <Hash size={16} color="#94a3b8" />
                  <TextInput
                    value={String(units)}
                    onChangeText={(text) => setUnits(text)}
                    keyboardType="number-pad"
                    className="flex-1 ml-1.5 text-xs font-medium text-slate-900"
                  />
                </View>
              </View>
            </View>

            {/* Broadcast Button */}
            <TouchableOpacity
              onPress={handleBroadcast}
              disabled={sending}
              className="w-full bg-red-600 py-4 rounded-2xl shadow-md flex flex-row items-center justify-center gap-2 mt-2 active:opacity-90"
            >
              {sending ? (
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} color="#ffffff" />
                  <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Send Emergency Alert</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

