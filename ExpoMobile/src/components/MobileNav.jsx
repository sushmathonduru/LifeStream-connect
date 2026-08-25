import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { Home, Search, Droplets, ClipboardList, User } from "lucide-react-native"

export default function MobileNav({ navigation, currentRoute }) {
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

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard", name: "Dashboard" },
    { icon: Search, label: "Find", path: "/find-donor", name: "FindDonor" },
    { icon: Droplets, label: "Request", path: "/request-blood", name: "RequestBlood" },
    { icon: ClipboardList, label: "Activity", path: "/my-requests", name: "MyRequests" },
    { icon: User, label: "Profile", path: "/profile", name: "Profile" },
  ]

  return (
    <View className="bg-white border-t border-slate-200 flex flex-row items-center justify-around py-2 px-1 shadow-md">
      {navItems.map(function (item) {
        const Icon = item.icon
        const active = currentRoute === item.name
        return (
          <TouchableOpacity
            key={item.path}
            onPress={function () { navigate(item.path) }}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
          >
            <View className="relative items-center justify-center">
              <Icon size={20} color={active ? "#dc2626" : "#64748b"} />
              {item.label === "Alerts" && unreadCount > 0 && (
                <View className="absolute -top-1 -right-2 bg-red-600 rounded-full px-1 py-0.2 border border-white">
                  <Text className="text-[9px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text className={"text-[10px] tracking-tight " + (active ? "font-extrabold text-red-600" : "font-bold text-slate-500")}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
