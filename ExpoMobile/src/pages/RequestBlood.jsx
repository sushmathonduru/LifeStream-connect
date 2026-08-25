import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, push, set } from "../firebase/config"
import { Droplet, CheckCircle, User, MapPin, Phone, Hospital, Hash, FileText } from "lucide-react-native"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function RequestBlood({ navigation }) {
  const navigate = (path) => { const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard"); }
  const { currentUser, userProfile } = useAuth()

  const [patientName, setPatientName] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [units, setUnits] = useState("1")
  const [hospital, setHospital] = useState("")
  const [city, setCity] = useState(userProfile?.city || "")
  const [contact, setContact] = useState(userProfile?.phone || "")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!patientName || !bloodGroup || !units || !hospital || !city || !contact) {
      alert("Please fill in all required fields.")
      return
    }

    try {
      setLoading(true)
      const requestRef = push(ref(db, "requests"))
      await set(requestRef, {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email.split("@")[0],
        patientName: patientName,
        bloodGroup: bloodGroup,
        units: Number(units),
        hospital: hospital,
        city: city,
        contact: contact,
        notes: notes,
        status: "pending",
        createdAt: Date.now()
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/my-requests")
      }, 1500)
    } catch (err) {
      console.error(err)
      alert("Failed to submit blood request. Please try again.")
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header Card */}
          <View className="bg-red-600 rounded-3xl p-5 shadow-md flex flex-row items-center gap-3.5 mb-4">
            <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Droplet size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white tracking-tight">Request Blood</Text>
              <Text className="text-red-100 text-xs font-semibold mt-0.5">Submit urgent requirement for donors</Text>
            </View>
          </View>

          {!!success && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-row items-center gap-3 mb-4 shadow-xs">
              <CheckCircle size={22} color="#059669" />
              <View className="flex-1">
                <Text className="text-xs font-extrabold text-emerald-900">Request Submitted Successfully!</Text>
                <Text className="text-[11px] text-emerald-700 font-semibold mt-0.5">Redirecting to My Requests...</Text>
              </View>
            </View>
          )}

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 flex flex-col gap-4 mb-6">
            {/* Patient Name */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Patient Name *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <User size={16} color="#94a3b8" />
                <TextInput
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Full name of patient"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-xs font-medium text-slate-900"
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
                    className={"px-3.5 py-2 rounded-xl border " + (bloodGroup === g ? "bg-red-600 border-red-600 shadow-xs" : "bg-slate-50 border-slate-200")}
                  >
                    <Text className={"text-xs font-black " + (bloodGroup === g ? "text-white" : "text-slate-700")}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Units */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Units Required *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Hash size={16} color="#94a3b8" />
                <TextInput
                  value={String(units)}
                  onChangeText={setUnits}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-xs font-medium text-slate-900"
                />
              </View>
            </View>

            {/* Hospital Name */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Hospital Name & Ward *</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <Hospital size={16} color="#94a3b8" />
                <TextInput
                  value={hospital}
                  onChangeText={setHospital}
                  placeholder="e.g. City Hospital, ICU Ward 3"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-xs font-medium text-slate-900"
                />
              </View>
            </View>

            {/* City & Contact Grid */}
            <View className="flex flex-row gap-3">
              <View className="flex-1 flex flex-col gap-1.5">
                <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">City *</Text>
                <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3">
                  <MapPin size={16} color="#94a3b8" />
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-1.5 text-xs font-medium text-slate-900"
                  />
                </View>
              </View>

              <View className="flex-1 flex flex-col gap-1.5">
                <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Contact Phone *</Text>
                <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3">
                  <Phone size={16} color="#94a3b8" />
                  <TextInput
                    value={contact}
                    onChangeText={setContact}
                    placeholder="+91 98765..."
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="flex-1 ml-1.5 text-xs font-medium text-slate-900"
                  />
                </View>
              </View>
            </View>

            {/* Notes */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Notes / Medical Instructions</Text>
              <View className="flex flex-row items-start bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                <FileText size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                  numberOfLines={3}
                  placeholder="Additional instructions for donors..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-xs font-medium text-slate-900"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 py-4 rounded-2xl shadow-md flex flex-row items-center justify-center gap-2 mt-2 active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Submit Blood Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
