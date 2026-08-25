import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect, useRef } from "react"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { ArrowLeft, Phone, User, Navigation } from "lucide-react-native"

let MapView, Marker, Polyline;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) {
  MapView = null;
}

export default function LiveTracking({ route, navigation }) {
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }
  const requestId = route?.params?.requestId || route?.params?.state?.requestId || null
  const mapRef = useRef(null)

  const [request, setRequest] = useState(null)
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [donorLocation, setDonorLocation] = useState(null)
  const [hospitalLocation, setHospitalLocation] = useState({ lat: 13.0569, lng: 80.2425 })
  const [eta, setEta] = useState("Calculating...")
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (!requestId) return
    const reqRef = ref(db, "requests/" + requestId)
    onValue(reqRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        setRequest(val)
        if (val.acceptedBy) {
          onValue(ref(db, "users/" + val.acceptedBy), (dSnap) => {
            setDonor(dSnap.val())
          })
          onValue(ref(db, "locations/" + val.acceptedBy), (locSnap) => {
            const loc = locSnap.val()
            if (loc) {
              setDonorLocation(loc)
            }
          })
        }
      }
      setLoading(false)
    })
  }, [requestId])

  useEffect(() => {
    if (donorLocation && hospitalLocation) {
      const d = haversine(
        donorLocation.lat,
        donorLocation.lng,
        hospitalLocation.lat,
        hospitalLocation.lng
      )
      setDistance(d.toFixed(1))
      const timeMin = Math.round((d / 30) * 60)
      setEta(timeMin < 1 ? "< 1 min" : `${timeMin} mins`)
    }
  }, [donorLocation, hospitalLocation])

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-3 text-xs font-bold text-slate-500">Loading Live Tracking...</Text>
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
            <Text className="font-black text-slate-900 text-base">Live Donor Tracking</Text>
            <Text className="text-xs text-slate-500 font-semibold">{request?.patientName || "Emergency Request"}</Text>
          </View>
        </View>

        {/* Map Container */}
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
                  description="Delivery Location"
                />
              )}
              {donorLocation && (
                <Marker
                  coordinate={{ latitude: donorLocation.lat, longitude: donorLocation.lng }}
                  title={donor?.name || "Donor"}
                  description="Current Location"
                  pinColor="blue"
                />
              )}
              {donorLocation && hospitalLocation && (
                <Polyline
                  coordinates={[
                    { latitude: donorLocation.lat, longitude: donorLocation.lng },
                    { latitude: hospitalLocation.lat, longitude: hospitalLocation.lng },
                  ]}
                  strokeColor="#dc2626"
                  strokeWidth={4}
                />
              )}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center p-6 bg-slate-900">
              <Navigation size={48} color="#ef4444" />
              <Text className="text-white font-black text-lg mt-3">Live Map Active</Text>
              <Text className="text-slate-400 text-xs text-center font-medium mt-1">
                Tracking live GPS coordinates for donor delivery route
              </Text>
            </View>
          )}

          {/* ETA Floating Card */}
          <View className="absolute top-4 right-4 bg-white/90 rounded-2xl px-4 py-2.5 shadow-lg border border-slate-200 flex flex-row items-center gap-3">
            <View className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
              <Navigation size={18} color="#dc2626" />
            </View>
            <View>
              <Text className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Estimated Arrival</Text>
              <Text className="text-sm font-black text-slate-900">{eta} {distance ? `(${distance} km)` : ""}</Text>
            </View>
          </View>
        </View>

        {/* Donor Info Card */}
        <View className="p-4 flex flex-col gap-4">
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
            <Text className="text-xs font-black uppercase text-slate-400 tracking-wider">Assigned Blood Donor</Text>
            <View className="flex flex-row items-center gap-3">
              <View className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                <User size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="font-black text-slate-900 text-base">{donor?.name || "Verified Donor"}</Text>
                <Text className="text-xs text-slate-500 font-semibold">Blood Group: <Text className="text-red-600 font-black">{donor?.bloodGroup || request?.bloodGroup}</Text></Text>
              </View>
              {donor?.phone && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${donor.phone}`)}
                  className="w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-200 shadow-xs"
                >
                  <Phone size={20} color="#059669" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Delivery Details */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col gap-2.5">
            <Text className="text-xs font-black uppercase text-slate-400 tracking-wider">Hospital Details</Text>
            <Text className="text-sm font-bold text-slate-900">{request?.hospital || "Emergency Hospital"}</Text>
            <Text className="text-xs text-slate-500 font-medium">{request?.city}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
