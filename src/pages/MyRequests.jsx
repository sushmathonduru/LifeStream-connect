import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { ChevronRight } from "lucide-react"

function getStatusStyle(status) {
  if (status === "pending") return "bg-yellow-100 text-yellow-700"
  if (status === "accepted") return "bg-blue-100 text-blue-700"
  if (status === "in-progress") return "bg-purple-100 text-purple-700"
  if (status === "completed") return "bg-green-100 text-green-700"
  return "bg-gray-100 text-gray-700"
}

export default function MyRequests() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("active")
  const [activeRequests, setActiveRequests] = useState([])
  const [completedRequests, setCompletedRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const requestsRef = ref(db, "requests")
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const allRequests = []
      if (snapshot.exists()) {
        const data = snapshot.val()
        Object.entries(data).forEach(function ([id, request]) {
          allRequests.push({ id: id, ...request })
        })
      }

      const mine = allRequests.filter(function (request) {
        return request.userId === currentUser.uid
      })
      setActiveRequests(mine.filter(function (request) {
        return request.status !== "completed"
      }))
      setCompletedRequests(mine.filter(function (request) {
        return request.status === "completed"
      }))
      setLoading(false)
    })

    return function () {
      unsubscribe()
    }
  }, [currentUser])

  const currentRequests = activeTab === "active" ? activeRequests : completedRequests

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xs text-white border border-white/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">My Blood Requests</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Track live status, matched donors, and donation fulfillment progress
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 flex gap-2 shadow-xs">
          <button
            onClick={() => setActiveTab("active")}
            className={
              "flex-1 py-3 rounded-xl text-xs font-extrabold transition-all " +
              (activeTab === "active"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100")
            }
          >
            Active Requests ({activeRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={
              "flex-1 py-3 rounded-xl text-xs font-extrabold transition-all " +
              (activeTab === "completed"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100")
            }
          >
            Completed Requests ({completedRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <p className="text-slate-800 font-bold text-base">
              {activeTab === "active"
                ? "No Active Blood Requests"
                : "No Completed Blood Requests"}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {activeTab === "active"
                ? "Submit a new blood request to find matched donors in your area."
                : "Completed donation requests will appear here once fulfilled."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRequests.map(function (request) {
              return (
                <div key={request.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-black">
                        Group {request.bloodGroup}
                      </span>
                      <span className={"px-3 py-1 rounded-full text-[11px] font-extrabold capitalize " + getStatusStyle(request.status)}>
                        ● {request.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-3">{request.patientName}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{request.hospital} • {request.city}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                      <span>{request.units} Unit(s) Needed</span>
                      <span className="text-slate-400 font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {(request.status === "accepted" || request.status === "in-progress") && (
                    <button
                      onClick={() => navigate("/live-tracking", { state: { requestId: request.id } })}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all text-xs uppercase tracking-wider"
                    >
                      <span>Track Donor Live Location</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
