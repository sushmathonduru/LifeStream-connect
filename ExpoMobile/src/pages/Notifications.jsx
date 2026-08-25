import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, remove } from "../firebase/config"
import { Bell, CheckCheck, AlertCircle, Info, Heart, Trash2 } from "lucide-react-native"

export default function Notifications({ navigation }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())
  const { currentUser } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const notifRef = ref(db, "notifications/" + currentUser.uid)
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data)
          .map(([id, notif]) => ({ id, ...notif }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setNotifications(list)
      } else {
        setNotifications([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [currentUser])

  function formatTime(timestamp) {
    if (!timestamp) return ""
    const diff = nowTimestamp - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return mins + "m ago"
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs + "h ago"
    return Math.floor(hrs / 24) + "d ago"
  }

  async function markAsRead(notifId) {
    await update(ref(db, "notifications/" + currentUser.uid + "/" + notifId), { read: true })
  }

  async function markAllAsRead() {
    for (const notif of notifications) {
      if (!notif.read) {
        await update(ref(db, "notifications/" + currentUser.uid + "/" + notif.id), { read: true })
      }
    }
  }

  async function deleteNotif(notifId) {
    await remove(ref(db, "notifications/" + currentUser.uid + "/" + notifId))
  }

  function getIcon(type) {
    if (type === "alert") return <AlertCircle size={20} color="#dc2626" />
    if (type === "success") return <Heart size={20} color="#059669" />
    return <Info size={20} color="#0284c7" />
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header Hero */}
        <View className="bg-red-600 rounded-3xl p-5 shadow-md flex flex-row items-center justify-between mb-4">
          <View className="flex flex-row items-center gap-3.5 flex-1">
            <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Bell size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white tracking-tight">Notifications</Text>
              <Text className="text-red-100 text-xs font-semibold mt-0.5">
                {unreadCount > 0 ? unreadCount + " unread alert(s)" : "All caught up"}
              </Text>
            </View>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-white/20 border border-white/30 px-3 py-2 rounded-2xl flex flex-row items-center gap-1.5"
            >
              <CheckCheck size={14} color="#ffffff" />
              <Text className="text-white text-xs font-extrabold">Read All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View className="flex items-center justify-center py-12">
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        )}

        {!loading && notifications.length === 0 && (
          <View className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center my-4">
            <Bell size={40} color="#cbd5e1" />
            <Text className="text-sm font-extrabold text-slate-800">No Notifications</Text>
            <Text className="text-xs text-slate-500 font-semibold mt-1">
              Emergency broadcasts and donation updates will appear here.
            </Text>
          </View>
        )}

        {/* Notifications List */}
        <View className="flex flex-col gap-3">
          {!loading && notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              onPress={() => markAsRead(notif.id)}
              className={
                "rounded-3xl p-4 border flex flex-row items-start gap-3.5 shadow-sm " +
                (notif.type === "alert" ? "border-l-4 border-l-red-600 bg-red-50/40 border-slate-200/80" : notif.type === "success" ? "border-l-4 border-l-emerald-600 bg-emerald-50/40 border-slate-200/80" : "border-l-4 border-l-sky-600 bg-sky-50/40 border-slate-200/80") +
                (notif.read ? " opacity-70 bg-white" : " bg-white")
              }
            >
              <View className="mt-0.5">{getIcon(notif.type)}</View>
              <View className="flex-1 min-w-0 flex flex-col gap-1">
                <View className="flex flex-row items-center justify-between gap-2">
                  <Text className={"text-xs flex-1 " + (!notif.read ? "font-black text-slate-900" : "font-bold text-slate-700")}>
                    {notif.title}
                  </Text>
                  {!notif.read && <View className="w-2 h-2 bg-red-600 rounded-full" />}
                </View>
                <Text className="text-xs text-slate-600 font-medium leading-relaxed">{notif.message}</Text>
                <Text className="text-[10px] text-slate-400 font-semibold mt-1">{formatTime(notif.createdAt)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteNotif(notif.id)}
                className="p-1"
              >
                <Trash2 size={16} color="#94a3b8" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
