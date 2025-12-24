import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Screens - ONLY FILES THAT EXIST
import LandingScreen from '../screens/LandingScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import ReportAnimalScreen from '../screens/ReportAnimalScreen';
import ViewReportsScreen from '../screens/ViewReportsScreen';
import AcceptRescueTaskScreen from '../screens/AcceptRescueTaskScreen';
import MyRescueTaskDetailScreen from '../screens/Myrescuetaskdetailscreen';
import UserLoginScreen from '../screens/Userloginscreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Admin Screens - ONLY YOUR EXISTING FILES
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminViewReportScreen from '../screens/Adminviewreportscreen';
import ManageRescueTasksScreen from '../screens/ManageRescueTasksScreen'; 

const Stack = createStackNavigator();

// Teal color theme
const COLORS = {
  primary: '#14b8a6',
  white: '#ffffff',
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        }}
      >
        {/* Landing Screen */}
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />

        {/* User Screens */}
        <Stack.Screen
          name="UserLogin"
          component={UserLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ 
            title: 'Forgot Password',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="UserHome"
          component={UserHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReportAnimal"
          component={ReportAnimalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewReport"
          component={ViewReportsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AcceptRescueTask"
          component={AcceptRescueTaskScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyRescueTaskDetail"
          component={MyRescueTaskDetailScreen}
          options={{ 
            title: 'Task Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={UserHomeScreen}
          options={{ title: 'Profile' }}
        />

        {/* Admin Screens - ONLY EXISTING FILES */}
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
        {/* AdminViewReport - Uses AdminManageScreen (has view + manage) */}
        <Stack.Screen
          name="AdminViewReport"
          component={AdminViewReportScreen}
          options={{ headerShown: false }}
        />
        {/* AdminManageReport - Uses AdminManageScreen (same screen) */}
        <Stack.Screen
          name="AdminManageReport"
          component={AdminViewReportScreen}
          options={{ headerShown: false }}
        />
        {/* ManageRescueTasks - Correct component name! */}
        <Stack.Screen
          name="ManageRescueTasks"
          component={ManageRescueTasksScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ViewReports"           // ✅ This exact name!
          component={ViewReportsScreen}
          options={{
            title: 'My Reports',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;