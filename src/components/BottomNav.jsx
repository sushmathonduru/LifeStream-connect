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
          width: "280px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #fff 0%, #fff7f7 100%)",
          borderRight: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
        }}
      >
        <div style={{
          padding: "26px 22px 18px",
          borderBottom: "1px solid #f3f4f6",
          background: "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(255,255,255,0.9))",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "46px",
              height: "46px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
              boxShadow: "0 12px 24px rgba(220,38,38,0.2)",
            }}>
              🩸
            </div>
            <div>
              <p style={{
                fontWeight: "700",
                fontSize: "17px",
                color: "#111827",
                lineHeight: "1.3",
              }}>
                Lifestream
              </p>
              <p style={{
                fontSize: "12px",
                color: "#9ca3af",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
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
                  borderRadius: "16px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: active
                    ? "#fff1f2" : "transparent",
                  color: active ? "#dc2626" : "#6b7280",
                  fontWeight: active ? "700" : "500",
                  fontSize: "15px",
                  transition: "all 0.15s ease",
                  boxShadow: active ? "inset 0 0 0 1px rgba(220,38,38,0.08)" : "none",
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
                    boxShadow: "0 0 0 4px rgba(220,38,38,0.12)",
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
