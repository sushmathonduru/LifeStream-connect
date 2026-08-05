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
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #f8fafc 0%, #fdf2f2 100%)",
    }}>
      <div className="hidden md:block" style={{
        width: "280px",
        minWidth: "280px",
        minHeight: "100vh",
        flexShrink: 0,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(10px)",
        boxShadow: "inset -1px 0 0 #e5e7eb",
      }}>
        <BottomNav />
      </div>

      <div style={{
        flex: 1,
        minHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}>
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
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
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
