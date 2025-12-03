import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

export default function SavePawsHomeScreen() {
  const handleSOSPress = () => {
    Alert.alert(
      '🚨 EMERGENCY REPORT',
      'Are you reporting a critical animal emergency that needs immediate attention?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log('Navigate to report') }
      ]
    );
  };

  const handleNotificationPress = () => {
    Alert.alert(
      '🔔 Notifications',
      '• Your report #1234 has been assigned\n• New adoption: Max is available\n• Volunteer event tomorrow at 2 PM'
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.btnIcon} accessible accessibilityLabel="Menu">
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.subtle}>Hello Karen!</Text>
          <Text style={styles.h2}>Ready to Rescue?</Text>
        </View>
        <View style={styles.topbarRight}>
          <TouchableOpacity 
            style={styles.notificationBadge} 
            accessible 
            accessibilityLabel="Notifications"
            onPress={handleNotificationPress}
          >
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        {/* Hero Section with Search */}
        <View style={styles.homeHero}>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search nearest NGO or shelter"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.btnIcon} accessible accessibilityLabel="Filters">
              <Text>≡</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.homeQuick}>
            <TouchableOpacity style={[styles.quickCard, styles.quickCardAccent]}>
              <View style={[styles.quickIcon, styles.quickIconAccent]}>
                <Text style={styles.quickIconText}>🐾</Text>
              </View>
              <Text style={styles.h3}>Report Animal</Text>
              <Text style={styles.textMuted}>Help a stray animal in need</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard}>
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>📋</Text>
              </View>
              <Text style={styles.h3}>My Reports</Text>
              <Text style={styles.textMuted}>Track your submitted reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,247</Text>
            <Text style={styles.statLabel}>Animals Rescued</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>523</Text>
            <Text style={styles.statLabel}>Volunteers</Text>
          </View>
        </View>

        {/* Animals Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.strong}>Available for Adoption</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.petsGrid}
          >
            <View style={styles.petCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop' }}
                style={styles.petImage}
              />
              <View style={styles.petCardMeta}>
                <Text style={styles.petCardName}>Jodo</Text>
                <Text style={styles.petCardBreed}>Golden Retriever</Text>
              </View>
            </View>
            <View style={styles.petCard}>
              <Image
                source={require('@/assets/images/animal1.jpeg')}
                style={styles.petImage}
              />
              <View style={styles.petCardMeta}>
                <Text style={styles.petCardName}>Whiskers</Text>
                <Text style={styles.petCardBreed}>Abyssinian</Text>
              </View>
            </View>
            <View style={styles.petCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=800&auto=format&fit=crop' }}
                style={styles.petImage}
              />
              <View style={styles.petCardMeta}>
                <Text style={styles.petCardName}>Luna</Text>
                <Text style={styles.petCardBreed}>Devon Rex</Text>
              </View>
            </View>
            <View style={styles.petCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800&auto=format&fit=crop' }}
                style={styles.petImage}
              />
              <View style={styles.petCardMeta}>
                <Text style={styles.petCardName}>Max</Text>
                <Text style={styles.petCardBreed}>Siberian Husky</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.strong}>How SavePaws Helps</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🚨</Text>
              <Text style={styles.strong}>Quick Rescue</Text>
              <Text style={styles.featureText}>Report and track animal rescues in real-time</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏠</Text>
              <Text style={styles.strong}>Adoption</Text>
              <Text style={styles.featureText}>Find your perfect companion to adopt</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.strong}>Donate</Text>
              <Text style={styles.featureText}>Support animals with transparent donations</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => router.push('/(tabs)/contribution')}
            >
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={styles.strong}>Volunteer</Text>
              <Text style={styles.featureText}>Join our community of animal rescuers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.strong}>Recent Updates</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listIcon}>✅</Text>
              <View>
                <Text style={styles.listTitle}>Rescue Successful</Text>
                <Text style={styles.listSubtitle}>Dog rescued in Skudai • 2 hours ago</Text>
              </View>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listIcon}>🐈</Text>
              <View>
                <Text style={styles.listTitle}>New Adoption Available</Text>
                <Text style={styles.listSubtitle}>Luna is ready for a new home • 5 hours ago</Text>
              </View>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listIcon}>💰</Text>
              <View>
                <Text style={styles.listTitle}>Donation Received</Text>
                <Text style={styles.listSubtitle}>RM 500 donated for medical care • 1 day ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* SOS Emergency Button */}
      <TouchableOpacity 
        style={styles.sosBadge} 
        accessible 
        accessibilityLabel="Emergency SOS"
        onPress={handleSOSPress}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  btnIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconText: {
    fontSize: 20,
  },
  subtle: {
    fontSize: 12,
    color: '#999',
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBadge: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#f25f5c',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 120,
  },
  homeHero: {
    gap: 16,
    marginBottom: 24,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  homeQuick: {
    flexDirection: 'row',
    gap: 16,
  },
  quickCard: {
    flex: 1,
    gap: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  quickCardAccent: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickIconAccent: {
    backgroundColor: '#fff',
    borderColor: 'transparent',
  },
  quickIconText: {
    fontSize: 24,
  },
  textMuted: {
    fontSize: 12,
    color: '#999',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  strong: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: '#999',
  },
  petsGrid: {
    flexDirection: 'row',
  },
  petCard: {
    width: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  petImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  petCardMeta: {
    padding: 12,
  },
  petCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  petCardBreed: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  list: {
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  sosBadge: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f25f5c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f25f5c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  sosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bottomNavActive: {
    // Active state
  },
  navIcon: {
    fontSize: 24,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196f3',
    marginTop: 4,
  },
});