import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, onValue, set, push, update, remove, get, child, query, equalTo, orderByChild } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkCQlHc2b9ZeNMJi5G5AfKGoEjnMZLKv0",
  authDomain: "lifestreamconnect-10e84.firebaseapp.com",
  databaseURL: "https://lifestreamconnect-10e84-default-rtdb.firebaseio.com",
  projectId: "lifestreamconnect-10e84",
  storageBucket: "lifestreamconnect-10e84.firebasestorage.app",
  messagingSenderId: "105198015504",
  appId: "1:105198015504:web:6e6ead47566b27bc10a695"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getDatabase(app);
export { ref, onValue, set, push, update, remove, get, child, query, equalTo, orderByChild };
export default app;