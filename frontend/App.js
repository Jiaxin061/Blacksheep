import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import AnimalsScreen from './src/features/animals/screens/AnimalsScreen';
import AnimalDetail from './src/features/animals/components/AnimalDetail';
import AnimalForm from './src/features/animals/components/AnimalForm';
import UserPortalScreen from './src/features/user/screens/UserPortalScreen';
import AdoptionHubScreen from './src/features/adoption/screens/AdoptionHubScreen';
import AdoptionRequestScreen from './src/features/adoption/screens/AdoptionRequestScreen';
import AdminAdoptionListScreen from './src/features/adoption/screens/AdminAdoptionListScreen';
import AdminAdoptionDetailScreen from './src/features/adoption/screens/AdminAdoptionDetailScreen';

import AdoptionFollowUpScreen from './src/features/adoption/screens/AdoptionFollowUpScreen';
import AdminAdoptionUpdatesScreen from './src/features/adoption/screens/AdminAdoptionUpdatesScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

export default function App() {
  const isAdmin = true; // Change based on actual user role
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2196F3',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Animals"
            component={AnimalsScreen}
            initialParams={{ isAdmin }}
            options={{ title: 'Animal Records' }}
          />
          <Stack.Screen
            name="UserPortal"
            component={UserPortalScreen}
            options={{ title: 'For Visitors' }}
          />
          <Stack.Screen
            name="AnimalDetail"
            component={AnimalDetail}
            initialParams={{ isAdmin }}
            options={{ title: 'Animal Details' }}
          />
          <Stack.Screen
            name="AnimalForm"
            component={AnimalForm}
            options={{ title: 'Animal Record' }}
          />
          <Stack.Screen
            name="AdminAdoptionList"
            component={AdminAdoptionListScreen}
            options={{ title: 'Adoption Requests' }}
          />
          <Stack.Screen
            name="AdminAdoptionDetail"
            component={AdminAdoptionDetailScreen}
            options={{ title: 'Request Details' }}
          />
          <Stack.Screen
            name="AdoptionHub"
            component={AdoptionHubScreen}
            options={{ title: 'Adoption Hub' }}
          />
          <Stack.Screen
            name="AdoptionRequest"
            component={AdoptionRequestScreen}
            options={{ title: 'Adopt Me' }}
          />
          <Stack.Screen
            name="AdoptionFollowUp"
            component={AdoptionFollowUpScreen}
            options={{ title: 'Adoption Follow-up' }}
          />
          <Stack.Screen
            name="AdminAdoptionUpdates"
            component={AdminAdoptionUpdatesScreen}
            options={{ title: 'Adoption Updates' }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <StatusBar style="dark" />
      <Image
        source={require('./assets/image.png')}
        style={styles.loadingLogo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="SavePaws logo"
      />
      <Text style={styles.loadingSubtitle}>Getting things ready for your pawsome day...</Text>
      <ActivityIndicator size="large" color="#E91E63" style={styles.loadingSpinner} />
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // User-facing features
  const userFeatures = [
    {
      icon: '💙',
      title: 'User Side',
      description: 'Experience the visitor-facing view & search.',
      action: () => navigation.navigate('UserPortal', { initialSection: 'view' }),
      color: '#00BCD4',
    },
    {
      icon: '❤️',
      title: 'Adoption Hub',
      description: 'Browse animals available for adoption',
      action: () => navigation.navigate('AdoptionHub'),
      color: '#E91E63',
    },
    {
      icon: '📸',
      title: 'Adoption Follow-up',
      description: 'Share updates about your adopted pet',
      action: () => navigation.navigate('AdoptionFollowUp'),
      color: '#9C27B0',
    },
  ];

  // Admin-only features
  const adminFeatures = [
    {
      icon: '🐕',
      title: 'Animal Records',
      description: 'View and manage all shelter animals',
      action: () => navigation.navigate('Animals', { isAdmin: true }),
      color: '#2196F3',
    },
    {
      icon: '📝',
      title: 'Adoption Requests',
      description: 'Review and manage adoption applications',
      action: () => navigation.navigate('AdminAdoptionList'),
      color: '#4CAF50',
    },
    {
      icon: '🔍',
      title: 'Search & Filter',
      description: 'Find animals by species, breed, or status',
      action: () => navigation.navigate('Animals', { initialTab: 'search', isAdmin: true }),
      color: '#FF9800',
    },
    {
      icon: '👀',
      title: 'Review Updates',
      description: 'Check post-adoption updates from users',
      action: () => navigation.navigate('AdminAdoptionUpdates'),
      color: '#607D8B',
    },
  ];

  const stats = [
    { number: '250+', label: 'Animals Saved', icon: '🐾' },
    { number: '180+', label: 'Adopted', icon: '🏠' },
    { number: '45', label: 'Volunteers', icon: '👥' },
  ];

  return (
    <View style={styles.homeContainer}>
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#0D47A1']}
        style={styles.gradientHeader}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.appTitle}>SavePaws</Text>
          <Text style={styles.appSubtitle}>Animal Shelter Management System</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>

        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
          <Text style={styles.welcomeText}>
            Manage your shelter animals, track adoptions, and make a difference in their lives.
          </Text>
        </Animated.View>

        {/* User Features */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>User Features</Text>
        </View>
        <View style={styles.featuresGrid}>
          {userFeatures.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.featureCard]}
                onPress={feature.action}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={feature.title}
                accessibilityHint={feature.description}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Text style={styles.featureArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Admin Features */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Admin Features</Text>
        </View>
        <View style={styles.featuresGrid}>
          {adminFeatures.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.featureCard]}
                onPress={feature.action}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={feature.title}
                accessibilityHint={feature.description}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Text style={styles.featureArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActionsSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Animals')}
              accessibilityRole="button"
              accessibilityLabel="View all animals"
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>View All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AnimalForm')}
              accessibilityRole="button"
              accessibilityLabel="Add new animal"
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Animals', { initialTab: 'search' })}
              accessibilityRole="button"
              accessibilityLabel="Search animals"
            >
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionText}>Search</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for animals in need</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 45 : 30,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 18,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    minWidth: 90,
    backdropFilter: 'blur(10px)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresGrid: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  featureArrow: {
    fontSize: 20,
    color: '#2196F3',
    marginLeft: 8,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: '#ccc',
  },
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
  loadingTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#5d1a24',
    marginBottom: 6,
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