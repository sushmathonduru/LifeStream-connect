import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, navigation }) {
  const { currentUser } = useAuth()
  if (!currentUser) {
    if (navigation) navigation.replace("Login")
    return null
  }
  return children
}
