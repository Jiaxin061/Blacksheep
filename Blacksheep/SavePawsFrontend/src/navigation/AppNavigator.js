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

// Module 3: Rescue Task Update Module
import AdminEvidenceViewScreen from '../screens/AdminEvidenceViewScreen';
import UserRescueHistoryScreen from '../screens/UserRescueHistoryScreen';

// Blacklist Management
import BlacklistManagementScreen from '../screens/BlacklistManagementScreen';

// Donation Portal Screens
import DonationHomeScreen from '../screens/DonationHomeScreen';
import AdminDonationDashboardScreen from '../screens/AdminDonationDashboardScreen';

// Donation Portal Navigation Screens
import AnimalListScreen from '../screens/AnimalListScreen';
import AnimalDetailsScreen from '../screens/AnimalDetailsScreen';
import DonationImpactScreen from '../screens/DonationImpactScreen';
import RewardsCatalogueScreen from '../screens/RewardsCatalogueScreen';
import AdminAnimalsScreen from '../screens/AdminAnimalsScreen';
import AdminFundAllocationScreen from '../screens/AdminFundAllocationScreen';
import AdminRewardsScreen from '../screens/AdminRewardsScreen';

// Adoption Screens
import AdoptionHubScreen from '../features/adoption/screens/AdoptionHubScreen';
import AdoptionRequestScreen from '../features/adoption/screens/AdoptionRequestScreen';
import AdminAdoptionListScreen from '../features/adoption/screens/AdminAdoptionListScreen';
import AdminAdoptionDetailScreen from '../features/adoption/screens/AdminAdoptionDetailScreen'; 

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
            headerShown: false,
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

        {/* Module 3: Rescue Task Update Module */}
        <Stack.Screen
          name="AdminEvidenceView"
          component={AdminEvidenceViewScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UserRescueHistory"
          component={UserRescueHistoryScreen}
          options={{
            title: 'Rescue History',
            headerShown: true,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="BlacklistManagement"
          component={BlacklistManagementScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Donation Portal Screens */}
        <Stack.Screen
          name="DonationHome"
          component={DonationHomeScreen}
          options={{
            title: 'Donation Portal',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminDonationDashboard"
          component={AdminDonationDashboardScreen}
          options={{
            title: 'Donation Dashboard',
            headerShown: true,
          }}
        />

        {/* Donation Portal Navigation Screens */}
        <Stack.Screen
          name="AnimalList"
          component={AnimalListScreen}
          options={{
            title: 'Animals Needing Help',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AnimalDetails"
          component={AnimalDetailsScreen}
          options={{
            title: 'Animal Profile',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="DonationImpact"
          component={DonationImpactScreen}
          options={{
            title: 'Your Donation Impact',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="RewardsCatalogue"
          component={RewardsCatalogueScreen}
          options={{
            title: 'Reward Catalogue',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminAnimals"
          component={AdminAnimalsScreen}
          options={{
            title: 'Animal Profiles',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminFundAllocation"
          component={AdminFundAllocationScreen}
          options={{
            title: 'Fund Allocation',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminRewards"
          component={AdminRewardsScreen}
          options={{
            title: 'Reward Catalogue',
            headerShown: true,
          }}
        />

        {/* Adoption Screens */}
        <Stack.Screen
          name="AdoptionHub"
          component={AdoptionHubScreen}
          options={{
            title: 'Adoption Hub',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdoptionRequest"
          component={AdoptionRequestScreen}
          options={{
            title: 'Adopt Me',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminAdoptionList"
          component={AdminAdoptionListScreen}
          options={{
            title: 'Adoption Requests',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminAdoptionDetail"
          component={AdminAdoptionDetailScreen}
          options={{
            title: 'Request Details',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;