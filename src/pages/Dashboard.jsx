import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, push } from "firebase/database"
import { Droplets, AlertCircle, Search, ClipboardList, Bell } from "lucide-react"
import BottomNav from "../components/BottomNav"

function getCurrentTimestamp() {
  return Date.now()
}

function getBadgeMeta(totalDonations) {
  if (totalDonations >= 20) {
    return { name: "Diamond Donor", emoji: "💠", min: 20, next: null, label: "Diamond" }
  }
  if (totalDonations >= 10) {
    return { name: "Platinum Donor", emoji: "💎", min: 10, next: 20, label: "Platinum" }
  }
  if (totalDonations >= 6) {
    return { name: "Gold Donor", emoji: "🥇", min: 6, next: 10, label: "Gold" }
  }
  if (totalDonations >= 3) {
    return { name: "Silver Donor", emoji: "🥈", min: 3, next: 6, label: "Silver" }
  }
  if (totalDonations >= 1) {
    return { name: "Bronze Donor", emoji: "🥉", min: 1, next: 3, label: "Bronze" }
  }
  return { name: "No Badge", emoji: "🏅", min: 0, next: 1, label: "Bronze" }
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null)
  const [donorCount, setDonorCount] = useState(0)
  const [myRequestCount, setMyRequestCount] = useState(0)
  const [emergencyCount, setEmergencyCount] = useState(0)
  const [availableRequests, setAvailableRequests] = useState([])
  const [completedDonations, setCompletedDonations] = useState(0)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return

    const unsubscribeUser = onValue(ref(db, "users/" + currentUser.uid), (snap) => {
      if (snap.val()) {
        setUserProfile(snap.val())
      } else {
        setUserProfile(null)
      }
    })

    const unsubscribeUsers = onValue(ref(db, "users"), (snap) => {
      const data = snap.val()
      if (data) {
        const donors = Object.values(data).filter(function (user) {
          return user && user.isDonor === true
        })
        setDonorCount(donors.length)
      } else {
        setDonorCount(0)
      }
    })

    const unsubscribeRequests = onValue(ref(db, "requests"), (snap) => {
      const data = snap.val()
      if (data) {
        const all = Object.entries(data).map(function ([id, request]) {
          return { id: id, ...request }
        })
        const mine = all.filter(function (request) {
          return request.userId === currentUser.uid
        })
        const available = all.filter(function (request) {
          return request.status === "pending" && request.userId !== currentUser.uid
        })
        const completed = all.filter(function (request) {
          return request.donorId === currentUser.uid && request.status === "completed"
        })

        setMyRequestCount(mine.length)
        setAvailableRequests(available)
        setCompletedDonations(completed.length)
      } else {
        setMyRequestCount(0)
        setAvailableRequests([])
        setCompletedDonations(0)
      }
    })

    const unsubscribeEmergency = onValue(ref(db, "emergency"), (snap) => {
      const data = snap.val()
      if (data) {
        const active = Object.values(data).filter(function (item) {
          return item && item.status === "active"
        })
        setEmergencyCount(active.length)
      } else {
        setEmergencyCount(0)
      }
    })

    return function () {
      unsubscribeUser()
      unsubscribeUsers()
      unsubscribeRequests()
      unsubscribeEmergency()
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

  const badgeMeta = getBadgeMeta(completedDonations)
  const nextBadgeTarget = badgeMeta.next
  const nextBadgeName = badgeMeta.next && badgeMeta.next === 3
    ? "Silver Donor"
    : badgeMeta.next && badgeMeta.next === 6
      ? "Gold Donor"
      : badgeMeta.next && badgeMeta.next === 10
        ? "Platinum Donor"
        : badgeMeta.next && badgeMeta.next === 20
          ? "Diamond Donor"
          : "Bronze Donor"

  const progress = badgeMeta.min === 0
    ? 0
    : badgeMeta.next
      ? ((completedDonations - badgeMeta.min) / (badgeMeta.next - badgeMeta.min)) * 100
      : 100

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:ml-20">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-4 md:px-8 lg:px-16 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-red-200 text-sm">{today}</p>
              <h1 className="text-white text-2xl font-bold mt-1">
                {getGreeting()}, {getName()}!
              </h1>
              {userProfile && userProfile.isDonor && (
                <button
                  onClick={() => navigate("/certifications")}
                  className="flex items-center gap-1 bg-white bg-opacity-20 border border-white border-opacity-30 text-white text-xs px-3 py-1.5 rounded-full mt-2"
                >
                  <span>{badgeMeta.emoji}</span>
                  <span>{badgeMeta.name}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <Bell className="text-white" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-red-600 font-bold text-3xl">{donorCount}</p>
              <p className="text-gray-500 text-xs mt-1">Donors</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-red-600 font-bold text-3xl">{myRequestCount}</p>
              <p className="text-gray-500 text-xs mt-1">My Requests</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-red-600 font-bold text-3xl">{emergencyCount}</p>
              <p className="text-gray-500 text-xs mt-1">Emergencies</p>
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

        {userProfile && userProfile.isDonor && nextBadgeTarget && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Badge progress</p>
                <p className="text-sm font-semibold text-gray-800">{badgeMeta.emoji} {badgeMeta.name}</p>
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
              {Math.max(nextBadgeTarget - completedDonations, 0)} more donations to reach {nextBadgeName}
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

      <BottomNav />
    </div>
  )
}