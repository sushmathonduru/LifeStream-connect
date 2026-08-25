import AsyncStorage from '@react-native-async-storage/async-storage';

// Using public internet tunnel so the phone can reach the backend without being on the same network!
const API_BASE_URL = "https://lifestream-connect-api-thond.loca.lt/api";

export const fetchWithAuth = async (url, options = {}) => {
  let token = null;
  try {
    token = await AsyncStorage.getItem("jwt_token");
  } catch (e) {
    console.error("AsyncStorage error", e);
  }
  
  const headers = {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true", // Required to bypass localtunnel warning page
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }
  
  return data;
};
