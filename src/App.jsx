import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import BottomNav from "./components/BottomNav"
import SplashScreen from "./pages/SplashScreen"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import RequestBlood from "./pages/RequestBlood"
import EmergencyRequest from "./pages/EmergencyRequest"
import FindDonor from "./pages/FindDonor"
import MyRequests from "./pages/MyRequests"
import LiveTracking from "./pages/LiveTracking"
import DonorTracking from "./pages/DonorTracking"
import Notifications from "./pages/Notifications"
import Profile from "./pages/Profile"
import Certifications from "./pages/Certifications"

const publicPaths = ["/", "/login", "/signup", "/forgot-password"]

function AppLayout() {
  const location = useLocation()
  const isPublic = publicPaths.includes(location.pathname)

  if (isPublic) {
    return (
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50 text-slate-800">
      <BottomNav />
      <main className="flex-1 min-h-screen pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/request-blood" element={
            <ProtectedRoute><RequestBlood /></ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute><EmergencyRequest /></ProtectedRoute>
          } />
          <Route path="/find-donor" element={
            <ProtectedRoute><FindDonor /></ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute><MyRequests /></ProtectedRoute>
          } />
          <Route path="/live-tracking" element={
            <ProtectedRoute><LiveTracking /></ProtectedRoute>
          } />
          <Route path="/donor-tracking" element={
            <ProtectedRoute><DonorTracking /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/certifications" element={
            <ProtectedRoute><Certifications /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}
