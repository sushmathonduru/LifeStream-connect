import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from "react"

import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { ref, onValue, update } from "../firebase/config"
import { Phone, Mail, MapPin, Droplets, LogOut, Edit, Check, X, Award, User, Calendar, Clock } from "lucide-react-native"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function Profile({ navigation }) {
  const [userProfile, setUserProfile] = useState(null)
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "", phone: "", city: "", bloodGroup: "", gender: "", dateOfBirth: "", lastDonation: ""
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const { currentUser, logout } = useAuth()
  const navigate = (path, options) => { if(path === -1) return navigation.goBack(); const m = {"/":"Login","/login":"Login","/signup":"Signup","/forgot-password":"ForgotPassword","/dashboard":"Dashboard","/find-donor":"FindDonor","/request-blood":"RequestBlood","/emergency":"EmergencyRequest","/my-requests":"MyRequests","/donor-tracking":"DonorTracking","/live-tracking":"LiveTracking","/profile":"Profile","/certifications":"Certifications","/notifications":"Notifications"}; navigation.navigate(m[path]||"Dashboard", options?.state); }

  useEffect(() => {
    if (!currentUser) return
    const userRef = ref(db, "users/" + currentUser.uid)
    const unsubscribe = onValue(userRef, function (snapshot) {
      const data = snapshot.val()
      if (data) {
        setUserProfile(data)
        setAvailable(data.available || false)
        setEditForm({
          name: data.name || "",
          phone: data.phone || "",
          city: data.city || "",
          bloodGroup: data.bloodGroup || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          lastDonation: data.lastDonation || ""
        })
      }
      setLoading(false)
    })
    return function () {
      unsubscribe()
    }
  }, [currentUser])

  async function handleSaveProfile() {
    if (!editForm.name?.trim() || !editForm.phone?.trim() || !editForm.city?.trim() || !editForm.bloodGroup) {
      alert("Please fill in all required fields (Name, Phone, City, Blood Group).")
      return
    }
    try {
      setSaving(true)
      await update(ref(db, "users/" + currentUser.uid), {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        city: editForm.city.trim(),
        bloodGroup: editForm.bloodGroup,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        lastDonation: editForm.lastDonation,
        updatedAt: Date.now()
      })
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
      setTimeout(function () { setSuccess("") }, 3000)
    } catch (err) {
      console.log("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable() {
    const newValue = !available
    setAvailable(newValue)
    await update(ref(db, "users/" + currentUser.uid), {
      available: newValue
    })
  }

  async function becomeDonor() {
    await update(ref(db, "users/" + currentUser.uid), {
      isDonor: true,
      available: true
    })
    setSuccess("You are now registered as an active donor!")
    setTimeout(function () { setSuccess("") }, 3000)
  }

  async function handleLogout() {
    try {
      await logout()
      navigate("/login")
    } catch (err) {
      console.log("Logout error:", err)
    }
  }

  function getInitials() {
    if (userProfile && userProfile.name) {
      return userProfile.name.charAt(0).toUpperCase()
    }
    if (currentUser && currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  if (loading) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-gray-50">
        <View className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
        >
          <View className="bg-red-600 py-10 px-6 lg:px-12 shadow-sm">
        <View className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <View className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-3 border-4 border-white/20">
            <Text className="text-red-600 font-black text-2xl">{getInitials()}</Text>
          </View>
          <Text className="text-white font-extrabold text-2xl tracking-tight">
            {userProfile && userProfile.name ? userProfile.name : currentUser.email.split("@")[0]}
          </Text>

          <View className="flex items-center gap-2 mt-2">
            {userProfile && !!userProfile.bloodGroup && (
              <Text className="bg-white text-red-600 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                {userProfile.bloodGroup}
              </Text>
            )}
            {userProfile && !!userProfile.city && (
              <Text className="text-red-200 text-xs font-semibold">
                {"📍 " + userProfile.city}
              </Text>
            )}
          </View>

          {userProfile && userProfile.isDonor && (
            <View className="mt-3 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 text-xs px-4 py-1.5 rounded-full font-bold backdrop-blur-xs">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-emerald-100 font-bold text-xs">Registered Donor</Text>
            </View>
          )}
        </View>
      </View>

      <View className="max-w-4xl mx-auto px-6 lg:px-12 py-8 flex flex-col gap-6">
        {!!success && (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <Text className="text-emerald-800 text-sm text-center font-bold">{success}</Text>
          </View>
        )}

        {isEditing ? (
          <View className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col gap-5">
            <View className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Text className="font-bold text-slate-900 text-base">Edit Profile</Text>
              <TouchableOpacity
                onPress={function () { setIsEditing(false) }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </TouchableOpacity>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Name</Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={function (text) { setEditForm({ ...editForm, name: text }) }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-slate-50 font-medium"
                />
              </View>

              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</Text>
                <TextInput
                  value={editForm.phone}
                  onChangeText={function (text) { setEditForm({ ...editForm, phone: text }) }}
                  keyboardType="phone-pad"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-slate-50 font-medium"
                />
              </View>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">City</Text>
                <TextInput
                  value={editForm.city}
                  onChangeText={function (text) { setEditForm({ ...editForm, city: text }) }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-slate-50 font-medium"
                />
              </View>

              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Blood Group</Text>
                <View className="flex flex-row flex-wrap gap-2 pt-1">
                  {bloodGroups.map(function (g) {
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={function () { setEditForm({ ...editForm, bloodGroup: g }) }}
                        className={"px-3 py-2 rounded-xl border " + (editForm.bloodGroup === g ? "bg-red-600 border-red-600" : "bg-slate-50 border-slate-200")}
                      >
                        <Text className={"text-xs font-bold " + (editForm.bloodGroup === g ? "text-white" : "text-slate-700")}>{g}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Gender</Text>
                <View className="flex flex-row gap-2 pt-1">
                  {["Male", "Female", "Other"].map(function (g) {
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={function () { setEditForm({ ...editForm, gender: g }) }}
                        className={"px-3 py-2 rounded-xl border " + (editForm.gender === g ? "bg-red-600 border-red-600" : "bg-slate-50 border-slate-200")}
                      >
                        <Text className={"text-xs font-bold " + (editForm.gender === g ? "text-white" : "text-slate-700")}>{g}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              <View className="flex flex-col gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Date of Birth</Text>
                <TextInput
                  value={editForm.dateOfBirth}
                  onChangeText={function (text) { setEditForm({ ...editForm, dateOfBirth: text }) }}
                  placeholder="YYYY-MM-DD"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-slate-50 font-medium"
                />
              </View>
            </View>

            <View className="flex flex-col gap-2">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Last Donation Date</Text>
              <TextInput
                value={editForm.lastDonation}
                onChangeText={function (text) { setEditForm({ ...editForm, lastDonation: text }) }}
                placeholder="YYYY-MM-DD"
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-slate-50 font-medium"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}

              className="w-full bg-red-600 hover:from-red-700 hover:to-rose-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              {saving ? (
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  <Text>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <View className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Text className="font-bold text-slate-900 text-base">Account Information</Text>
              <TouchableOpacity
                onPress={function () { setIsEditing(true) }}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-bold cursor-pointer"
              >
                <Edit size={14} />
                <Text>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-col gap-4 pt-1">
              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Mail size={18} />
                </View>
                <View>
                  <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</Text>
                  <Text className="text-sm font-semibold text-slate-800">{currentUser.email}</Text>
                </View>
              </View>

              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Phone size={18} />
                </View>
                <View>
                  <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</Text>
                  <Text className="text-sm font-semibold text-slate-800">
                    {userProfile && userProfile.phone ? userProfile.phone : "Not provided"}
                  </Text>
                </View>
              </View>

              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Droplets size={18} />
                </View>
                <View>
                  <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blood Group</Text>
                  <Text className="text-sm font-semibold text-slate-800">
                    {userProfile && userProfile.bloodGroup ? userProfile.bloodGroup : "Not specified"}
                  </Text>
                </View>
              </View>

              <View className="flex items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <MapPin size={18} />
                </View>
                <View>
                  <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">City</Text>
                  <Text className="text-sm font-semibold text-slate-800">
                    {userProfile && userProfile.city ? userProfile.city : "Not specified"}
                  </Text>
                </View>
              </View>
              
              <View className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 border-t border-slate-100 pt-5">
                <View className="flex items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <User size={18} />
                  </View>
                  <View>
                    <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gender</Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {userProfile && userProfile.gender ? userProfile.gender : "Not specified"}
                    </Text>
                  </View>
                </View>

                <View className="flex items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Calendar size={18} />
                  </View>
                  <View>
                    <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date of Birth</Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {userProfile && userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : "Not specified"}
                    </Text>
                  </View>
                </View>

                <View className="flex items-center gap-4 sm:col-span-2">
                  <View className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Clock size={18} />
                  </View>
                  <View>
                    <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Donation Date</Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {userProfile && userProfile.lastDonation ? new Date(userProfile.lastDonation).toLocaleDateString() : "Not specified"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {userProfile && userProfile.isDonor && (
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4">
            <View>
              <Text className="font-bold text-slate-900 text-base">Available to Donate</Text>
              <Text className="text-xs text-slate-500 mt-0.5 font-medium">
                {available ? "Visible in donor search results" : "Hidden from donor search results"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleAvailable}
              className={
                "w-14 h-8 rounded-full transition-colors relative cursor-pointer p-1 flex-shrink-0 " +
                (available ? "bg-red-600" : "bg-slate-300")
              }
            >
              <View
                className={
                  "w-6 h-6 bg-white rounded-full shadow-md transition-transform " +
                  (available ? "translate-x-6" : "translate-x-0")
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {userProfile && !userProfile.isDonor && (
          <View className="bg-red-50/70 rounded-2xl p-6 border border-red-100 items-center text-center">
            <View>
              <Award size={32} color="#dc2626" />
            </View>
            <Text className="font-bold text-slate-900 text-base">Become a Blood Donor</Text>
            <Text className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              Register as an active donor to save lives in emergency situations. You can toggle your availability status anytime.
            </Text>
            <TouchableOpacity
              onPress={becomeDonor}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              Register as Donor
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="w-full bg-white hover:bg-rose-50 border border-rose-200 rounded-2xl py-3.5 flex flex-row items-center justify-center gap-2 shadow-xs"
        >
          <LogOut size={18} color="#e11d48" />
          <Text className="text-rose-600 font-extrabold text-sm">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
  )
}

