import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Droplets, Eye, EyeOff, Mail, Lock } from "lucide-react-native"

export default function Login({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter email and password.")
      return
    }
    try {
      setError("")
      setLoading(true)
      await login(email, password)
      navigation.replace("Dashboard")
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else {
        setError("Login failed. Please check credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 28 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header Banner */}
          <View className="items-center pt-4 pb-6 text-center">
            <View className="w-18 h-18 bg-red-600 rounded-3xl items-center justify-center shadow-lg mb-3">
              <Droplets size={36} color="#ffffff" />
            </View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</Text>
            <Text className="text-xs font-bold text-slate-500 mt-1">
              LifeStream Mobile Emergency Network
            </Text>
          </View>

          {/* Login Card */}
          <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col gap-4 mb-6">
            {!!error && (
              <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
                <Text className="text-rose-600 text-xs font-bold text-center">{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Email Address</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3.5">
                <Mail size={18} color="#94a3b8" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="flex flex-col gap-1.5">
              <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Password</Text>
              <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3.5">
                <Lock size={18} color="#94a3b8" />
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2.5 text-sm font-semibold text-slate-900"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View className="items-end pt-1">
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text className="text-red-600 text-xs font-black">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-red-600 py-4 rounded-2xl shadow-md items-center justify-center mt-2 active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-extrabold text-xs tracking-wider uppercase">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Signup prompt */}
            <View className="flex flex-row items-center justify-center pt-2 gap-1">
              <Text className="text-xs text-slate-500 font-semibold">Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text className="text-red-600 font-black text-xs">Sign Up Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer branding */}
          <View className="items-center pb-6 mt-auto">
            <Text className="text-[11px] text-slate-400 font-bold">
              LifeStream Mobile Connect • v1.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
