import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Screens - ONLY FILES THAT EXIST
import LandingScreen from '../screens/LandingScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import ReportAnimalScreen from '../screens/ReportAnimalScreen';
import ViewReportsScreen from '../screens/ViewReportsScreen';
import CommunityPage from '../screens/CommunityPage';
import CommunityCreatePostPage from '../screens/CommunityCreatePostPage';
import CommunityPostDetailsPage from '../screens/CommunityPostDetailsPage';
import AIAssistantPage from '../screens/aiAssistantPage';
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

// Module 4: Donation Portal Navigation Screens
import AnimalListScreen from '../screens/AnimalListScreen';
import AnimalDetailsScreen from '../screens/AnimalDetailsScreen';
import DonationScreen from '../screens/DonationScreen';
import DonationImpactScreen from '../screens/DonationImpactScreen';
import DonationImpactDetailScreen from '../screens/DonationImpactDetailScreen';
import DonationReceiptScreen from '../screens/DonationReceiptScreen';
import RewardsCatalogueScreen from '../screens/RewardsCatalogueScreen';
import RewardsDetailScreen from '../screens/RewardsDetailScreen';
import RewardsHistoryScreen from '../screens/RewardsHistoryScreen';
import RewardsVoucherScreen from '../screens/RewardsVoucherScreen';
import AdminAnimalsScreen from '../screens/AdminAnimalsScreen';
import AdminAddAnimalScreen from '../screens/AdminAddAnimalScreen';
import AdminEditAnimalScreen from '../screens/AdminEditAnimalScreen';
import AIAssistantFAB from '../components/AIAssistantFAB';
import BottomNav from '../components/BottomNav';
import AdminFundAllocationScreen from '../screens/AdminFundAllocationScreen';
import AdminFundAllocationDetailScreen from '../screens/AdminFundAllocationDetailScreen';
import AdminAddAllocationScreen from '../screens/AdminAddAllocationScreen';
import AdminEditAllocationScreen from '../screens/AdminEditAllocationScreen';
import AdminRewardsScreen from '../screens/AdminRewardsScreen';
import AdminRewardsEditScreen from '../screens/AdminRewardsEditScreen';

// Adoption Screens
import AdoptionHubScreen from '../features/adoption/screens/AdoptionHubScreen';
import AdoptionRequestScreen from '../features/adoption/screens/AdoptionRequestScreen';
import AdminAdoptionListScreen from '../features/adoption/screens/AdminAdoptionListScreen';
import AdminAdoptionDetailScreen from '../features/adoption/screens/AdminAdoptionDetailScreen';
import AnimalDetail from '../features/animals/components/AnimalDetail';

const Stack = createStackNavigator();

// Teal color theme
const COLORS = {
  primary: '#14b8a6',
  white: '#ffffff',
};

const AppNavigator = () => {
  const initialRoute = 'Landing';

  return (
    <NavigationContainer>
      <NavigationContent initialRoute={initialRoute} />
    </NavigationContainer>
  );
};

// Wrapper component to access navigation state
const NavigationContent = ({ initialRoute }) => {
  const currentRoute = useNavigationState(state => state?.routes[state.index]?.name);

  // Screens where bottom nav and FAB should NOT appear
  const hideNavScreens = [
    'Landing',
    'Login',
    'Signup',
    'ForgotPassword',
    'AdminLogin',
    'AdminDashboard',
    'ManageRescueTasks',
    'AdminViewReport',
    'AdminEvidenceView',
    'BlacklistManagement',
    'AdminDonationDashboard',
    'AdminAnimals',
    'AdminAddAnimal',
    'AdminEditAnimal',
    'AdminFundAllocation',
    'AdminFundAllocationDetail',
    'AdminAddAllocation',
    'AdminEditAllocation',
    'AdminFundAllocationItem',
    'AdminRewards',
    'AdminRewardsEdit',
    'AdminAdoptionList',
    'AdminAdoptionDetail',
  ];

  const shouldShowNav = !hideNavScreens.includes(currentRoute);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#14b8a6',
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyle: { backgroundColor: '#ffffff' },
        }}
      >
        {/* Landing & Auth */}
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
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
          options={{ title: 'Reset Password' }}
        />

        {/* User & Generic Screens */}
        <Stack.Screen
          name="UserHome"
          component={UserHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReportAnimal"
          component={ReportAnimalScreen}
          options={{ title: 'Report Animal' }}
        />
        <Stack.Screen
          name="ViewReports"
          component={ViewReportsScreen}
          options={{ title: 'All Reports' }}
        />
        <Stack.Screen
          name="AcceptRescueTask"
          component={AcceptRescueTaskScreen}
          options={{ title: 'Available Tasks' }}
        />
        <Stack.Screen
          name="MyRescueTaskDetail"
          component={MyRescueTaskDetailScreen}
          options={{ title: 'My Task' }}
        />

        {/* Admin Screens */}
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }} // Custom header in screen
        />
        <Stack.Screen
          name="ManageRescueTasks"
          component={ManageRescueTasksScreen}
          options={{ title: 'Manage Tasks' }}
        />
        <Stack.Screen
          name="AdminViewReport"
          component={AdminViewReportScreen}
          options={{ title: 'Report Details' }}
        />

        <Stack.Screen
          name="AdminEvidenceView"
          component={AdminEvidenceViewScreen}
          options={{ title: 'Verify Evidence' }}
        />
        <Stack.Screen
          name="UserRescueHistory"
          component={UserRescueHistoryScreen}
          options={{ title: 'My Rescue History' }}
        />

        <Stack.Screen
          name="BlacklistManagement"
          component={BlacklistManagementScreen}
          options={{ title: 'Blacklist Management' }}
        />

        {/* Module 4: Donation Portal */}
        <Stack.Screen
          name="DonationHome"
          component={DonationHomeScreen}
          options={{
            title: 'Donation Portal',
            headerShown: true, // Show header for back button
          }}
        />
        <Stack.Screen
          name="AdminDonationDashboard"
          component={AdminDonationDashboardScreen}
          options={{
            title: 'Donation Management',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Donation"
          component={DonationScreen}
          options={{
            title: 'Make a Donation',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="DonationImpact"
          component={DonationImpactScreen}
          options={{
            title: 'Our Impact',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="DonationImpactDetail"
          component={DonationImpactDetailScreen}
          options={{
            title: 'Impact Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="DonationReceipt"
          component={DonationReceiptScreen}
          options={{
            title: 'Donation Receipt',
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="AnimalList"
          component={AnimalListScreen}
          options={{
            title: 'Our Animals',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AnimalDetails"
          component={AnimalDetailsScreen}
          options={{
            title: 'Animal Details',
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
          name="AdminAddAnimal"
          component={AdminAddAnimalScreen}
          options={{
            title: 'Add New Profile',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminEditAnimal"
          component={AdminEditAnimalScreen}
          options={{
            title: 'Edit Profile',
            headerShown: true,
          }}
        />

        {/* Rewards */}
        <Stack.Screen
          name="RewardsCatalogue"
          component={RewardsCatalogueScreen}
          options={{
            title: 'Rewards Catalogue',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="RewardDetail"
          component={RewardsDetailScreen}
          options={{
            title: 'Reward Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="RewardsHistory"
          component={RewardsHistoryScreen}
          options={{
            title: 'Reward History',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="RewardsVoucher"
          component={RewardsVoucherScreen}
          options={{ title: 'My Voucher' }}
        />

        {/* Community Screens */}
        <Stack.Screen
          name="CommunityPage"
          component={CommunityPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommunityCreatePost"
          component={CommunityCreatePostPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommunityPostDetails"
          component={CommunityPostDetailsPage}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AIAssistant"
          component={AIAssistantPage}
          options={{ headerShown: false }}
        />

        {/* Admin Fund Allocation */}
        <Stack.Screen
          name="AdminFundAllocation"
          component={AdminFundAllocationScreen}
          options={{
            title: 'Fund Allocation',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminFundAllocationDetail"
          component={AdminFundAllocationDetailScreen}
          options={{ title: 'Allocation Summary' }}
        />

        <Stack.Screen
          name="AdminAddAllocation"
          component={AdminAddAllocationScreen}
          options={{ title: 'Add New Allocation' }}
        />

        <Stack.Screen
          name="AdminEditAllocation"
          component={AdminEditAllocationScreen}
          options={{ title: 'Edit Allocation' }}
        />
        <Stack.Screen
          name="AdminFundAllocationItem"
          component={AdminEditAllocationScreen}
          options={{ title: 'Allocation Details' }}
        />
        <Stack.Screen
          name="AdminRewards"
          component={AdminRewardsScreen}
          options={{
            title: 'Reward Catalogue',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdminRewardsEdit"
          component={AdminRewardsEditScreen}
          options={{
            title: 'Edit Reward',
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
        <Stack.Screen
          name="AnimalDetailView"
          component={AnimalDetail}
          options={{
            title: 'Animal Detail',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
      {shouldShowNav && <BottomNav />}
      {shouldShowNav && <AIAssistantFAB bottom={110} />}
    </View>
  );
};

export default AppNavigator;