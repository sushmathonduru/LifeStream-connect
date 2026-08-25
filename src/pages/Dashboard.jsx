import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, push } from "firebase/database"
import { Droplets, AlertCircle, Search, ClipboardList, Bell } from "lucide-react"

function getCurrentTimestamp() {
  return Date.now()
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null)
  const [donorCount, setDonorCount] = useState(0)
  const [myRequestCount, setMyRequestCount] = useState(0)
  const [emergencyCount, setEmergencyCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [availableRequests, setAvailableRequests] = useState([])
  const [completedDonations, setCompletedDonations] = useState(0)
  const [donationCount, setDonationCount] = useState(0)
  const [badgeEmoji, setBadgeEmoji] = useState("")
  const [badgeLabel, setBadgeLabel] = useState("")
  const { currentUser } = useAuth()
  const navigate = useNavigate()

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
        setCompletedDonations(completed.length)
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
        setCompletedDonations(0)
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
    if (currentUser && currentUser.email) return currentUser.email.split("@")[0]
    return "User"
  }

  const today = new Date().toLocaleDateString("en-IN", {
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

  const nextBadgeName = donationCount >= 20
    ? "Highest badge reached"
    : donationCount >= 10
      ? "Diamond Donor"
      : donationCount >= 6
        ? "Platinum Donor"
        : donationCount >= 3
          ? "Gold Donor"
          : donationCount >= 1
            ? "Silver Donor"
            : "Bronze Donor"

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card - Red Background */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div>
            <span className="text-xs font-bold text-red-100 uppercase tracking-wider">{today}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {getGreeting()}, {getName()}!
            </h1>
            <p className="text-red-100 text-xs font-medium mt-1">
              LifeStream Emergency Blood Network Dashboard
            </p>

            {userProfile && userProfile.isDonor && (
              <div className="mt-3">
                {badgeEmoji ? (
                  <button
                    onClick={() => navigate("/certifications")}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs border border-white/30 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full hover:bg-white/30 transition-all shadow-2xs"
                  >
                    <span className="text-base">{badgeEmoji}</span>
                    <span>{badgeLabel}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/certifications")}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition-all"
                  >
                    <span>🎖️</span>
                    <span>Start earning badges</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center border border-white/30"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center">
            <p className="text-3xl font-black text-red-600 tracking-tight">{donorCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Active Donors</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center">
            <p className="text-3xl font-black text-slate-800 tracking-tight">{myRequestCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">My Requests</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center">
            <p className="text-3xl font-black text-rose-600 tracking-tight">{emergencyCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Emergencies</p>
          </div>
        </div>

        {/* Action Shortcuts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/request-blood")}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center text-center gap-3 hover:border-red-300 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets size={24} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Request Blood</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Standard request</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/emergency")}
            className="bg-white rounded-2xl border border-rose-200 p-5 flex flex-col items-center text-center gap-3 hover:border-rose-400 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-extrabold text-rose-700 text-sm">Emergency</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Broadcast alert</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/find-donor")}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Find Donor</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Search map & list</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/my-requests")}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center text-center gap-3 hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">My Requests</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track live status</p>
            </div>
          </button>
        </div>

        {/* Badge Progress section if donor */}
        {userProfile && userProfile.isDonor && badgeEmoji && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Badge Progress</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{badgeEmoji} {badgeLabel}</p>
              </div>
              <button
                onClick={() => navigate("/certifications")}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                View all badges →
              </button>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                style={{ width: Math.min(Math.max(progress, 0), 100) + "%" }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {nextBadgeTarget === null
                ? "Highest donor badge tier unlocked."
                : `${Math.max(nextBadgeTarget - donationCount, 0)} more completed donations to reach the next rank.`}
            </p>
          </div>
        )}

        {/* Available Requests */}
        {userProfile && userProfile.isDonor && matchingRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Available Requests Matching Your Blood Group
            </h3>
            <div className="space-y-3">
              {matchingRequests.slice(0, 4).map(function (req) {
                return (
                  <div
                    key={req.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.patientName}</p>
                        <p className="text-xs text-slate-500 font-medium">{req.hospital} — {req.city}</p>
                        <span className="inline-block text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-1">
                          {req.units} unit(s) needed
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => acceptRequest(req)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98] self-start sm:self-center"
                    >
                      Accept Donation
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {userProfile && userProfile.isDonor && matchingRequests.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center py-8">
            <p className="font-bold text-slate-700 text-sm">No Pending Requests</p>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no urgent requests matching your blood group in your area.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}