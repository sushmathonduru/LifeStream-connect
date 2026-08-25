import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useState, useEffect } from "react"
import { db } from "../firebase/config"
import { ref, onValue } from "../firebase/config"
import { Search, MapPin, Phone, User, Users } from "lucide-react-native"

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function FindDonor({ navigation }) {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("All")

  useEffect(() => {
    const usersRef = ref(db, "users")
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data)
          .map(([id, u]) => ({ id, ...u }))
          .filter((u) => u.isDonor)
        setDonors(list)
      } else {
        setDonors([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredDonors = donors.filter((donor) => {
    const matchGroup = selectedGroup === "All" || donor.bloodGroup === selectedGroup
    const matchCity =
      searchCity.trim() === "" ||
      (donor.city && donor.city.toLowerCase().includes(searchCity.trim().toLowerCase()))
    return matchGroup && matchCity
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Header Hero */}
        <View className="bg-red-600 rounded-3xl p-5 text-white shadow-md flex flex-row items-center gap-3.5 mb-4">
          <View className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
            <Users size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black text-white tracking-tight">Find Donors</Text>
            <Text className="text-red-100 text-xs font-semibold mt-0.5">Search nearby registered blood donors</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-3xl p-3 shadow-md border border-slate-200/80 flex flex-row items-center gap-2 mb-4">
          <Search size={18} color="#94a3b8" style={{ marginLeft: 8 }} />
          <TextInput
            value={searchCity}
            onChangeText={(text) => setSearchCity(text)}
            placeholder="Search by city (e.g. Chennai, Mumbai)..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-xs font-semibold text-slate-900 py-1"
          />
          {searchCity.length > 0 && (
            <TouchableOpacity onPress={() => setSearchCity("")} className="px-2">
              <Text className="text-xs font-bold text-slate-400">Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Blood Group Filter Pills */}
        <View className="flex flex-col gap-2 mb-4">
          <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Blood Group Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true} className="flex flex-row gap-2 py-1">
            {bloodGroups.map((group) => {
              const active = selectedGroup === group
              return (
                <TouchableOpacity
                  key={group}
                  onPress={() => setSelectedGroup(group)}
                  className={
                    "px-4 py-2.5 rounded-2xl border flex items-center justify-center mr-2 " +
                    (active ? "bg-red-600 border-red-600 shadow-xs" : "bg-white border-slate-200")
                  }
                >
                  <Text className={"text-xs font-black " + (active ? "text-white" : "text-slate-700")}>{group}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Results Counter */}
        <View className="flex flex-row items-center justify-between mb-3 px-1">
          <Text className="text-xs font-extrabold text-slate-700">
            {filteredDonors.length + " donor" + (filteredDonors.length !== 1 ? "s" : "") + " available"}
          </Text>
        </View>

        {loading && (
          <View className="flex items-center justify-center py-12">
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        )}

        {!loading && filteredDonors.length === 0 && (
          <View className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center my-4">
            <User size={40} color="#cbd5e1" />
            <Text className="text-sm font-extrabold text-slate-800">No Donors Found</Text>
            <Text className="text-xs text-slate-500 font-semibold mt-1">
              Try searching a different city or changing the blood group filter.
            </Text>
          </View>
        )}

        {/* Donor List */}
        <View className="flex flex-col gap-3 pb-6">
          {!loading && filteredDonors.map((donor) => {
            const isAvail = donor.available === true
            return (
              <View key={donor.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-row items-center justify-between gap-3">
                <View className="flex flex-row items-center gap-3.5 flex-1 min-w-0">
                  <View className="w-13 h-13 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 flex-shrink-0">
                    <Text className="font-black text-red-600 text-base">{donor.bloodGroup || "?"}</Text>
                  </View>
                  <View className="flex-1 min-w-0 flex flex-col gap-1">
                    <Text className="text-sm font-extrabold text-slate-900 truncate">{donor.name || "Anonymous Donor"}</Text>
                    <View className="flex flex-row items-center gap-1">
                      <MapPin size={12} color="#94a3b8" />
                      <Text className="text-xs text-slate-500 font-medium truncate">{donor.city || "Location unspecified"}</Text>
                    </View>
                    <View className="flex flex-row items-center gap-1.5 pt-0.5">
                      <View className={"w-2 h-2 rounded-full " + (isAvail ? "bg-emerald-500" : "bg-slate-300")} />
                      <Text className={"text-[11px] font-bold " + (isAvail ? "text-emerald-600" : "text-slate-400")}>
                        {isAvail ? "Available for Donation" : "Currently Unavailable"}
                      </Text>
                    </View>
                  </View>
                </View>

                {isAvail && !!donor.phone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL("tel:" + donor.phone)}
                    className="bg-red-600 px-4 py-2.5 rounded-2xl flex flex-row items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone size={14} color="#ffffff" />
                    <Text className="text-white text-xs font-extrabold">Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
