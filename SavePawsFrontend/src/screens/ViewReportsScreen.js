import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, ReportStatusLabels } from '../constants';
import ApiService from '../services/api';

const UserViewReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, active, closed

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await ApiService.getUserReports();
      if (response.success) {
        setReports(response.reports || []);
      } else {
        Alert.alert('Error', 'Failed to load reports');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getFilteredReports = () => {
    if (activeTab === 'all') return reports;
    if (activeTab === 'pending') {
      return reports.filter((r) => r.status === 'pending');
    }
    if (activeTab === 'approved') {
      return reports.filter((r) => r.status === 'approved');
    }
    if (activeTab === 'active') {
      return reports.filter((r) => r.status === 'active');
    }
    if (activeTab === 'closed') {
      return reports.filter((r) => r.status === 'closed');
    }
    return reports;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff5e6',
      active: '#e0f2fe', // Blue background for active
      approved: Colors.primaryLight,
      closed: Colors.gray100,
    };
    return colors[status] || Colors.gray100;
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#f2994a',
      active: '#0369a1', // Blue text for active
      approved: Colors.primary700,
      closed: Colors.gray600,
    };
    return colors[status] || Colors.gray600;
  };

  const filteredReports = getFilteredReports();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Reports</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reports.length}</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View> */}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All
          </Text>
          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending
          </Text>
          {activeTab === 'pending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Approved
          </Text>
          {activeTab === 'approved' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
          {activeTab === 'active' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'closed' && styles.tabActive]}
          onPress={() => setActiveTab('closed')}
        >
          <Text style={[styles.tabText, activeTab === 'closed' && styles.tabTextActive]}>
            Closed
          </Text>
          {activeTab === 'closed' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all'
                ? 'Submit your first report to help animals in need'
                : activeTab === 'pending'
                ? 'No pending reports'
                : activeTab === 'approved'
                ? 'No approved reports'
                : activeTab === 'active'
                ? 'No active reports'
                : 'No closed reports'}
            </Text>
            {activeTab === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('ReportAnimal')}
              >
                <Text style={styles.emptyButtonText}>Report Animal</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => {
                Alert.alert(
                  `Report #${report.id}`,
                  `Status: ${ReportStatusLabels[report.status]}\nLocation: ${report.location_address || report.location || 'N/A'}\n\n${report.description}`
                );
              }}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportId}>Report #{report.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusTextColor(report.status) },
                    ]}
                  >
                    {ReportStatusLabels[report.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.reportBody}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Animal:</Text>
                  <Text style={styles.reportValue}>
                    {report.animal_type === 'dog'
                      ? '🐕 Dog'
                      : report.animal_type === 'cat'
                      ? '🐈 Cat'
                      : '🐾 Other'}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Location:</Text>
                  <Text style={styles.reportValue} numberOfLines={1}>
                    📍 {report.location_address || report.location || 'N/A'}
                  </Text>
                </View>

                {report.animal_condition && (
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Condition:</Text>
                    <Text style={styles.reportValue} numberOfLines={1}>
                      {report.animal_condition}
                    </Text>
                  </View>
                )}

                <Text style={styles.reportDesc} numberOfLines={2}>
                  {report.description}
                </Text>

                <View style={styles.reportFooter}>
                  <Text style={styles.reportDate}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.reportTime}>
                    {new Date(report.created_at).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('UserHome')}
        >
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AcceptRescueTask')}
        >
          <Text style={styles.navIcon}>🚑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ReportAnimal')}
        >
          <Text style={styles.navIconLarge}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>✉</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FontSizes.xxl,
    color: Colors.text,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary700,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: 100,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reportId: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reportBody: {
    gap: Spacing.md,
  },
  reportRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reportLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    minWidth: 80,
  },
  reportValue: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  reportDesc: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  reportDate: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  reportTime: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingHorizontal: Spacing.xxl,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  navIconActive: {
    color: Colors.primary700,
  },
  navIconLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  navDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.primary700,
    borderRadius: 3,
    marginTop: 4,
  },
});

export default UserViewReportsScreen;