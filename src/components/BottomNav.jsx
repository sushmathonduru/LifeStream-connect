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

  useEffect(function () {
    if (!currentUser) return

    const notifRef = ref(db, "notifications/" + currentUser.uid)
    const unsubscribe = onValue(notifRef, function (snapshot) {
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

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Search, label: "Find", path: "/find-donor" },
    { icon: AlertCircle, label: "Emergency", path: "/emergency" },
    { icon: Trophy, label: "Badges", path: "/certifications" },
    { icon: Bell, label: "Alerts", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  const isActive = function (path) {
    return location.pathname === path
  }

  return (
    <>
      <div
        className="hidden md:flex flex-col"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "white",
          borderRight: "1px solid #f3f4f6",
          boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "24px 20px 16px 20px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#dc2626",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🩸
            </div>
            <div>
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#1f2937",
                  lineHeight: "1.2",
                }}
              >
                Lifestream
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                }}
              >
                Connect
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navItems.map(function (item) {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: active ? "#fef2f2" : "transparent",
                  color: active ? "#dc2626" : "#6b7280",
                  fontWeight: active ? "600" : "500",
                  fontSize: "14px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Icon size={20} />
                  {item.label === "Alerts" && unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        width: "14px",
                        height: "14px",
                        backgroundColor: "#ef4444",
                        borderRadius: "50%",
                        fontSize: "9px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {active && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      backgroundColor: "#dc2626",
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #f3f4f6",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 0",
        }}
      >
        {navItems.map(function (item) {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                padding: "4px 8px",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: active ? "#dc2626" : "#9ca3af",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={20} />
                {item.label === "Alerts" && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#ef4444",
                      borderRadius: "50%",
                      fontSize: "8px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                    }}
                  >
                    {unreadCount > 9 ? "9" : unreadCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: active ? "600" : "500",
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
