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
      <div
        className="hidden md:flex flex-col"
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
        }}
      >
        <div style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #f3f4f6",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#dc2626",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}>
              🩸
            </div>
            <div>
              <p style={{
                fontWeight: "700",
                fontSize: "16px",
                color: "#111827",
                lineHeight: "1.3",
              }}>
                Lifestream
              </p>
              <p style={{
                fontSize: "12px",
                color: "#9ca3af",
                fontWeight: "500",
              }}>
                Connect
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: "16px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: active
                    ? "#fef2f2" : "transparent",
                  color: active ? "#dc2626" : "#6b7280",
                  fontWeight: active ? "600" : "500",
                  fontSize: "15px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Icon size={21} />
                  {item.label === "Alerts" && unreadCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      width: "16px",
                      height: "16px",
                      backgroundColor: "#ef4444",
                      borderRadius: "50%",
                      fontSize: "9px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {active && (
                  <div style={{
                    marginLeft: "auto",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#dc2626",
                    borderRadius: "50%",
                  }} />
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
          borderTop: "1px solid #e5e7eb",
          zIndex: 50,
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 14px",
        }}
      >
        {navItems.map((item) => {
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
                gap: "4px",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: active ? "#dc2626" : "#9ca3af",
                minWidth: "48px",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={22} />
                {item.label === "Alerts" && unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "14px",
                    height: "14px",
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    fontSize: "8px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                  }}>
                    {unreadCount > 9 ? "9" : unreadCount}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "11px",
                fontWeight: active ? "600" : "500",
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
