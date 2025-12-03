import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, SCREENS } from '../utils/constants';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const menuItems = [
    {
      id: 1,
      title: 'Report Animal',
      subtitle: 'Report a stray or injured animal',
      icon: '🐕',
      screen: SCREENS.REPORT_ANIMAL,
      color: COLORS.secondary,
    },
    {
      id: 2,
      title: 'View Reports',
      subtitle: 'Browse all animal reports',
      icon: '📋',
      screen: SCREENS.VIEW_REPORTS,
      color: COLORS.primary,
    },
    {
      id: 3,
      title: 'Admin Dashboard',
      subtitle: 'View statistics and analytics',
      icon: '📊',
      screen: SCREENS.ADMIN_DASHBOARD,
      color: COLORS.warning,
    },
    {
      id: 4,
      title: 'Manage Reports',
      subtitle: 'Update and manage reports',
      icon: '⚙️',
      screen: SCREENS.ADMIN_MANAGE,
      color: COLORS.danger,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🐾</Text>
          <Text style={styles.logoText}>SavePaws</Text>
        </View>
        <Text style={styles.tagline}>
          Helping Animals, One Report at a Time
        </Text>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroText}>
          Report stray or injured animals in your area and help make a difference!
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Spot an animal in need</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Report with location & photo</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>We coordinate rescue efforts</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Together, we can save more animals! 🐾
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  heroBanner: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  heroText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 15,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 28,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  menuArrow: {
    fontSize: 30,
    color: COLORS.textLight,
    marginLeft: 10,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    gap: 15,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});

export default HomeScreen;