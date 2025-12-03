import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'; 

export default function AdminHomeScreen() {
  const adminData = {
    name: 'Admin',
    pendingReports: 12,
    pendingAdoptions: 8,
    pendingVolunteers: 5,
    pendingDonations: 3
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => console.log('Logout') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{adminData.name}! 👨‍💼</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Admin Dashboard Title */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Manage all SavePaws services</Text>
        </View>

        {/* Pending Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{adminData.pendingReports}</Text>
            <Text style={styles.summaryLabel}>Rescue Reports</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{adminData.pendingAdoptions}</Text>
            <Text style={styles.summaryLabel}>Pending Adoptions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{adminData.pendingVolunteers}</Text>
            <Text style={styles.summaryLabel}>Pending Volunteers</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{adminData.pendingDonations}</Text>
            <Text style={styles.summaryLabel}>View Donations</Text>
          </View>
        </View>

        {/* Management Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management Options</Text>

          {/* Manage Reports */}
          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => Alert.alert('Coming Soon', 'Manage Reports feature')}
          >
            <View style={styles.managementIcon}>
              <Text style={styles.managementIconText}>📋</Text>
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Manage Reports</Text>
              <Text style={styles.managementDescription}>
                Review and process animal rescue reports
              </Text>
            </View>
            <View style={styles.managementBadge}>
              <Text style={styles.managementBadgeText}>{adminData.pendingReports}</Text>
            </View>
          </TouchableOpacity>

          {/* Manage Adoptions */}
          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => Alert.alert('Coming Soon', 'Manage Adoptions feature')}
          >
            <View style={styles.managementIcon}>
              <Text style={styles.managementIconText}>🐾</Text>
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Manage Adoptions</Text>
              <Text style={styles.managementDescription}>
                Approve or reject adoption applications
              </Text>
            </View>
            <View style={styles.managementBadge}>
              <Text style={styles.managementBadgeText}>{adminData.pendingAdoptions}</Text>
            </View>
          </TouchableOpacity>

          {/* Manage Volunteers */}
          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => router.push('/(tabs)/adminManageRegister')}
          >
            <View style={styles.managementIcon}>
              <Text style={styles.managementIconText}>🤝</Text>
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Manage Volunteers</Text>
              <Text style={styles.managementDescription}>
                Review volunteer registration requests
              </Text>
            </View>
            <View style={styles.managementBadge}>
              <Text style={styles.managementBadgeText}>{adminData.pendingVolunteers}</Text>
            </View>
          </TouchableOpacity>

          {/* Manage Donations */}
          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => Alert.alert('Coming Soon', 'Manage Donations feature')}
          >
            <View style={styles.managementIcon}>
              <Text style={styles.managementIconText}>💰</Text>
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Manage Donations</Text>
              <Text style={styles.managementDescription}>
                Track and verify donation transactions
              </Text>
            </View>
            <View style={styles.managementBadge}>
              <Text style={styles.managementBadgeText}>{adminData.pendingDonations}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View Statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionText}>User Management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>📢</Text>
              <Text style={styles.quickActionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>✅</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Volunteer Approved</Text>
              <Text style={styles.activityDescription}>John Doe's registration was approved</Text>
              <Text style={styles.activityTime}>5 minutes ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>📋</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Report Submitted</Text>
              <Text style={styles.activityDescription}>Injured dog reported in Skudai area</Text>
              <Text style={styles.activityTime}>15 minutes ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>🐾</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Adoption Completed</Text>
              <Text style={styles.activityDescription}>Max was successfully adopted</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  managementIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  managementIconText: {
    fontSize: 28,
  },
  managementContent: {
    flex: 1,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  managementDescription: {
    fontSize: 13,
    color: '#666',
  },
  managementBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  managementBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});