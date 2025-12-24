import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ApiService from '../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    approved: 0,
    closed: 0,
    critical: 0,
    high: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await ApiService.getAllReports();
      
      if (response.success && response.reports) {
        const reports = response.reports;
        
        // Calculate statistics
        const statsData = {
          total: reports.length,
          pending: reports.filter(r => r.status === 'pending').length,
          in_progress: reports.filter(r => r.status === 'in_progress').length,
          approved: reports.filter(r => r.status === 'approved').length,
          closed: reports.filter(r => r.status === 'closed').length,
          critical: reports.filter(r => r.urgency_level === 'critical').length,
          high: reports.filter(r => r.urgency_level === 'high').length,
        };
        
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => navigation.replace('Landing')
        }
      ]
    );
  };

  const quickActions = [
    { 
      icon: '📊', 
      title: 'View Reports', 
      desc: 'Review all submitted reports', 
      screen: 'AdminViewReport',
      badge: stats.total 
    },
    { 
      icon: '🚑', 
      title: 'Rescue Tasks', 
      desc: 'Assign & track rescues', 
      screen: 'ManageRescueTasks',
      badge: stats.critical + stats.high 
    },
    { 
      icon: '📈', 
      title: 'Statistics', 
      desc: 'View analytics', 
      screen: null 
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>🛡️ ADMIN</Text>
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14b8a6']}
            tintColor="#14b8a6"
          />
        }
      >
        <View style={styles.content}>
          {/* Urgent Alerts */}
          {(stats.critical > 0 || stats.high > 0 || stats.pending > 0) && (
            <View style={styles.urgentAlerts}>
              <View style={styles.alertHeader}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.alertTitle}>Urgent Attention Required</Text>
              </View>
              {stats.critical > 0 && (
                <View style={styles.alertItem}>
                  <Text style={styles.alertText}>
                    <Text style={styles.alertBold}>{stats.critical} Critical Report{stats.critical > 1 ? 's' : ''}</Text> need immediate attention
                  </Text>
                </View>
              )}
              {stats.high > 0 && (
                <View style={styles.alertItem}>
                  <Text style={styles.alertText}>
                    <Text style={styles.alertBold}>{stats.high} High Priority Task{stats.high > 1 ? 's' : ''}</Text> require review
                  </Text>
                </View>
              )}
              {stats.pending > 0 && (
                <View style={styles.alertItem}>
                  <Text style={styles.alertText}>
                    <Text style={styles.alertBold}>{stats.pending} Pending Report{stats.pending > 1 ? 's' : ''}</Text> awaiting assignment
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Statistics */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#14b8a6' }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
              <Text style={styles.statTrend}>All time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statTrend}>Need assignment</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{stats.in_progress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
              <Text style={styles.statTrend}>Active rescues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
              <Text style={styles.statTrend}>Tasks approved</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.actionCard}
                onPress={() => action.screen && navigation.navigate(action.screen)}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>{action.icon}</Text>
                  {action.badge > 0 && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc}>{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Urgency Breakdown */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgency Levels</Text>
          </View>

          <View style={styles.urgencyList}>
            <View style={[styles.urgencyItem, { borderLeftColor: '#991b1b' }]}>
              <View style={styles.urgencyInfo}>
                <Text style={styles.urgencyLabel}>Critical</Text>
                <Text style={styles.urgencyDesc}>Immediate attention required</Text>
              </View>
              <Text style={[styles.urgencyCount, { color: '#991b1b' }]}>{stats.critical}</Text>
            </View>

            <View style={[styles.urgencyItem, { borderLeftColor: '#ef4444' }]}>
              <View style={styles.urgencyInfo}>
                <Text style={styles.urgencyLabel}>High Priority</Text>
                <Text style={styles.urgencyDesc}>Urgent response needed</Text>
              </View>
              <Text style={[styles.urgencyCount, { color: '#ef4444' }]}>{stats.high}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5b6b7c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#14b8a6',
  },
  adminBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  urgentAlerts: {
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  alertItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#78350f',
  },
  alertBold: {
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8ef',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#5b6b7c',
    textAlign: 'center',
  },
  statTrend: {
    fontSize: 12,
    color: '#5b6b7c',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
    borderColor: '#ccfbf1',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    position: 'relative',
    width: 56,
    height: 56,
    backgroundColor: '#14b8a6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0fdfa',
  },
  actionBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 12,
    color: '#5b6b7c',
    textAlign: 'center',
  },
  urgencyList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8ef',
    borderRadius: 14,
    overflow: 'hidden',
  },
  urgencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8ef',
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  urgencyDesc: {
    fontSize: 12,
    color: '#5b6b7c',
  },
  urgencyCount: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default AdminDashboardScreen;