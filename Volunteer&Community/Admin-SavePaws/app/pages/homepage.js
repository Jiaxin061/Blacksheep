// File: homepage.js
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import React, { useState } from 'react';

// 1. IMPORT THE HOOK
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router'; // ✨ FIX: Import 'router'

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------


// 2. USE A CONSISTENT COMPONENT NAME (HomePage)
const HomePage = () => {
  // 3. INITIALIZE NAVIGATION HERE
  const navigation = useNavigation();

  const [volunteerModalVisible, setVolunteerModalVisible] = useState(false);

  // NEW: Handler for the Volunteer button press
  const handleVolunteerPress = () => {
    setVolunteerModalVisible(true);
  };


  // Data Definitions (UNCHANGED)
  const mainActions = [
    {
      id: 1,
      title: 'Report Animal',
      subtitle: 'Report a stray or injured animal',
      icon: '🐕',
      screen: 'ReportAnimal',
      color: '#14b8a6',
      isMain: true,
    },
  ];

  const secondaryActions = [
    {
      id: 2,
      title: 'My Reports',
      subtitle: 'View your submitted reports',
      icon: '📋',
      screen: 'ViewReports',
      color: '#0f766e',
    },
    {
      id: 3,
      title: 'Accept Rescue Task',
      subtitle: 'Help rescue reported animals',
      icon: '🚑',
      screen: 'AcceptRescueTask',
      color: '#f59e0b',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Admin! 👋</Text>
          <Text style={styles.headerSubtitle}>How can we help today?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Action - Report Animal */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.mainActionCard}
            onPress={() => navigation.navigate('ReportAnimal')}
            activeOpacity={0.9}
          >
            <View style={styles.mainActionIcon}>
              <Text style={styles.mainActionEmoji}>🐕</Text>
            </View>
            <View style={styles.mainActionContent}>
              <Text style={styles.mainActionTitle}>Report Animal</Text>
              <Text style={styles.mainActionSubtitle}>
                Found a stray or injured animal? Report it now to help save a life
              </Text>
            </View>
            <View style={styles.mainActionArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Actions</Text>
          <View style={styles.actionsGrid}>
            {secondaryActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Services - Volunteer Link MODIFIED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Services</Text>

          <View style={styles.servicesRow}>

            {/* 1. ADOPT BUTTON */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Adopt')}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#ec489920' }]}>
                <Text style={styles.serviceEmoji}>❤️</Text>
              </View>
              <Text style={styles.serviceTitle}>Adopt</Text>
              <Text style={styles.serviceSubtitle}>Find your new friend</Text>
            </TouchableOpacity>

            {/* 2. DONATE BUTTON */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Donate')}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#8b5cf620' }]}>
                <Text style={styles.serviceEmoji}>💰</Text>
              </View>
              <Text style={styles.serviceTitle}>Donate</Text>
              <Text style={styles.serviceSubtitle}>Support our mission</Text>
            </TouchableOpacity>

            {/* 3. VOLUNTEER BUTTON */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={handleVolunteerPress}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#10b98120' }]}>
                <Text style={styles.serviceEmoji}>🤝</Text>
              </View>
              <Text style={styles.serviceTitle}>Volunteer</Text>
              <Text style={styles.serviceSubtitle}>Manage & Participate</Text>
            </TouchableOpacity>

            {/* 3. ADMIN: MANAGE POSTS */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => router.push('/pages/adminCommunityManagementPage')}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#ef444420' }]}>
                <Text style={styles.serviceEmoji}>🛡️</Text>
              </View>
              <Text style={styles.serviceTitle}>Manage Posts</Text>
              <Text style={styles.serviceSubtitle}>Admin Moderation</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Impact</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Rescued</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Volunteer Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={volunteerModalVisible}
          onRequestClose={() => setVolunteerModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Volunteer Services</Text>
                <TouchableOpacity
                  onPress={() => setVolunteerModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalOptions}>

                {/* Admin Option: Manage Requests */}
                <TouchableOpacity
                  style={styles.modalOptionCard}
                  onPress={() => {
                    setVolunteerModalVisible(false);
                    router.push('/pages/adminRegistrationManagementPage');
                  }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#f59e0b20' }]}>
                    <Text style={styles.optionEmoji}>📝</Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Manage Requests</Text>
                    <Text style={styles.optionSubtitle}>Approve volunteer applications</Text>
                  </View>
                </TouchableOpacity>

                {/* Admin Option: Manage Events */}
                <TouchableOpacity
                  style={styles.modalOptionCard}
                  onPress={() => {
                    setVolunteerModalVisible(false);
                    router.push('/pages/adminEventManagementPage');
                  }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#3b82f620' }]}>
                    <Text style={styles.optionEmoji}>📅</Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Manage Events</Text>
                    <Text style={styles.optionSubtitle}>Create and edit volunteer events</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add padding to ensure the last content is visible above the bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Home (Active) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>

        {/* Tab 2: View Reports */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ViewReports')}
        >
          <Text style={styles.navIcon}>📋</Text>
        </TouchableOpacity>

        {/* Tab 3: Report Animal (Main Button) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ReportAnimal')}
        >
          <View style={styles.navMainButton}>
            <Text style={styles.navMainIcon}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 4: Accept Rescue Task */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AcceptRescueTask')}
        >
          <Text style={styles.navIcon}>🚑</Text>
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles remain UNCHANGED
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14b8a6',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccfbf1',
  },
  profileButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  mainActionCard: {
    backgroundColor: '#14b8a6',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainActionIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainActionEmoji: {
    fontSize: 32,
  },
  mainActionContent: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  mainActionSubtitle: {
    fontSize: 13,
    color: '#ccfbf1',
    lineHeight: 18,
  },
  mainActionArrow: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#5b6b7c',
  },

  // --- SERVICE STYLES ---
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping
    justifyContent: 'space-between',
    gap: 12, // Add gap for vertical spacing
  },
  serviceCard: {
    width: '48%', // Approx half width for 2-column grid
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 0, // Handled by gap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 11,
    color: '#5b6b7c',
    textAlign: 'center',
  },
  // ------------------------------

  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8ef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5b6b7c',
  },
  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8ef',
    paddingHorizontal: 24,
    position: 'absolute', // Ensures it stays at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navDot: {
    width: 6,
    height: 6,
    backgroundColor: '#14b8a6',
    borderRadius: 3,
    marginTop: 4,
  },
  navMainButton: {
    width: 56,
    height: 56,
    backgroundColor: '#14b8a6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navMainIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalOptions: {
    gap: 12,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default HomePage;