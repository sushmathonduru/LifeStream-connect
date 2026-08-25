import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { Award, Check, Lock, Trophy } from "lucide-react"

const BADGES = [
  {
    key: "bronze",
    name: "Bronze",
    emoji: "🥉",
    min: 1,
    max: 2,
    description: "First steps in giving life",
    color: "from-amber-500 to-orange-500"
  },
  {
    key: "silver",
    name: "Silver",
    emoji: "🥈",
    min: 3,
    max: 5,
    description: "Reliable donor support",
    color: "from-slate-400 to-gray-500"
  },
  {
    key: "gold",
    name: "Gold",
    emoji: "🥇",
    min: 6,
    max: 9,
    description: "A shining community helper",
    color: "from-yellow-400 to-amber-500"
  },
  {
    key: "platinum",
    name: "Platinum",
    emoji: "💎",
    min: 10,
    max: 19,
    description: "A trusted blood champion",
    color: "from-cyan-400 to-sky-500"
  },
  {
    key: "diamond",
    name: "Diamond",
    emoji: "💠",
    min: 20,
    max: 999,
    description: "Legend of lifesaving",
    color: "from-violet-500 to-indigo-600"
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
  if (totalDonations >= 20) {
    return BADGES[4]
  }
  if (totalDonations >= 10) {
    return BADGES[3]
  }
  if (totalDonations >= 6) {
    return BADGES[2]
  }
  if (totalDonations >= 3) {
    return BADGES[1]
  }
  if (totalDonations >= 1) {
    return BADGES[0]
  }
  return null
}

function getNextBadge(totalDonations) {
  if (totalDonations >= 20) {
    return null
  }
  if (totalDonations >= 10) {
    return BADGES[4]
  }
  if (totalDonations >= 6) {
    return BADGES[3]
  }
  if (totalDonations >= 3) {
    return BADGES[2]
  }
  if (totalDonations >= 1) {
    return BADGES[1]
  }
  return BADGES[0]
}

export default function Certifications() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [completedDonations, setCompletedDonations] = useState(0)
  const [isDonor, setIsDonor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const unsubscribeProfile = onValue(ref(db, "users/" + currentUser.uid), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setIsDonor(Boolean(data.isDonor))
      } else {
        setIsDonor(false)
      }
    })

    const unsubscribeRequests = onValue(ref(db, "requests"), (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const donations = Object.values(data).filter(function (request) {
          return request.donorId === currentUser.uid && request.status === "completed"
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
  const badgeProgress = useMemo(() => {
    if (!currentBadge && !nextBadge) {
      return 0
    }
    if (!currentBadge) {
      return 0
    }
    if (!nextBadge) {
      return 100
    }
    const start = currentBadge.min
    const end = nextBadge.min
    if (end === start) {
      return 100
    }
    const progress = ((completedDonations - start) / (end - start)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }, [completedDonations, currentBadge, nextBadge])

  const nextDonationTarget = nextBadge ? Math.max(nextBadge.min - completedDonations, 0) : 0
  const badgeLabel = currentBadge ? currentBadge.name : "New Donor"
  const badgeEmoji = currentBadge ? currentBadge.emoji : "🏅"
  const donationCount = completedDonations

  async function handleShare() {
    const text = "I have completed " + donationCount +
      " blood donations on Lifestream Connect! " +
      "Badge: " + badgeLabel + " " + badgeEmoji +
      " 🩸 #LifestreamConnect #BloodDonation"

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Lifestream Connect Achievement",
          text: text,
          url: "https://life-stream-connect.vercel.app"
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(function () {
          setCopied(false)
        }, 3000)
      } catch (err) {
        alert("Copy this: " + text)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xs text-white border border-white/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
              🏆
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">My Certifications & Badges</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Celebrate your life-saving donations and track milestone achievements
              </p>
            </div>
          </div>
        </div>

        {!isDonor ? (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎖️
            </div>
            <h2 className="text-xl font-bold text-slate-900">Start Donating to Earn Badges</h2>
            <p className="text-slate-500 mt-2 text-xs leading-relaxed">
              Register as an active donor and complete verified blood donations to unlock certificates and badges.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
            >
              <span>Become a Donor</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          <>
            {/* Current Status Card */}
            <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-4xl shadow-xs shrink-0 border border-white/30">
                    {currentBadge ? currentBadge.emoji : "🏅"}
                  </div>
                  <div>
                    <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                      Current Rank
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight text-white">
                      {currentBadge ? currentBadge.name : "New Donor"}
                    </h2>
                    <p className="text-red-100 text-xs font-semibold mt-1 flex items-center gap-1.5">
                      <span>🩸</span> {completedDonations} {completedDonations === 1 ? "donation" : "donations"} completed
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-xs rounded-xl p-4 border border-white/20 sm:min-w-40 text-center sm:text-right">
                  <p className="text-[11px] text-red-100 font-semibold uppercase tracking-wider">Progress</p>
                  <p className="text-2xl font-black text-white mt-0.5">{Math.round(badgeProgress)}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 pt-5 border-t border-white/20">
                <div className="flex justify-between items-center text-xs text-white font-bold mb-2">
                  <span>Level Progress</span>
                  <span>{Math.round(badgeProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-black/30 rounded-full p-0.5 overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: badgeProgress + "%" }}
                  />
                </div>
                <p className="text-xs text-red-100 font-semibold mt-2.5 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>
                    {nextBadge
                      ? `${nextDonationTarget} more ${nextDonationTarget === 1 ? "donation" : "donations"} needed to reach ${nextBadge.name}`
                      : "Highest donor badge tier unlocked! You are a community hero!"}
                  </span>
                </p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Donation Badges</h3>
                    <p className="text-xs text-slate-500 font-medium">Unlock higher ranks as you donate</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES.map(function (badge) {
                  const earned = completedDonations >= badge.min
                  const badgeCount = badge.min === 20 ? "20+ donations" : `${badge.min}-${badge.max} donations`
                  return (
                    <div
                      key={badge.key}
                      className={
                        earned
                          ? "rounded-2xl p-5 border border-amber-400 bg-amber-500 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-md flex flex-col justify-between relative overflow-hidden transition-transform hover:-translate-y-0.5"
                          : "rounded-2xl p-5 border border-slate-200 bg-slate-50 text-slate-700 flex flex-col justify-between"
                      }
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{badge.emoji}</span>
                          {earned ? (
                            <span className="inline-flex items-center gap-1 bg-white/25 backdrop-blur-xs text-white rounded-full px-2.5 py-1 text-[11px] font-extrabold border border-white/30">
                              <Check size={13} /> Earned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 rounded-full px-2.5 py-1 text-[11px] font-bold">
                              <Lock size={12} /> Locked
                            </span>
                          )}
                        </div>
                        <h4 className={`text-lg font-black mt-3 ${earned ? "text-white" : "text-slate-900"}`}>
                          {badge.name}
                        </h4>
                        <p className={`text-xs font-medium mt-1 ${earned ? "text-amber-100" : "text-slate-500"}`}>
                          {badge.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between text-xs font-bold">
                        <span>{badgeCount}</span>
                        <span className={earned ? "text-amber-100" : "text-slate-400 font-medium"}>
                          {earned ? "Active Tier" : `${badge.min} needed`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Milestone Achievements</h3>
                  <p className="text-xs text-slate-500 font-medium">Track individual life-saving goals</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ACHIEVEMENTS.map(function (achievement) {
                  const earned = completedDonations >= achievement.threshold
                  return (
                    <div
                      key={achievement.key}
                      className={
                        earned
                          ? "rounded-2xl p-4 flex items-center gap-4 border border-emerald-200 bg-emerald-50 text-slate-900 shadow-2xs"
                          : "rounded-2xl p-4 flex items-center gap-4 border border-slate-200 bg-slate-50 text-slate-500"
                      }
                    >
                      <div
                        className={
                          earned
                            ? "w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-2xl shadow-xs shrink-0"
                            : "w-12 h-12 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-xl text-slate-400 shrink-0"
                        }
                      >
                        {earned ? achievement.emoji : "🔒"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-bold text-sm truncate ${earned ? "text-slate-900" : "text-slate-700"}`}>
                            {achievement.title}
                          </p>
                          {earned && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${earned ? "text-emerald-800 font-semibold" : "text-slate-500"}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Share Achievement Card */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-8 text-center space-y-4">
              <h3 className="text-lg font-black text-slate-900">Share Your Impact</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Inspire friends and family to donate blood by sharing your donor rank and verified achievements.
              </p>
              <button
                onClick={handleShare}
                className="w-full sm:w-auto bg-red-600 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2.5 mx-auto transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
              >
                <span className="text-base">📤</span>
                <span>Share My Achievements</span>
              </button>
              {copied && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 max-w-sm mx-auto">
                  <p className="text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                    <span>✅</span> Achievement summary copied to clipboard!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
