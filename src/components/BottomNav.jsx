import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import {
  Home, Search, AlertCircle,
  Bell, User, Award
} from "lucide-react"

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = onValue(
      ref(db, "notifications/" + currentUser.uid),
      (snap) => {
        const data = snap.val()
        if (data) {
          const count = Object.values(data).filter(
            (n) => !n.read
          ).length
          setUnreadCount(count)
        } else {
          setUnreadCount(0)
        }
      }
    )
    return () => unsubscribe()
  }, [currentUser])

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Search, label: "Find", path: "/find-donor" },
    { icon: AlertCircle, label: "Emergency", path: "/emergency" },
    { icon: Award, label: "Badges", path: "/certifications" },
    { icon: Bell, label: "Alerts", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-slate-200/80 shrink-0 sticky top-0 z-30 select-none">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-xl shadow-md text-white">
              🩸
            </div>
            <div>
              <p className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                LifeStream
              </p>
              <p className="text-xs font-semibold text-red-600 mt-0.5">
                Emergency Network
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-150 text-left w-full ${
                  active
                    ? "bg-red-50 text-red-600 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="relative shrink-0">
                  <Icon size={20} className={active ? "text-red-600" : "text-slate-400"} />
                  {item.label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {active && (
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        {currentUser && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <div className="w-9 h-9 bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center text-sm uppercase">
                {currentUser.email ? currentUser.email.charAt(0) : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser.displayName || currentUser.email || "User"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Logged in</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 z-50 justify-around items-center py-2 px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                active ? "text-red-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="relative">
                <Icon size={22} className={active ? "text-red-600" : "text-slate-400"} />
                {item.label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-semibold ${active ? "text-red-600 font-bold" : "text-slate-500"}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
