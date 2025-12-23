import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' }, // Hide the tab bar
      }}>
      <Tabs.Screen
        name="adminManageRegiater"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TextIcon icon="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminHomePage"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <TextIcon icon="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminRegisterDetails"
        options={{
          href: null, // Hide from tab bar as it's a detail screen
        }}
      />
    </Tabs>
  );
}

const TextIcon = ({ icon, color }: { icon: string, color: string }) => (
  <Text style={{ color, fontSize: 24 }}>{icon}</Text>
);
