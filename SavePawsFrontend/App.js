import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Internal Import
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate initial loading (e.g., checking authentication or loading assets)
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // 1. Show Splash/Loading Screen while app initializes
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  // 2. Render your full navigation stack
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

/**
 * LoadingScreen Component
 * Displays your logo and a spinner during the initial 1.2s delay
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <StatusBar style="dark" />
      <Image
        source={require('./assets/image.png')} // Ensure this path is correct
        style={styles.loadingLogo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="SavePaws logo"
      />
      <Text style={styles.loadingSubtitle}>
        Getting things ready for your pawsome day...
      </Text>
      <ActivityIndicator
        size="large"
        color="#14b8a6" // Updated to match your AppNavigator teal theme
        style={styles.loadingSpinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingLogo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#7a4c58',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingSpinner: {
    marginTop: 8,
  },
});