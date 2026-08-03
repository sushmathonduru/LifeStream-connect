import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { Home, Search, AlertCircle, Bell, User, Trophy } from "lucide-react"

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return

    const notifRef = ref(db, "notifications/" + currentUser.uid)
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const unread = Object.values(data).filter(function (item) {
          return item.read === false
        }).length
        setUnreadCount(unread)
      } else {
        setUnreadCount(0)
      }
    })

    return function () {
      unsubscribe()
    }
  }, [currentUser])

  const tabs = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Search, label: "Find", path: "/find-donor" },
    { icon: AlertCircle, label: "Emergency", path: "/emergency" },
    { icon: Trophy, label: "Badges", path: "/certifications" },
    { icon: Bell, label: "Alerts", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" }
  ]

  const sidebar = (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex-col items-center py-8 gap-6 z-40 border-r border-gray-100">
      {tabs.map(function ({ icon: Icon, label, path }) {
        const active = location.pathname === path
        const isAlertsTab = path === "/notifications"

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 text-xs relative"
          >
            <div
              className={
                active
                  ? "w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm relative"
                  : "w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 relative"
              }
            >
              <Icon size={20} />
              {isAlertsTab && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={active ? "font-semibold text-red-600" : "font-medium text-gray-500"}>{label}</span>
          </button>
        )
      })}
    </aside>
  )

  const mobile = (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden justify-around items-center py-2 z-50 shadow-lg">
      {tabs.map(function ({ icon: Icon, label, path }) {
        const active = location.pathname === path
        const isAlertsTab = path === "/notifications"

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 relative"
          >
            <div className="relative">
              <Icon size={20} className={active ? "text-red-600" : "text-gray-400"} />
              {isAlertsTab && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={active ? "text-[10px] font-medium text-red-600" : "text-[10px] font-medium text-gray-400"}>{label}</span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {sidebar}
      {mobile}
    </>
  )
}
