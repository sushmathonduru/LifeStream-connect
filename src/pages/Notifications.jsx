import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update, remove } from "firebase/database"
import { Bell, CheckCheck, AlertCircle, Info, Heart } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {toast && (
        <div className={
          "fixed top-4 right-4 z-50 rounded-2xl p-4 shadow-xl border flex items-start gap-3 max-w-sm transition-all " +
          (toast.type === "alert"
            ? "bg-rose-600 text-white border-rose-700"
            : "bg-emerald-600 text-white border-emerald-700")
        }>
          <span className="text-xl shrink-0">
            {toast.type === "alert" ? "🚨" : "✅"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-xs">{toast.title}</p>
            <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white/80 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-white/20 backdrop-blur-xs text-white border border-white/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-white text-red-600 rounded-full text-[10px] flex items-center justify-center font-black shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Alerts & Notifications</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread emergency alerts & donor notifications` : "Stay updated on blood requests and donor responses"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-white/30 shrink-0"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <Bell className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-800 font-bold text-base">No Notifications Yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Emergency alerts and donor response updates will appear here.
              </p>
            </div>
          )}

          {!loading &&
            notifications.map(function (notif) {
              const isAlert = notif.type === "alert"
              const isSuccess = notif.type === "success"
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={
                    "bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs flex items-start gap-4 hover:border-slate-300 " +
                    (isAlert
                      ? "border-l-4 border-l-rose-500 border-slate-200/80"
                      : isSuccess
                        ? "border-l-4 border-l-emerald-500 border-slate-200/80"
                        : "border-l-4 border-l-blue-500 border-slate-200/80") +
                    (!notif.read ? " bg-slate-50/50 font-semibold" : " opacity-75")
                  }
                >
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm tracking-tight ${!notif.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-2">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={function (e) {
                      e.stopPropagation()
                      deleteNotif(notif.id)
                    }}
                    className="text-slate-300 hover:text-slate-500 text-xs shrink-0 p-1"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}