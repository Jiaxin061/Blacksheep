import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, SCREENS } from '../utils/constants';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import ReportAnimalScreen from '../screens/ReportAnimalScreen';
import ViewReportsScreen from '../screens/ViewReportsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminManageScreen from '../screens/AdminManageScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.HOME}
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
        <Stack.Screen
          name={SCREENS.HOME}
          component={HomeScreen}
          options={{
            title: 'SavePaws',
            headerStyle: {
              backgroundColor: COLORS.primary,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
        <Stack.Screen
          name={SCREENS.REPORT_ANIMAL}
          component={ReportAnimalScreen}
          options={{
            title: 'Report Animal',
          }}
        />
        <Stack.Screen
          name={SCREENS.VIEW_REPORTS}
          component={ViewReportsScreen}
          options={{
            title: 'View Reports',
          }}
        />
        <Stack.Screen
          name={SCREENS.ADMIN_DASHBOARD}
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen
          name={SCREENS.ADMIN_MANAGE}
          component={AdminManageScreen}
          options={{
            title: 'Manage Reports',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;