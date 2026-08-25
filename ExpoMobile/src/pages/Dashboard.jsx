import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, push } from "../firebase/config"
import { Droplets, AlertCircle, Search, ClipboardList, Bell, Award, UserCheck, Activity, ShieldAlert } from "lucide-react-native"

function getCurrentTimestamp() {
  return Date.now()
}

export default function Dashboard({ navigation }) {
  const [userProfile, setUserProfile] = useState(null)
  const [donorCount, setDonorCount] = useState(0)
  const [myRequestCount, setMyRequestCount] = useState(0)
  const [emergencyCount, setEmergencyCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [availableRequests, setAvailableRequests] = useState([])
  const [donationCount, setDonationCount] = useState(0)
  const [badgeEmoji, setBadgeEmoji] = useState("")
  const [badgeLabel, setBadgeLabel] = useState("")
  const { currentUser } = useAuth()
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }

  useEffect(() => {
    if (!currentUser) return

    const unsubscribeUser = onValue(ref(db, "users/" + currentUser.uid), function (snap) {
      const data = snap.val()
      if (data) {
        setUserProfile(data)
      } else {
        setUserProfile(null)
      }
    })

    const unsubscribeUsers = onValue(ref(db, "users"), function (snap) {
      const data = snap.val()
      if (data) {
        const count = Object.values(data).filter(function (user) {
          return user && user.isDonor === true
        }).length
        setDonorCount(count)
      } else {
        setDonorCount(0)
      }
    })

    const unsubscribeRequests = onValue(ref(db, "requests"), function (snap) {
      const data = snap.val()
      if (data) {
        const all = Object.entries(data).map(function ([id, request]) {
          return { id: id, ...request }
        })
        const mine = all.filter(function (request) {
          return request.userId === currentUser.uid
        })
        const pending = all.filter(function (request) {
          return request.status === "pending" && request.userId !== currentUser.uid
        })
        const completed = all.filter(function (request) {
          return request.donorId === currentUser.uid && request.status === "completed"
        })

        setMyRequestCount(mine.length)
        setAvailableRequests(pending)
        setDonationCount(completed.length)

        if (completed.length >= 20) {
          setBadgeEmoji("💠")
          setBadgeLabel("Diamond Donor")
        } else if (completed.length >= 10) {
          setBadgeEmoji("💎")
          setBadgeLabel("Platinum Donor")
        } else if (completed.length >= 6) {
          setBadgeEmoji("🥇")
          setBadgeLabel("Gold Donor")
        } else if (completed.length >= 3) {
          setBadgeEmoji("🥈")
          setBadgeLabel("Silver Donor")
        } else if (completed.length >= 1) {
          setBadgeEmoji("🥉")
          setBadgeLabel("Bronze Donor")
        } else {
          setBadgeEmoji("")
          setBadgeLabel("")
        }
      } else {
        setMyRequestCount(0)
        setAvailableRequests([])
        setDonationCount(0)
        setBadgeEmoji("")
        setBadgeLabel("")
      }
    })

    const unsubscribeEmergency = onValue(ref(db, "emergency"), function (snap) {
      const data = snap.val()
      if (data) {
        const active = Object.values(data).filter(function (item) {
          return item && item.status === "active"
        }).length
        setEmergencyCount(active)
      } else {
        setEmergencyCount(0)
      }
    })

    const unsubscribeNotifications = onValue(ref(db, "notifications/" + currentUser.uid), function (snap) {
      const data = snap.val()
      if (data) {
        const unread = Object.values(data).filter(function (item) {
          return item && item.read === false
        }).length
        setUnreadCount(unread)
      } else {
        setUnreadCount(0)
      }
    })

    return function () {
      unsubscribeUser()
      unsubscribeUsers()
      unsubscribeRequests()
      unsubscribeEmergency()
      unsubscribeNotifications()
    }
  }, [currentUser])

  async function acceptRequest(req) {
    try {
      const acceptedAtValue = getCurrentTimestamp()
      await update(ref(db, "requests/" + req.id), {
        status: "accepted",
        donorId: currentUser.uid,
        acceptedAt: acceptedAtValue
      })

      if (userProfile) {
        const notificationTime = getCurrentTimestamp()
        await push(ref(db, "notifications/" + req.userId), {
          type: "success",
          title: "Donor Found!",
          message: (userProfile.name || "A donor") + " accepted your blood request",
          read: false,
          createdAt: notificationTime
        })
      }

      navigate("/donor-tracking", { state: { requestId: req.id } })
    } catch (err) {
      console.log("Accept error:", err)
    }
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  function getName() {
    if (userProfile && userProfile.name) return userProfile.name.split(" ")[0]
    return "User"
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  })

  const matchingRequests = availableRequests.filter(function (request) {
    if (!userProfile || !userProfile.bloodGroup) return true
    return request.bloodGroup === userProfile.bloodGroup
  })

  const nextBadgeTarget = donationCount >= 20
    ? null
    : donationCount >= 10
      ? 20
      : donationCount >= 6
        ? 10
        : donationCount >= 3
          ? 6
          : donationCount >= 1
            ? 3
            : 1

  const progress = donationCount >= 20
    ? 100
    : donationCount >= 10
      ? ((donationCount - 10) / 10) * 100
      : donationCount >= 6
        ? ((donationCount - 6) / 4) * 100
        : donationCount >= 3
          ? ((donationCount - 3) / 3) * 100
          : donationCount >= 1
            ? ((donationCount - 1) / 2) * 100
            : 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header Hero Banner */}
        <View className="bg-red-600 pt-6 pb-10 px-5 rounded-b-3xl shadow-md">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1 flex-1 pr-4">
              <Text className="text-red-200 text-[11px] font-extrabold tracking-widest uppercase">{today}</Text>
              <Text className="text-2xl font-black text-white tracking-tight">
                {getGreeting() + ", " + getName() + "!"}
              </Text>

              {(!userProfile || !userProfile.name) && (
                <TouchableOpacity
                  onPress={function () { navigate("/profile") }}
                  className="bg-white/20 border border-white/30 px-3.5 py-1.5 rounded-full mt-2 self-start flex flex-row items-center gap-1.5"
                >
                  <Text className="text-white text-xs font-bold">⚠️ Profile incomplete - tap to set name</Text>
                </TouchableOpacity>
              )}

              {userProfile && userProfile.isDonor && !!badgeEmoji && (
                <TouchableOpacity
                  onPress={function () { navigate("/certifications") }}
                  className="bg-white/20 border border-white/30 px-3.5 py-1.5 rounded-full mt-2 self-start flex flex-row items-center gap-2"
                >
                  <Text className="text-sm">{badgeEmoji}</Text>
                  <Text className="text-white font-extrabold text-xs">{badgeLabel}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={function () { navigate("/notifications") }}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30"
            >
              <Bell size={22} color="#ffffff" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-amber-400 border-2 border-red-600 rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                  <Text className="text-red-950 font-black text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 -mt-6 flex flex-col gap-6">
          {/* Stats Bar */}
          <View className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 flex flex-row justify-between items-center">
            <View className="flex-1 items-center">
              <UserCheck size={20} color="#dc2626" />
              <Text className="text-2xl font-black text-slate-900 mt-1">{donorCount}</Text>
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Donors</Text>
            </View>
            <View className="w-[1px] h-10 bg-slate-200" />
            <View className="flex-1 items-center">
              <Activity size={20} color="#dc2626" />
              <Text className="text-2xl font-black text-slate-900 mt-1">{myRequestCount}</Text>
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Requests</Text>
            </View>
            <View className="w-[1px] h-10 bg-slate-200" />
            <View className="flex-1 items-center">
              <ShieldAlert size={20} color="#dc2626" />
              <Text className="text-2xl font-black text-slate-900 mt-1">{emergencyCount}</Text>
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Emergencies</Text>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View className="flex flex-col gap-3">
            <Text className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Quick Actions</Text>
            <View className="flex flex-row flex-wrap gap-3">
              <TouchableOpacity
                onPress={function () { navigate("/request-blood") }}
                className="flex-1 min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center text-center"
              >
                <View className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                  <Droplets size={24} color="#dc2626" />
                </View>
                <Text className="text-xs font-extrabold text-slate-900">Request Blood</Text>
                <Text className="text-[10px] text-slate-500 font-medium mt-0.5">Create request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={function () { navigate("/emergency") }}
                className="flex-1 min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center text-center"
              >
                <View className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-2">
                  <AlertCircle size={24} color="#e11d48" />
                </View>
                <Text className="text-xs font-extrabold text-slate-900">Emergency</Text>
                <Text className="text-[10px] text-slate-500 font-medium mt-0.5">Broadcast alert</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={function () { navigate("/find-donor") }}
                className="flex-1 min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center text-center"
              >
                <View className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-2">
                  <Search size={24} color="#0284c7" />
                </View>
                <Text className="text-xs font-extrabold text-slate-900">Find Donor</Text>
                <Text className="text-[10px] text-slate-500 font-medium mt-0.5">Search donors</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={function () { navigate("/my-requests") }}
                className="flex-1 min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center text-center"
              >
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2">
                  <ClipboardList size={24} color="#059669" />
                </View>
                <Text className="text-xs font-extrabold text-slate-900">My Requests</Text>
                <Text className="text-[10px] text-slate-500 font-medium mt-0.5">Track requests</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Badge Progress Card */}
          {userProfile && userProfile.isDonor && !!badgeEmoji && (
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col gap-3">
              <View className="flex flex-row items-center justify-between">
                <View>
                  <Text className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Badge Rank</Text>
                  <Text className="text-sm font-extrabold text-slate-900 mt-0.5">{badgeEmoji + " " + badgeLabel}</Text>
                </View>
                <TouchableOpacity onPress={function () { navigate("/certifications") }}>
                  <Text className="text-xs font-extrabold text-red-600">View Badges</Text>
                </TouchableOpacity>
              </View>
              <View className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <View
                  className="h-full rounded-full bg-red-600"
                  style={{ width: Math.min(Math.max(progress, 0), 100) + "%" }}
                />
              </View>
              <Text className="text-[11px] text-slate-500 font-medium">
                {nextBadgeTarget === null
                  ? "Highest badge level reached!"
                  : Math.max(nextBadgeTarget - donationCount, 0) + " more donation(s) to reach the next badge."}
              </Text>
            </View>
          )}

          {/* Available Matching Requests Section */}
          {userProfile && userProfile.isDonor && (
            <View className="flex flex-col gap-3">
              <Text className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Matching Blood Requests
              </Text>

              {matchingRequests.length > 0 ? (
                <View className="flex flex-col gap-3">
                  {matchingRequests.slice(0, 5).map(function (req) {
                    return (
                      <View
                        key={req.id}
                        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col gap-3"
                      >
                        <View className="flex flex-row items-center gap-3">
                          <View className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                            <Text className="font-black text-red-600 text-base">{req.bloodGroup}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-extrabold text-slate-900">{req.patientName}</Text>
                            <Text className="text-xs text-slate-500 font-medium mt-0.5">{req.hospital + " • " + req.city}</Text>
                            <Text className="text-[11px] text-red-600 font-bold mt-0.5">{req.units + " unit(s) needed"}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={function () { acceptRequest(req) }}
                          className="w-full bg-red-600 py-3 rounded-2xl items-center justify-center shadow-xs"
                        >
                          <Text className="text-white text-xs font-extrabold uppercase tracking-wider">Accept & Respond</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </View>
              ) : (
                <View className="bg-white rounded-3xl p-6 border border-slate-200/80 items-center text-center">
                  <Text className="text-xs font-bold text-slate-500">
                    No pending requests matching your blood group right now.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
