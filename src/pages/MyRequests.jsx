import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { ChevronRight } from "lucide-react"
import BottomNav from "../components/BottomNav"

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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        </div>
        <div className="bg-white rounded-2xl p-2 flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={
              activeTab === "active"
                ? "flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold"
                : "flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            }
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={
              activeTab === "completed"
                ? "flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold"
                : "flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            }
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
            {activeTab === "active"
              ? "No active blood requests yet."
              : "No completed requests yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {currentRequests.map(function (request) {
              return (
                <div key={request.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      {request.bloodGroup}
                    </div>
                    <div className={"px-3 py-1 rounded-full text-xs font-semibold " + getStatusStyle(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>

                  <h2 className="text-gray-900 font-bold text-lg mb-1">{request.patientName}</h2>
                  <p className="text-gray-500 text-sm">{request.hospital} and {request.city}</p>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>{request.units} Units</span>
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>

                  {(request.status === "accepted" || request.status === "in-progress") && (
                    <button
                      onClick={() => navigate("/live-tracking", { state: { requestId: request.id } })}
                      className="mt-4 w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <ChevronRight size={18} />
                      Track
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
