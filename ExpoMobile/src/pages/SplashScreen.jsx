import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Droplets } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen({ navigation }) {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (currentUser) {
        navigation.replace("Dashboard");
      } else {
        navigation.replace("Login");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentUser, loading, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#dc2626' }}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-2xl mb-5">
          <Droplets size={48} color="#dc2626" />
        </View>
        <Text className="text-3xl font-black tracking-tight text-white">LifeStream</Text>
        <Text className="text-red-100 text-xs font-extrabold uppercase tracking-widest mt-1">Emergency Donor Network</Text>
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 32 }} />
      </View>
    </SafeAreaView>
  );
}
