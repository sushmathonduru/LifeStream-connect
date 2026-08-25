import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { ref, onValue, update, push } from "firebase/database";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Navigation, Phone, CheckCircle, MapPin, Clock, ExternalLink } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const donorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DonorTracking() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.state?.requestId || null;
  const mapRef = useRef(null);
  const watchId = useRef(null);

  const [request, setRequest] = useState(null);
  const [requester, setRequester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donorLocation, setDonorLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState({ lat: 13.0569, lng: 80.2425 });
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState("accepted");
  const [eta, setEta] = useState("Calculating...");
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    const requestRef = ref(db, "requests/" + requestId);
    onValue(requestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRequest(data);
        setStatus(data.status || "accepted");
        if (data.userId) {
          onValue(ref(db, "users/" + data.userId), (snap) => {
            if (snap.val()) setRequester(snap.val());
          });
        }
        if (data.hospitalLat && data.hospitalLng) {
          setHospitalLocation({ lat: Number(data.hospitalLat), lng: Number(data.hospitalLng) });
        } else if (data.hospital || data.city) {
          const queryText = (data.hospital ? data.hospital + " " : "") + (data.city || "");
          fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(queryText))
            .then((res) => res.json())
            .then((results) => {
              if (results && results.length > 0) {
                setHospitalLocation({
                  lat: parseFloat(results[0].lat),
                  lng: parseFloat(results[0].lon)
                });
              }
            })
            .catch((err) => console.log("Geocoding error:", err));
        }
      }
      setLoading(false);
    });
  }, [requestId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDonorLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.log("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const [geofenceAlert, setGeofenceAlert] = useState(false);

  useEffect(() => {
    if (donorLocation && hospitalLocation) {
      const R = 6371;
      const dLat = (hospitalLocation.lat - donorLocation.lat) * Math.PI / 180;
      const dLon = (hospitalLocation.lng - donorLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(donorLocation.lat * Math.PI / 180) *
        Math.cos(hospitalLocation.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = R * c;
      const distMeters = distKm * 1000;
      const distFormatted = distKm < 1 ? Math.round(distMeters) + " m" : distKm.toFixed(1) + " km";
      setDistance(distFormatted);

      if (distMeters <= 100 || distKm <= 0.1 || (Math.abs(dLat) < 0.001 && Math.abs(dLon) < 0.001)) {
        setGeofenceAlert(true);
        setEta("Arriving Now (< 1 min)");
      } else {
        setGeofenceAlert(false);
        const mins = Math.ceil((distKm / 30) * 60);
        setEta(mins + " minutes");
      }
    }
  }, [donorLocation, hospitalLocation]);

  function startSharing() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device");
      return;
    }
    setSharing(true);
    update(ref(db, "requests/" + requestId), {
      status: "in-progress",
      donorId: currentUser.uid
    });
    update(ref(db, "tracking/" + requestId), {
      status: "in-progress",
      donorId: currentUser.uid
    });
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDonorLocation({ lat, lng });
        update(ref(db, "tracking/" + requestId + "/donorLocation"), {
          lat: lat,
          lng: lng,
          updatedAt: Date.now()
        });
      },
      (error) => {
        console.log("Watch position error:", error);
        alert("Unable to get your location. Please enable GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  }

  function stopSharing() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSharing(false);
  }

  async function markCompleted() {
    stopSharing();
    await update(ref(db, "requests/" + requestId), {
      status: "completed",
      completedAt: Date.now()
    });
    await update(ref(db, "tracking/" + requestId), {
      status: "completed"
    });
    if (request && request.userId) {
      await push(ref(db, "notifications/" + request.userId), {
        type: "success",
        title: "Donation Completed!",
        message: "Your blood request has been fulfilled. Thank you!",
        read: false,
        createdAt: Date.now()
      });
    }
    setStatus("completed");
  }

  useEffect(() => {
    return () => stopSharing();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!requestId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 pt-12 pb-16">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white mb-4">
            <ArrowLeft size={20} /> Back
          </button>
          <p className="text-red-200 text-sm">Donor Navigation</p>
          <h1 className="text-white text-2xl font-bold mt-2">No Active Request</h1>
        </div>
        <div className="px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No active request</p>
            <button onClick={() => navigate("/dashboard")} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl w-full">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Donation Completed!</h1>
          <p className="text-gray-600 mb-6">Thank you for saving a life!</p>
          <button onClick={() => navigate("/dashboard")} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Donor GPS Navigation</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Navigate to hospital and share live location with requester
              </p>
            </div>
          </div>
        </div>

        {/* Geofence 100-Meter Proximity Alert Banner */}
        {geofenceAlert && (
          <div className="bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-lg border border-emerald-500 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
              📍
            </div>
            <div>
              <p className="font-extrabold text-xs uppercase tracking-wider text-emerald-100">100-Meter Geofence Alert</p>
              <p className="font-extrabold text-sm text-white mt-0.5">
                You have entered the 100-meter hospital proximity zone!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Request Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 bg-red-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-xs">
                    {request ? request.bloodGroup : "Blood"}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{request ? request.patientName : "Patient"}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Hospital: {request ? request.hospital : "N/A"}</p>
                  </div>
                </div>
                {requester && requester.phone && (
                  <a
                    href={"tel:" + requester.phone}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Phone size={14} />
                    <span>Call Patient</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">City</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{request ? request.city : "N/A"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Units</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{request ? request.units : "0"} Unit(s)</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Status</p>
                  <p className="font-extrabold text-red-600 capitalize mt-0.5">{status}</p>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Navigation className={sharing ? "text-emerald-600 animate-pulse" : "text-slate-400"} size={18} />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Route to Hospital</span>
                </div>
                {sharing ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    Sharing Active
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">Location inactive</span>
                )}
              </div>

              {donorLocation ? (
                <div style={{ width: "100%", height: "340px" }}>
                  <MapContainer
                    center={[donorLocation.lat, donorLocation.lng]}
                    zoom={14}
                    style={{ width: "100%", height: "100%" }}
                    ref={mapRef}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="OpenStreetMap contributors"
                    />
                    <Marker position={[donorLocation.lat, donorLocation.lng]} icon={donorIcon}>
                      <Popup>You are here</Popup>
                    </Marker>
                    <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
                      <Popup>{request ? request.hospital : "Hospital"}</Popup>
                    </Marker>
                    <Polyline
                      positions={[[donorLocation.lat, donorLocation.lng], [hospitalLocation.lat, hospitalLocation.lng]]}
                      color="#dc2626"
                      weight={4}
                      dashArray="6, 6"
                    />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-64 bg-slate-50 flex flex-col items-center justify-center p-6 text-center gap-2">
                  <MapPin className="text-slate-300" size={40} />
                  <p className="text-xs font-bold text-slate-700">Acquiring GPS Signal...</p>
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* ETA Info */}
            {donorLocation && distance && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Clock size={16} className="text-red-600" />
                  <span>Estimated Driving Time</span>
                </div>
                <p className="text-3xl font-black text-red-600 tracking-tight">{eta}</p>
                <p className="text-xs font-semibold text-slate-500">{distance} km to hospital</p>
              </div>
            )}

            {/* Action Buttons */}
            {status === "accepted" && !sharing && (
              <button
                onClick={startSharing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
              >
                <Navigation size={18} />
                <span>Start Navigation & Share GPS</span>
              </button>
            )}

            {sharing && status === "in-progress" && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping shrink-0" />
                  <p className="text-xs text-emerald-800 font-bold">
                    Live GPS location is being transmitted to requester.
                  </p>
                </div>
                <button
                  onClick={markCompleted}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                >
                  <CheckCircle size={18} />
                  <span>Mark as Donated - I Have Arrived</span>
                </button>
              </div>
            )}

            {donorLocation && (
              <a
                href={"https://www.google.com/maps/dir/" + donorLocation.lat + "," + donorLocation.lng + "/" + hospitalLocation.lat + "," + hospitalLocation.lng}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3.5 rounded-2xl shadow-xs text-center flex items-center justify-center gap-2 transition-all text-xs"
              >
                <ExternalLink size={16} />
                <span>Open in Google Maps App</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
