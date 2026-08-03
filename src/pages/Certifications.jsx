import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { Award, Check, Lock, Trophy } from "lucide-react"
import BottomNav from "../components/BottomNav"

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
        const donations = Object.values(data).filter(
          (request) => request.donorId === currentUser.uid && request.status === "completed"
        )
        setCompletedDonations(donations.length)
      } else {
        setCompletedDonations(0)
      }
      setLoading(false)
    })

    return () => {
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

  async function handleShare() {
    const badgeName = currentBadge ? currentBadge.name : "New Donor"
    const shareText = "I have completed " + completedDonations + " blood donations on Lifestream Connect! Badge: " + badgeName + " 🩸"

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lifestream Connect Achievement",
          text: shareText
        })
        return
      } catch (error) {
        console.log("Share cancelled:", error)
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText)
        alert("Copied!")
      } catch (error) {
        console.log("Clipboard error:", error)
        alert("Copied!")
      }
      return
    }

    alert("Copied!")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-4 md:px-8 lg:px-16 pt-12 pb-8">
        <div className="max-w-4xl mx-auto md:ml-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">My Certifications</h1>
              <p className="text-red-100 text-sm">Your donation achievements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 md:ml-20 pb-6 pt-6 space-y-6">
        {!isDonor ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
            <div className="text-5xl mb-3">🎖️</div>
            <h2 className="text-2xl font-bold text-gray-800">Start Donating to Earn Badges</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Register as a donor and complete donations to earn badges and certificates
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-5 bg-red-600 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Become a Donor
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{currentBadge ? currentBadge.emoji : "🏅"}</div>
                <div>
                  <p className="text-red-100 text-xs uppercase tracking-wide">Current badge</p>
                  <h2 className="text-3xl font-bold mt-1">{currentBadge ? currentBadge.name : "No Badge"}</h2>
                  <p className="text-red-100 text-sm mt-1">{completedDonations} donations completed</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-red-100 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(badgeProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: badgeProgress + "%" }}
                  ></div>
                </div>
                <p className="text-xs text-red-100 mt-3">
                  {nextBadge ? nextDonationTarget + " more donations to reach " + nextBadge.name : "You have reached the highest badge level!"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-red-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">All Badges</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGES.map((badge) => {
                  const earned = completedDonations >= badge.min
                  const badgeCount = badge.min === 20 ? "20+" : badge.min + "-" + badge.max
                  return (
                    <div
                      key={badge.key}
                      className={
                        earned
                          ? "rounded-2xl p-4 border border-green-200 bg-gradient-to-br " + badge.color + " text-white shadow-md"
                          : "rounded-2xl p-4 border border-gray-200 bg-gray-100 text-gray-500"
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-3xl">{badge.emoji}</div>
                        {earned ? (
                          <span className="inline-flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-2 py-1 text-[10px] font-semibold">
                            <Check size={12} /> Earned!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-lg font-bold">{badge.name}</p>
                      <p className="text-xs opacity-90 mt-1">{badgeCount} donations</p>
                      <p className={earned ? "text-xs mt-2 text-white text-opacity-90" : "text-xs mt-2 text-gray-500"}>
                        {earned ? "Earned!" : badge.min + " donations needed"}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-red-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
              </div>
              <div className="space-y-3">
                {ACHIEVEMENTS.map((achievement) => {
                  const earned = completedDonations >= achievement.threshold
                  return (
                    <div
                      key={achievement.key}
                      className={
                        earned
                          ? "rounded-2xl p-3 flex items-center gap-3 border border-green-200 bg-green-50"
                          : "rounded-2xl p-3 flex items-center gap-3 border border-gray-200 bg-gray-100"
                      }
                    >
                      <div className={earned ? "w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm" : "w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm text-gray-400"}>
                        {earned ? achievement.emoji : "🔒"}
                      </div>
                      <div className="flex-1">
                        <p className={earned ? "font-semibold text-gray-800" : "font-semibold text-gray-500"}>{achievement.title}</p>
                        <p className={earned ? "text-xs text-green-700" : "text-xs text-gray-500"}>{achievement.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <ShareIcon />
                Share My Achievement
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 0 6h.17A3 3 0 0 0 15 8Z" />
      <path d="M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="M18 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="m8.5 15.5 7-5" />
      <path d="m15.5 8.5-7 5" />
    </svg>
  )
}
