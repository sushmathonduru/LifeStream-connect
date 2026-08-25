import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update } from "../firebase/config"
import { ArrowLeft, Navigation, Phone, CheckCircle, MapPin, Clock } from "lucide-react-native"

let MapView, Marker, Polyline;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) {
  MapView = null;
}

export default function DonorTracking({ route, navigation }) {
  const { currentUser } = useAuth()
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }
  const requestId = route?.params?.requestId || route?.params?.state?.requestId || null
  const mapRef = useRef(null)

  const [request, setRequest] = useState(null)
  const [requester, setRequester] = useState(null)
  const [loading, setLoading] = useState(true)
  const [donorLocation, setDonorLocation] = useState(null)
  const [hospitalLocation, setHospitalLocation] = useState({ lat: 13.0569, lng: 80.2425 })
  const [sharing, setSharing] = useState(false)
  const [status, setStatus] = useState("accepted")
  const [eta, setEta] = useState("Calculating...")
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (!requestId) return
    const reqRef = ref(db, "requests/" + requestId)
    onValue(reqRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        setRequest(val)
        setStatus(val.status || "accepted")
        if (val.userId) {
          onValue(ref(db, "users/" + val.userId), (uSnap) => {
            setRequester(uSnap.val())
          })
        }
      }
      setLoading(false)
    })
  }, [requestId])

  function toggleLocationSharing() {
    if (!sharing) {
      setSharing(true)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: Date.now() }
          setDonorLocation(loc)
          if (currentUser) {
            update(ref(db, "locations/" + currentUser.uid), loc)
          }
        })
      }
    } else {
      setSharing(false)
    }
  }

  async function handleCompleteDonation() {
    if (!requestId) return
    try {
      await update(ref(db, "requests/" + requestId), {
        status: "completed",
        completedAt: Date.now()
      })
      setStatus("completed")
      setSharing(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-3 text-xs font-bold text-slate-500">Loading Navigation Console...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        {/* Header */}
        <View className="bg-white border-b border-slate-200 px-4 py-3.5 flex flex-row items-center gap-3 shadow-xs">
          <TouchableOpacity onPress={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-black text-slate-900 text-base">Donor Navigation Console</Text>
            <Text className="text-xs text-slate-500 font-semibold">{request?.patientName || "Blood Emergency"}</Text>
          </View>
        </View>

        {/* Map View */}
        <View className="h-72 bg-slate-900 relative">
          {MapView && Platform.OS !== 'web' ? (
            <MapView
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
              initialRegion={{
                latitude: donorLocation?.lat || hospitalLocation.lat,
                longitude: donorLocation?.lng || hospitalLocation.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {hospitalLocation && (
                <Marker
                  coordinate={{ latitude: hospitalLocation.lat, longitude: hospitalLocation.lng }}
                  title={request?.hospital || "Hospital"}
                  description="Destination"
                />
              )}
              {donorLocation && (
                <Marker
                  coordinate={{ latitude: donorLocation.lat, longitude: donorLocation.lng }}
                  title="My Location"
                  description="Active Location Sharing"
                  pinColor="green"
                />
              )}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center p-6 bg-slate-900">
              <Navigation size={48} color="#10b981" />
              <Text className="text-white font-black text-lg mt-3">GPS Guidance Ready</Text>
              <Text className="text-slate-400 text-xs text-center font-medium mt-1">
                Share live coordinates with patient family
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleLocationSharing}
            className={"absolute bottom-4 right-4 px-4 py-2.5 rounded-2xl shadow-lg border flex flex-row items-center gap-2 " + (sharing ? "bg-emerald-600 border-emerald-500" : "bg-red-600 border-red-500")}
          >
            <Navigation size={16} color="#ffffff" />
            <Text className="text-white font-black text-xs">{sharing ? "Sharing Active GPS" : "Share Live Location"}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Actions */}
        <View className="p-4 flex flex-col gap-4">
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
            <Text className="text-xs font-black uppercase text-slate-400 tracking-wider">Recipient Details</Text>
            <View className="flex flex-row items-center gap-3">
              <View className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                <Text className="text-white font-black">{request?.bloodGroup}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-black text-slate-900 text-base">{request?.patientName}</Text>
                <Text className="text-xs text-slate-500 font-semibold">{request?.hospital}, {request?.city}</Text>
              </View>
              {request?.contact && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${request.contact}`)}
                  className="w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-200 shadow-xs"
                >
                  <Phone size={20} color="#059669" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Completion Action */}
          {status === "completed" ? (
            <View className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-row items-center gap-3">
              <CheckCircle size={28} color="#059669" />
              <View className="flex-1">
                <Text className="font-black text-emerald-900 text-sm">Donation Marked as Complete!</Text>
                <Text className="text-xs text-emerald-700 font-semibold mt-0.5">Thank you for saving a life today!</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCompleteDonation}
              className="w-full bg-emerald-600 py-4 rounded-2xl shadow-md flex flex-row items-center justify-center gap-2 active:opacity-90"
            >
              <CheckCircle size={18} color="#ffffff" />
              <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Mark Donation Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
