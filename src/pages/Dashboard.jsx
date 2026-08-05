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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-4 md:px-8 lg:px-16 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-red-200 text-sm">{today}</p>
              <h1 className="text-white text-2xl font-bold mt-1">
                {getGreeting()}, {getName()}!
              </h1>

              {userProfile && userProfile.isDonor && badgeEmoji && (
                <button
                  onClick={() => navigate("/certifications")}
                  className="flex items-center gap-2 bg-white bg-opacity-20 border border-white border-opacity-40 text-white text-sm px-4 py-2 rounded-full mt-2 font-medium"
                >
                  <span className="text-base">{badgeEmoji}</span>
                  <span>{badgeLabel}</span>
                </button>
              )}

              {userProfile && userProfile.isDonor && !badgeEmoji && (
                <button
                  onClick={() => navigate("/certifications")}
                  className="flex items-center gap-2 bg-white bg-opacity-20 border border-white border-opacity-40 text-white text-xs px-3 py-1.5 rounded-full mt-2"
                >
                  <span>🎖️</span>
                  <span>Start earning badges</span>
                </button>
              )}
            </div>

            <button
              onClick={() => navigate("/notifications")}
              className="relative w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30"
            >
              <Bell className="text-white" size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 px-4">
            <div className="bg-white rounded-2xl py-4 px-2 text-center shadow-md">
              <p className="text-red-600 font-extrabold text-3xl leading-none">
                {donorCount}
              </p>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                Donors
              </p>
            </div>

            <div className="bg-white rounded-2xl py-4 px-2 text-center shadow-md">
              <p className="text-red-600 font-extrabold text-3xl leading-none">
                {myRequestCount}
              </p>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                My Requests
              </p>
            </div>

            <div className="bg-white rounded-2xl py-4 px-2 text-center shadow-md">
              <p className="text-red-600 font-extrabold text-3xl leading-none">
                {emergencyCount}
              </p>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                Emergencies
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16 py-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/request-blood")}
            className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Droplets className="text-red-600" size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">Request Blood</p>
            <p className="text-xs text-gray-400 text-center">Create a new request</p>
          </button>

          <button
            onClick={() => navigate("/emergency")}
            className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">Emergency</p>
            <p className="text-xs text-gray-400 text-center">Broadcast alert</p>
          </button>

          <button
            onClick={() => navigate("/find-donor")}
            className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Search className="text-blue-600" size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">Find Donor</p>
            <p className="text-xs text-gray-400 text-center">Search donors</p>
          </button>

          <button
            onClick={() => navigate("/my-requests")}
            className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <ClipboardList className="text-green-600" size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">My Requests</p>
            <p className="text-xs text-gray-400 text-center">Track requests</p>
          </button>
        </div>

        {userProfile && userProfile.isDonor && badgeEmoji && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Badge progress</p>
                <p className="text-sm font-semibold text-gray-800">{badgeEmoji} {badgeLabel}</p>
              </div>
              <button
                onClick={() => navigate("/certifications")}
                className="text-xs text-red-600 font-medium"
              >
                View all
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400"
                style={{ width: Math.min(Math.max(progress, 0), 100) + "%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {nextBadgeTarget === null ? "You reached the highest badge level." : Math.max(nextBadgeTarget - donationCount, 0) + " more donations to reach the next badge."}
            </p>
          </div>
        )}

        {userProfile && userProfile.isDonor && matchingRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="font-semibold text-gray-800 text-sm mb-3">
              Available Requests for You
            </p>
            <div className="space-y-3">
              {matchingRequests.slice(0, 3).map(function (req) {
                return (
                  <div
                    key={req.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs">
                        {req.bloodGroup}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {req.patientName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {req.hospital} — {req.city}
                      </p>
                      <p className="text-xs text-gray-400">
                        {req.units} unit(s) needed
                      </p>
                    </div>
                    <button
                      onClick={() => acceptRequest(req)}
                      className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0"
                    >
                      Accept
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {userProfile && userProfile.isDonor && matchingRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="font-semibold text-gray-800 text-sm mb-1">
              Available Requests
            </p>
            <p className="text-xs text-gray-400">
              No pending requests matching your blood group right now.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}