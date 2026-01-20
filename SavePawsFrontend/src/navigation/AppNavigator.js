import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer, useNavigationState, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

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
import AdminAdoptionManagerScreen from '../features/adoption/screens/AdminAdoptionManagerScreen';
import AdminAdoptionDetailScreen from '../features/adoption/screens/AdminAdoptionDetailScreen';
import AnimalDetail from '../features/animals/components/AnimalDetail';
import AdoptionHistoryScreen from '../screens/adoption/AdoptionHistoryScreen';
import AdoptionRequestDetailScreen from '../screens/adoption/AdoptionRequestDetailScreen';
import AdoptionFollowUpScreen from '../screens/adoption/AdoptionFollowUpScreen';
import AnimalForm from '../screens/animal/AnimalForm';
import AnimalsScreen from '../screens/animal/AnimalsScreen';

// New Admin Management Screens
import AdminCommunityManagementPage from '../screens/adminCommunityManagementPage';
import AdminVolunteerHubScreen from '../screens/AdminVolunteerHubScreen';
import AdminVolunteerManagementPage from '../screens/adminVolunteerManagementPage'; // Unified fallback
import AdminEventManagementPage from '../screens/adminEventManagementPage';
import AdminRegistrationManagementPage from '../screens/adminRegistrationManagementPage';
import AdminRegistrationDetailsPage from '../screens/adminRegistrationDetailsPage';

// Volunteer Screens
import VolunteerRegistrationScreen from '../screens/volunteerRegistrationPage';
import VolunteerContributionScreen from '../screens/volunteerContributionPage';
import VolunteerEventListScreen from '../screens/volunteerEventListPage';
import VolunteerEventDetailsScreen from '../screens/volunteerEventDetailsPage';

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
    'AdminCommunityManagement',
    'AdminVolunteerHub',
    'AdminEventManagement',
    'AdminRegistrationManagement',
    'AdminRegistrationDetails',
    'AdminAdoptionManager',
    'AnimalDetailView',
    'AnimalsScreen',
  ];

  const hideFabScreens = [
    ...hideNavScreens,
    'AIAssistant',
    'ReportAnimal',
    'CommunityCreatePost',
    'AnimalForm',
    'AdoptionRequest',
    'CommunityPostDetails',
    'VolunteerRegistration',
    'VolunteerEventDetails',
  ];

  const shouldShowNav = currentRoute && !hideNavScreens.includes(currentRoute);
  const shouldShowFab = currentRoute && !hideFabScreens.includes(currentRoute);

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
          name="AdminCommunityManagement"
          component={AdminCommunityManagementPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminVolunteerHub"
          component={AdminVolunteerHubScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminEventManagement"
          component={AdminEventManagementPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminRegistrationManagement"
          component={AdminRegistrationManagementPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminVolunteerManagement"
          component={AdminVolunteerManagementPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminRegistrationDetails"
          component={AdminRegistrationDetailsPage}
          options={{ headerShown: false }}
        />
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
          name="AnimalScreen"
          component={AnimalListScreen}
          options={{
            title: 'Our Animals',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AnimalForm"
          component={AnimalForm}
          options={{
            title: 'Animal Form',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AnimalsScreen"
          component={AnimalsScreen}
          options={{
            title: 'Animals',
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
          name="AdoptionHistory"
          component={AdoptionHistoryScreen}
          options={{
            title: 'My Requests',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdoptionRequestDetail"
          component={AdoptionRequestDetailScreen}
          options={{
            title: 'Request Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AdoptionFollowUp"
          component={AdoptionFollowUpScreen}
          options={{
            title: 'Adoption Updates',
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
          name="AdminAdoptionManager"
          component={AdminAdoptionManagerScreen}
          options={{
            title: 'Adoption Management',
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
        {/* Volunteer Screens */}
        <Stack.Screen
          name="VolunteerRegistration"
          component={VolunteerRegistrationScreen}
          options={{
            title: 'Volunteer Registration',
            headerShown: true,
            headerStyle: { backgroundColor: '#14b8a6', shadowColor: 'transparent', elevation: 0 },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="VolunteerContribution"
          component={VolunteerContributionScreen}
          options={{
            title: 'My Contributions',
            headerShown: true,
            headerStyle: { backgroundColor: '#14b8a6', shadowColor: 'transparent', elevation: 0 },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="VolunteerEventList"
          component={VolunteerEventListScreen}
          options={{
            title: 'Volunteer Events',
            headerShown: true,
            headerStyle: { backgroundColor: '#14b8a6', shadowColor: 'transparent', elevation: 0 },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="VolunteerEventDetails"
          component={VolunteerEventDetailsScreen}
          options={{
            title: 'Event Details',
            headerShown: true,
            headerStyle: { backgroundColor: '#14b8a6', shadowColor: 'transparent', elevation: 0 },
            headerTintColor: '#ffffff',
          }}
        />
      </Stack.Navigator>
      {shouldShowFab && <FloatingAIButton />}
      {shouldShowNav && <BottomNav />}
    </View>
  );
};

const FloatingAIButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('AIAssistant')}
      activeOpacity={0.8}
    >
      <View style={styles.fabIconContainer}>
        <Ionicons name="chatbubbles" size={28} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90, // Above BottomNav (70px height) + padding
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14b8a6', // Primary Teal
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
  fabIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;