import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from "react"
import { KeyRound, CheckCircle2, Mail, ArrowLeft } from "lucide-react-native"

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleReset(e) {
    if(e && e.preventDefault) e.preventDefault();
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    try {
      setError("")
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true)
    } catch (err) {
      setError("Failed to send reset email. Try again.")
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View className="items-center pt-6 text-center">
            <View className="w-16 h-16 bg-red-600 rounded-3xl items-center justify-center shadow-lg mb-3">
              <KeyRound size={32} color="#ffffff" />
            </View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-1 text-center">
              Enter your registered email to receive a password reset link
            </Text>
          </View>

          {/* Form Card or Success */}
          {sent ? (
            <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 items-center text-center my-6 flex flex-col gap-4">
              <View className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center border border-emerald-200">
                <CheckCircle2 size={28} color="#059669" />
              </View>
              <View className="items-center">
                <Text className="text-xl font-extrabold text-slate-900">Reset Email Sent!</Text>
                <Text className="text-slate-500 text-xs font-medium mt-1 text-center">
                  Instructions sent to <Text className="text-red-600 font-bold">{email}</Text>
                </Text>
              </View>

              <View className="w-full flex flex-col gap-3 pt-2">
                <TouchableOpacity
                  onPress={() => setSent(false)}
                  className="w-full border-2 border-red-600 py-3.5 rounded-2xl flex items-center justify-center"
                >
                  <Text className="text-red-600 font-extrabold text-xs uppercase tracking-wider">Resend Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  className="w-full bg-red-600 py-4 rounded-2xl shadow-md flex items-center justify-center"
                >
                  <Text className="text-white font-extrabold text-sm">Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col gap-4 my-6">
              {!!error && (
                <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
                  <Text className="text-rose-600 text-xs font-bold text-center">{error}</Text>
                </View>
              )}

              <View className="flex flex-col gap-1.5">
                <Text className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Email Address</Text>
                <View className="flex flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3">
                  <Mail size={18} color="#94a3b8" />
                  <TextInput
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-2.5 text-sm font-medium text-slate-900"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={loading}
                className="w-full bg-red-600 py-4 rounded-2xl shadow-md flex items-center justify-center mt-2 active:opacity-90"
              >
                {loading ? (
                  <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Text className="text-white font-extrabold text-sm">Send Reset Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                className="w-full border border-slate-200 py-3.5 rounded-2xl flex flex-row items-center justify-center gap-2"
              >
                <ArrowLeft size={16} color="#475569" />
                <Text className="text-slate-700 font-extrabold text-xs uppercase tracking-wider">Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View className="items-center pb-2">
            <Text className="text-[11px] text-slate-400 font-semibold">
              LifeStream Mobile Connect • v1.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

