import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ArrowLeft, Phone, MessageCircle, Clock, MapPin, Navigation } from "lucide-react"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const donorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function LiveTracking() {
  const [request, setRequest] = useState(null)
  const [donor, setDonor] = useState(null)
  const [donorLocation, setDonorLocation] = useState(null)
  const [hospitalLocation] = useState({ lat: 13.0569, lng: 80.2425 })
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [eta, setEta] = useState("Waiting for donor...")
  const [distance, setDistance] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const requestId = location.state?.requestId || null

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      return
    }
    const requestRef = ref(db, "requests/" + requestId)
    const unsubscribe = onValue(requestRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setRequest(data)
        if (data.status === "pending") setCurrentStep(1)
        if (data.status === "accepted") setCurrentStep(2)
        if (data.status === "in-progress") setCurrentStep(3)
        if (data.status === "completed") setCurrentStep(4)
        if (data.donorId) {
          onValue(ref(db, "users/" + data.donorId), (snap) => {
            if (snap.val()) setDonor(snap.val())
          })
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [requestId])

  useEffect(() => {
    if (!requestId) return
    const trackingRef = ref(db, "tracking/" + requestId + "/donorLocation")
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const loc = snapshot.val()
      if (loc && loc.lat && loc.lng) {
        setDonorLocation({ lat: loc.lat, lng: loc.lng })
        const R = 6371
        const dLat = (hospitalLocation.lat - loc.lat) * Math.PI / 180
        const dLon = (hospitalLocation.lng - loc.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(loc.lat * Math.PI / 180) *
          Math.cos(hospitalLocation.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const dist = (R * c).toFixed(1)
        setDistance(dist)
        const mins = Math.ceil((dist / 30) * 60)
        setEta(mins + " minutes")
      }
    })
    return () => unsubscribe()
  }, [requestId, hospitalLocation])

  const steps = [
    { id: 1, label: "Request Sent", desc: "Looking for donor" },
    { id: 2, label: "Donor Accepted", desc: "Donor preparing to leave" },
    { id: 3, label: "On The Way", desc: "Donor is coming to you" },
    { id: 4, label: "Completed", desc: "Donation successful" }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!requestId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <MapPin className="text-gray-300 mb-4" size={64} />
        <h2 className="text-xl font-bold text-gray-600 mb-2">No Active Tracking</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Go to My Requests and click Track on an accepted request
        </p>
        <button
          onClick={() => navigate("/my-requests")}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to My Requests
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all border border-white/30"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Live Donor Tracking</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Real-time navigation updates and estimated arrival time
              </p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {currentStep === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-amber-800 font-extrabold text-xs">
              ⏳ Broadcast sent — Waiting for matched local donors to accept...
            </p>
          </div>
        )}
        {currentStep === 2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-blue-800 font-extrabold text-xs">
              ✅ Donor accepted! Donor is preparing to travel...
            </p>
          </div>
        )}
        {currentStep === 3 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></div>
            <p className="text-rose-700 font-extrabold text-xs">Donor is actively traveling to your hospital!</p>
          </div>
        )}
        {currentStep === 4 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-emerald-800 font-extrabold text-xs">
              🎉 Donation successfully completed! Thank you!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Donor Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-600 text-white font-black text-xl rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                  {donor ? donor.name?.charAt(0).toUpperCase() : "D"}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {donor ? donor.name : "Finding donor..."}
                  </h3>
                  {donor && (
                    <span className="inline-block text-[10px] font-black bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full mt-1">
                      Group {donor.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
              {donor && donor.phone && (
                <div className="flex gap-2">
                  <a
                    href={"tel:" + donor.phone}
                    className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200"
                    title="Call Donor"
                  >
                    <Phone size={18} />
                  </a>
                  <a
                    href={"https://wa.me/" + donor.phone}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200"
                    title="WhatsApp Message"
                  >
                    <MessageCircle size={18} />
                  </a>
                </div>
              )}
            </div>

            {/* Route Map Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Navigation className="text-red-600" size={18} />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Route Map</span>
                </div>
                {eta && <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{eta}</span>}
              </div>
              {donorLocation ? (
                <MapContainer
                  center={[donorLocation.lat, donorLocation.lng]}
                  zoom={14}
                  style={{ width: "100%", height: "340px" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="OpenStreetMap contributors"
                  />
                  <Marker
                    position={[donorLocation.lat, donorLocation.lng]}
                    icon={donorIcon}
                  >
                    <Popup>{donor ? donor.name : "Donor"} is here</Popup>
                  </Marker>
                  <Marker
                    position={[hospitalLocation.lat, hospitalLocation.lng]}
                    icon={hospitalIcon}
                  >
                    <Popup>{request ? request.hospital : "Hospital"}</Popup>
                  </Marker>
                  <Polyline
                    positions={[
                      [donorLocation.lat, donorLocation.lng],
                      [hospitalLocation.lat, hospitalLocation.lng]
                    ]}
                    color="#dc2626"
                    weight={4}
                    dashArray="6, 6"
                  />
                </MapContainer>
              ) : (
                <div className="h-64 bg-slate-50 flex flex-col items-center justify-center p-6 text-center gap-2">
                  <MapPin className="text-slate-300" size={40} />
                  <p className="text-xs font-bold text-slate-700">Map View Unavailable</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {currentStep >= 3
                      ? "Waiting for live donor GPS signal..."
                      : "Live route map will activate when the donor initiates travel navigation."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Tracking Progress</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs " +
                        (step.id < currentStep
                          ? "bg-emerald-500 text-white"
                          : step.id === currentStep
                          ? "bg-red-600 text-white animate-pulse"
                          : "border border-slate-300 bg-slate-100 text-slate-400")
                      }>
                        {step.id < currentStep ? "✓" : step.id}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={
                          "w-0.5 h-10 mt-1 " +
                          (step.id < currentStep ? "bg-emerald-400" : "bg-slate-200")
                        } />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${step.id <= currentStep ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Summary Card */}
            {request && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Request Summary</h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="text-red-600 font-bold">{request.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hospital</span>
                    <span className="text-slate-800">{request.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">City</span>
                    <span className="text-slate-800">{request.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Units Required</span>
                    <span className="text-slate-800">{request.units} Unit(s)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}