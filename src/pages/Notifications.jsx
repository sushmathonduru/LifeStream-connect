import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, remove } from "firebase/database"
import { Bell, CheckCheck, AlertCircle, Info, Heart } from "lucide-react"
import BottomNav from "../components/BottomNav"

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now())
  const [toast, setToast] = useState(null)
  const [prevCount, setPrevCount] = useState(0)
  const { currentUser } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now())
    }, 60000)

    return function () {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const notifRef = ref(db, "notifications/" + currentUser.uid)
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data)
          .map(function ([id, notif]) {
            return { id: id, ...notif }
          })
          .sort(function (a, b) {
            return b.createdAt - a.createdAt
          })
        const unreadList = list.filter(function (item) {
          return !item.read
        })
        if (unreadList.length > prevCount && prevCount !== 0) {
          const newest = unreadList[0]
          setToast(newest)
          setTimeout(function () {
            setToast(null)
          }, 4000)
        }
        setPrevCount(unreadList.length)
        setNotifications(list)
      } else {
        setNotifications([])
        setPrevCount(0)
      }
      setLoading(false)
    })
    return function () {
      unsubscribe()
    }
  }, [currentUser, prevCount])

  function formatTime(timestamp) {
    if (!timestamp) return ""
    const diff = nowTimestamp - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return mins + " min ago"
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs + " hr ago"
    return Math.floor(hrs / 24) + " days ago"
  }

  async function markAsRead(notifId) {
    await update(
      ref(db, "notifications/" + currentUser.uid + "/" + notifId),
      { read: true }
    )
  }

  async function markAllAsRead() {
    for (const notif of notifications) {
      if (!notif.read) {
        await update(
          ref(db, "notifications/" + currentUser.uid + "/" + notif.id),
          { read: true }
        )
      }
    }
  }

  async function deleteNotif(notifId) {
    await remove(ref(db, "notifications/" + currentUser.uid + "/" + notifId))
  }

  function getIcon(type) {
    if (type === "alert") return <AlertCircle className="text-red-500" size={20} />
    if (type === "success") return <Heart className="text-green-500" size={20} />
    return <Info className="text-blue-500" size={20} />
  }

  function getBorderColor(type) {
    if (type === "alert") return "border-l-4 border-red-500 bg-red-50"
    if (type === "success") return "border-l-4 border-green-500 bg-green-50"
    return "border-l-4 border-blue-500 bg-blue-50"
  }

  const unreadCount = notifications.filter(function (notification) {
    return !notification.read
  }).length

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:ml-20">
      {toast && (
        <div className={
          "fixed top-4 left-4 right-4 z-50 rounded-2xl p-4 " +
          "shadow-xl flex items-start gap-3 animate-bounce " +
          (toast.type === "alert"
            ? "bg-red-600 text-white"
            : "bg-green-600 text-white")
        }>
          <span className="text-2xl flex-shrink-0">
            {toast.type === "alert" ? "🚨" : "✅"}
          </span>
          <div className="flex-1">
            <p className="font-bold text-sm">{toast.title}</p>
            <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white opacity-70 text-lg"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-gradient-to-br from-red-600 to-red-800 px-4 md:px-8 pt-12 pb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bell className="text-red-600" size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-red-200 text-xs">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              You will see donor updates and alerts here
            </p>
          </div>
        )}

        {!loading &&
          notifications.map(function (notif) {
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={
                  "rounded-2xl p-4 cursor-pointer transition-all " +
                  getBorderColor(notif.type) +
                  (!notif.read ? " shadow-sm" : " opacity-70")
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={
                        "text-sm " + (!notif.read ? "font-semibold text-gray-800" : "font-medium text-gray-600")
                      }>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={function (e) {
                      e.stopPropagation()
                      deleteNotif(notif.id)
                    }}
                    className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
      </div>

      <BottomNav />
    </div>
  )
}