import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/pages/SplashScreen';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import ForgotPassword from './src/pages/ForgotPassword';
import Dashboard from './src/pages/Dashboard';
import FindDonor from './src/pages/FindDonor';
import RequestBlood from './src/pages/RequestBlood';
import EmergencyRequest from './src/pages/EmergencyRequest';
import MyRequests from './src/pages/MyRequests';
import DonorTracking from './src/pages/DonorTracking';
import LiveTracking from './src/pages/LiveTracking';
import Profile from './src/pages/Profile';
import Certifications from './src/pages/Certifications';
import Notifications from './src/pages/Notifications';
import { AuthProvider } from './src/context/AuthContext.jsx';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="FindDonor" component={FindDonor} />
            <Stack.Screen name="RequestBlood" component={RequestBlood} />
            <Stack.Screen name="EmergencyRequest" component={EmergencyRequest} />
            <Stack.Screen name="MyRequests" component={MyRequests} />
            <Stack.Screen name="DonorTracking" component={DonorTracking} />
            <Stack.Screen name="LiveTracking" component={LiveTracking} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Certifications" component={Certifications} />
            <Stack.Screen name="Notifications" component={Notifications} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
