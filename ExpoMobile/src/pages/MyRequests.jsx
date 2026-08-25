import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { ClipboardList, Heart, ChevronRight, Activity, Calendar } from "lucide-react-native"

export default function MyRequests({ navigation }) {
  const [activeTab, setActiveTab] = useState("requests")
  const [myRequests, setMyRequests] = useState([])
  const [myDonations, setMyDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }

  useEffect(() => {
    if (!currentUser) return
    const requestsRef = ref(db, "requests")
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const reqList = []
        const donList = []
        Object.entries(data).forEach(([id, req]) => {
          const item = { id, ...req }
          if (req.userId === currentUser.uid) {
            reqList.push(item)
          }
          if (req.donorId === currentUser.uid) {
            donList.push(item)
          }
        })
        setMyRequests(reqList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
        setMyDonations(donList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
      } else {
        setMyRequests([])
        setMyDonations([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  function getStatusStyle(status) {
    if (status === "completed") return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" }
    if (status === "accepted" || status === "in-progress") return { bg: "bg-sky-50 border-sky-200", text: "text-sky-700" }
    if (status === "cancelled") return { bg: "bg-slate-100 border-slate-200", text: "text-slate-500" }
    return { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" }
  }

  const currentItems = activeTab === "requests" ? myRequests : myDonations

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Hero Card */}
        <View className="bg-red-600 rounded-3xl p-5 shadow-md flex flex-row items-center gap-3.5 mb-4">
          <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
            <Activity size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black text-white tracking-tight">My Activity</Text>
            <Text className="text-red-100 text-xs font-semibold mt-0.5">Track blood requests & donation history</Text>
          </View>
        </View>

        {/* Tab Segment Selector */}
        <View className="bg-white rounded-3xl p-1.5 flex flex-row gap-2 border border-slate-200/80 shadow-sm mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab("requests")}
            className={
              "flex-1 py-3 rounded-2xl flex flex-row items-center justify-center gap-2 transition " +
              (activeTab === "requests" ? "bg-red-600 shadow-xs" : "bg-transparent")
            }
          >
            <ClipboardList size={16} color={activeTab === "requests" ? "#ffffff" : "#64748b"} />
            <Text className={"text-xs font-extrabold " + (activeTab === "requests" ? "text-white" : "text-slate-600")}>
              Requests ({myRequests.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("donations")}
            className={
              "flex-1 py-3 rounded-2xl flex flex-row items-center justify-center gap-2 transition " +
              (activeTab === "donations" ? "bg-red-600 shadow-xs" : "bg-transparent")
            }
          >
            <Heart size={16} color={activeTab === "donations" ? "#ffffff" : "#64748b"} />
            <Text className={"text-xs font-extrabold " + (activeTab === "donations" ? "text-white" : "text-slate-600")}>
              Donations ({myDonations.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-12">
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        ) : currentItems.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center my-4">
            <ClipboardList size={40} color="#cbd5e1" />
            <Text className="text-sm font-extrabold text-slate-800">
              {activeTab === "requests" ? "No Blood Requests" : "No Donation History"}
            </Text>
            <Text className="text-xs text-slate-500 font-semibold mt-1">
              {activeTab === "requests" ? "Submit a new request if you or someone needs blood." : "Accept requests on Dashboard to start saving lives!"}
            </Text>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            {currentItems.map((req) => {
              const statusFormatted = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : "Pending"
              const style = getStatusStyle(req.status)
              return (
                <View key={req.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3">
                  <View className="flex flex-row items-center justify-between">
                    <View className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                      <Text className="font-black text-red-600 text-sm">{req.bloodGroup}</Text>
                    </View>
                    <View className={"px-3 py-1 rounded-full border " + style.bg}>
                      <Text className={"text-[11px] font-black uppercase tracking-wider " + style.text}>
                        {statusFormatted}
                      </Text>
                    </View>
                  </View>

                  <View className="flex flex-col gap-0.5">
                    <Text className="text-base font-extrabold text-slate-900">{req.patientName}</Text>
                    <Text className="text-xs text-slate-500 font-medium">{req.hospital + " • " + req.city}</Text>
                  </View>

                  <View className="pt-3 border-t border-slate-100 flex flex-row items-center justify-between">
                    <View className="flex flex-row items-center gap-1.5">
                      <Calendar size={13} color="#94a3b8" />
                      <Text className="text-xs font-bold text-slate-700">{req.units + " Unit(s)"}</Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-slate-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                    </Text>
                  </View>

                  {(req.status === "accepted" || req.status === "in-progress") && (
                    <TouchableOpacity
                      onPress={() => navigate(activeTab === "requests" ? "/live-tracking" : "/donor-tracking", { state: { requestId: req.id } })}
                      className="w-full bg-red-600 py-3 rounded-2xl flex flex-row items-center justify-center gap-1.5 shadow-xs active:opacity-90"
                    >
                      <Text className="text-white text-xs font-extrabold uppercase tracking-wider">Track Live Status</Text>
                      <ChevronRight size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
