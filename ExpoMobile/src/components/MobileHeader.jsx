import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { Droplet, Bell } from "lucide-react-native"

export default function MobileHeader({ navigation }) {
  const navigate = (path) => {
    if (!navigation) return
    const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"};
    navigation.navigate(m[path] || "Dashboard")
  }
  const { currentUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = onValue(
      ref(db, "notifications/" + currentUser.uid),
      function (snap) {
        const data = snap.val()
        if (data) {
          const count = Object.values(data).filter(
            function (n) { return !n.read }
          ).length
          setUnreadCount(count)
        } else {
          setUnreadCount(0)
        }
      }
    )
    return function () {
      unsubscribe()
    }
  }, [currentUser])

  return (
    <View className="bg-white border-b border-slate-200 px-4 py-3 flex flex-row items-center justify-between shadow-xs">
      <TouchableOpacity className="flex flex-row items-center gap-2.5" onPress={() => navigate("/dashboard")}>
        <View className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shadow-xs">
          <Droplet size={18} color="#ffffff" />
        </View>
        <View>
          <Text className="font-black text-slate-900 text-sm leading-tight tracking-tight">LifeStream</Text>
          <Text className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Mobile Connect</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigate("/notifications")}
        className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"
      >
        <Bell size={18} color="#334155" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
            <Text className="text-white text-[9px] font-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}
