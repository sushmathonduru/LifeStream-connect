import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Share, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { Award, Check, Lock, Trophy, Share2 } from "lucide-react-native"

const BADGES = [
  {
    key: "bronze",
    name: "Bronze Donor",
    emoji: "🥉",
    min: 1,
    max: 2,
    description: "First steps in giving life"
  },
  {
    key: "silver",
    name: "Silver Donor",
    emoji: "🥈",
    min: 3,
    max: 5,
    description: "Reliable donor support"
  },
  {
    key: "gold",
    name: "Gold Donor",
    emoji: "🥇",
    min: 6,
    max: 9,
    description: "A shining community helper"
  },
  {
    key: "platinum",
    name: "Platinum Donor",
    emoji: "💎",
    min: 10,
    max: 19,
    description: "A trusted blood champion"
  },
  {
    key: "diamond",
    name: "Diamond Donor",
    emoji: "💠",
    min: 20,
    max: 999,
    description: "Legend of lifesaving"
  }
]

const ACHIEVEMENTS = [
  {
    key: "first-donation",
    title: "Life Saver",
    emoji: "❤️",
    description: "Complete your first donation",
    threshold: 1
  },
  {
    key: "regular-donor",
    title: "Regular Donor",
    emoji: "⭐",
    description: "Complete 3 donations",
    threshold: 3
  },
  {
    key: "community-hero",
    title: "Community Hero",
    emoji: "🦸",
    description: "Complete 5 donations",
    threshold: 5
  },
  {
    key: "blood-champion",
    title: "Blood Champion",
    emoji: "👑",
    description: "Complete 10 donations",
    threshold: 10
  },
  {
    key: "legend",
    title: "Legend",
    emoji: "🌟",
    description: "Complete 20 donations",
    threshold: 20
  }
]

function getBadgeFromDonations(totalDonations) {
  if (totalDonations >= 20) return BADGES[4]
  if (totalDonations >= 10) return BADGES[3]
  if (totalDonations >= 6) return BADGES[2]
  if (totalDonations >= 3) return BADGES[1]
  if (totalDonations >= 1) return BADGES[0]
  return null
}

function getNextBadge(totalDonations) {
  if (totalDonations >= 20) return null
  if (totalDonations >= 10) return BADGES[4]
  if (totalDonations >= 6) return BADGES[3]
  if (totalDonations >= 3) return BADGES[2]
  if (totalDonations >= 1) return BADGES[1]
  return BADGES[0]
}

export default function Certifications({ navigation }) {
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }
  const { currentUser } = useAuth()
  const [completedDonations, setCompletedDonations] = useState(0)
  const [isDonor, setIsDonor] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const unsubscribeProfile = onValue(ref(db, "users/" + currentUser.uid), function (snapshot) {
      const data = snapshot.val()
      if (data) {
        setIsDonor(Boolean(data.isDonor))
      } else {
        setIsDonor(false)
      }
    })

    const unsubscribeRequests = onValue(ref(db, "requests"), function (snapshot) {
      const data = snapshot.val()
      if (data) {
        const donations = Object.values(data).filter(function (request) {
          return request && request.donorId === currentUser.uid && request.status === "completed"
        })
        setCompletedDonations(donations.length)
      } else {
        setCompletedDonations(0)
      }
      setLoading(false)
    })

    return function () {
      unsubscribeProfile()
      unsubscribeRequests()
    }
  }, [currentUser])

  const currentBadge = getBadgeFromDonations(completedDonations)
  const nextBadge = getNextBadge(completedDonations)
  const badgeProgress = useMemo(function () {
    if (!currentBadge && !nextBadge) return 0
    if (!currentBadge) return 0
    if (!nextBadge) return 100
    const start = currentBadge.min
    const end = nextBadge.min
    if (end === start) return 100
    const prog = ((completedDonations - start) / (end - start)) * 100
    return Math.min(Math.max(prog, 0), 100)
  }, [completedDonations, currentBadge, nextBadge])

  const nextDonationTarget = nextBadge ? Math.max(nextBadge.min - completedDonations, 0) : 0
  const badgeLabel = currentBadge ? currentBadge.name : "New Donor"
  const badgeEmoji = currentBadge ? currentBadge.emoji : "🏅"

  async function handleShare() {
    const text = "I have completed " + completedDonations +
      " blood donation(s) on LifeStream Mobile! " +
      "Badge: " + badgeLabel + " " + badgeEmoji +
      " 🩸 #LifeStreamMobile #BloodDonation"

    try {
      await Share.share({
        message: text
      })
    } catch (err) {
      console.log("Share error:", err)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header Hero Card */}
        <View className="bg-red-600 rounded-3xl p-5 shadow-md flex flex-row items-center gap-3.5 mb-4">
          <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
            <Trophy size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black text-white tracking-tight">Certifications & Badges</Text>
            <Text className="text-red-100 text-xs font-semibold mt-0.5">Track your lifesaving donor achievements</Text>
          </View>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-12">
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        ) : !isDonor ? (
          <View className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center my-4">
            <Text className="text-5xl mb-3">🎖️</Text>
            <Text className="text-lg font-extrabold text-slate-900">Start Donating to Earn Badges</Text>
            <Text className="text-xs text-slate-500 font-medium mt-1 text-center">
              Register as an active donor and complete verified donations to unlock badges and honors!
            </Text>
            <TouchableOpacity
              onPress={() => navigate("/profile")}
              className="mt-5 bg-red-600 py-3.5 px-6 rounded-2xl shadow-xs"
            >
              <Text className="text-white text-xs font-extrabold uppercase tracking-wider">Become a Donor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex flex-col gap-4">
            {/* Current Level Card */}
            <View className="bg-red-600 rounded-3xl p-6 shadow-md border border-red-700 flex flex-col gap-4">
              <View className="flex flex-row items-center gap-4">
                <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                  <Text className="text-3xl">{currentBadge ? currentBadge.emoji : "🏅"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-red-200 text-[10px] uppercase tracking-wider font-extrabold">Current Rank</Text>
                  <Text className="text-2xl font-black text-white tracking-tight">{currentBadge ? currentBadge.name : "New Donor"}</Text>
                  <Text className="text-red-100 text-xs font-medium mt-0.5">{completedDonations + " donation(s) completed"}</Text>
                </View>
              </View>

              <View className="flex flex-col gap-1.5 pt-2">
                <View className="flex flex-row justify-between text-xs text-red-100 font-extrabold">
                  <Text className="text-red-100 font-bold text-xs">Progress to next rank</Text>
                  <Text className="text-white font-extrabold text-xs">{Math.round(badgeProgress) + "%"}</Text>
                </View>
                <View className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: badgeProgress + "%" }}
                  />
                </View>
                <Text className="text-[11px] text-red-100 font-medium">
                  {nextBadge ? nextDonationTarget + " more donation(s) to reach " + nextBadge.name : "Maximum Diamond rank achieved!"}
                </Text>
              </View>
            </View>

            {/* All Badges List */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col gap-3">
              <View className="flex flex-row items-center gap-2 border-b border-slate-100 pb-3">
                <Award size={18} color="#dc2626" />
                <Text className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">All Badges</Text>
              </View>

              <View className="flex flex-col gap-3 pt-1">
                {BADGES.map((badge) => {
                  const earned = completedDonations >= badge.min
                  const badgeCountLabel = badge.min === 20 ? "20+ donations" : badge.min + "-" + badge.max + " donations"
                  return (
                    <View
                      key={badge.key}
                      className={
                        "rounded-2xl p-4 border flex flex-row items-center justify-between gap-3 " +
                        (earned
                          ? "border-emerald-200 bg-emerald-50/50 shadow-xs"
                          : "border-slate-200 bg-slate-50 opacity-60")
                      }
                    >
                      <View className="flex flex-row items-center gap-3 flex-1 min-w-0">
                        <Text className="text-3xl">{badge.emoji}</Text>
                        <View className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <Text className="text-sm font-extrabold text-slate-900">{badge.name}</Text>
                          <Text className="text-[11px] text-slate-500 font-medium">{badgeCountLabel}</Text>
                          <Text className={"text-[11px] font-bold mt-0.5 " + (earned ? "text-emerald-700" : "text-slate-400")}>
                            {earned ? "Achievement Unlocked!" : badge.min + " donation(s) required"}
                          </Text>
                        </View>
                      </View>

                      {earned ? (
                        <View className="bg-emerald-600 px-3 py-1.5 rounded-full flex flex-row items-center gap-1">
                          <Check size={12} color="#ffffff" />
                          <Text className="text-white text-[10px] font-black uppercase">Earned</Text>
                        </View>
                      ) : (
                        <View className="bg-slate-200 px-3 py-1.5 rounded-full flex flex-row items-center gap-1">
                          <Lock size={12} color="#475569" />
                          <Text className="text-slate-600 text-[10px] font-bold uppercase">Locked</Text>
                        </View>
                      )}
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Achievements List */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col gap-3">
              <View className="flex flex-row items-center gap-2 border-b border-slate-100 pb-3">
                <Trophy size={18} color="#dc2626" />
                <Text className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Milestones & Trophies</Text>
              </View>

              <View className="flex flex-col gap-2.5 pt-1">
                {ACHIEVEMENTS.map((achievement) => {
                  const earned = completedDonations >= achievement.threshold
                  return (
                    <View
                      key={achievement.key}
                      className={
                        "rounded-2xl p-3.5 flex flex-row items-center gap-3 border " +
                        (earned ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50 opacity-60")
                      }
                    >
                      <Text className="text-2xl">{earned ? achievement.emoji : "🔒"}</Text>
                      <View className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <Text className={"text-xs font-extrabold " + (earned ? "text-slate-900" : "text-slate-500")}>
                          {achievement.title}
                        </Text>
                        <Text className={"text-[11px] " + (earned ? "text-emerald-700 font-semibold" : "text-slate-400 font-medium")}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShare}
              className="w-full bg-red-600 py-4 rounded-2xl shadow-md flex flex-row items-center justify-center gap-2 mt-1 active:opacity-90"
            >
              <Share2 size={18} color="#ffffff" />
              <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Share My Achievements</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
