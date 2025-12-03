import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { COLORS, STATUS_OPTIONS } from '../utils/constants';
import { getStats, getAllReports } from '../services/api';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [animalStats, setAnimalStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const reports = await getAllReports();

      // Calculate status stats
      const statusStats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === 'pending').length,
        in_progress: reports.filter((r) => r.status === 'in_progress').length,
        resolved: reports.filter((r) => r.status === 'resolved').length,
        closed: reports.filter((r) => r.status === 'closed').length,
      };
      setStats(statusStats);

      // Calculate animal type stats
      const animalCount = {};
      reports.forEach((report) => {
        const type = report.animal_type;
        animalCount[type] = (animalCount[type] || 0) + 1;
      });
      setAnimalStats(animalCount);

      // Get recent reports (last 5)
      const recent = reports
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentReports(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : COLORS.textLight;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header Stats */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Total Reports</Text>
        <Text style={styles.headerNumber}>{stats.total}</Text>
        <Text style={styles.headerSubtitle}>All time animal reports</Text>
      </View>

      {/* Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#FFA500' }]}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#4169E1' }]}>
            <Text style={styles.statNumber}>{stats.in_progress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#32CD32' }]}>
            <Text style={styles.statNumber}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#808080' }]}>
            <Text style={styles.statNumber}>{stats.closed}</Text>
            <Text style={styles.statLabel}>Closed</Text>
          </View>
        </View>
      </View>

      {/* Animal Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports by Animal Type</Text>
        <View style={styles.animalStatsContainer}>
          {Object.entries(animalStats).map(([type, count]) => {
            const percentage = ((count / stats.total) * 100).toFixed(1);
            return (
              <View key={type} style={styles.animalStatRow}>
                <View style={styles.animalStatInfo}>
                  <Text style={styles.animalType}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text style={styles.animalCount}>
                    {count} reports ({percentage}%)
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${percentage}%`, backgroundColor: COLORS.primary },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ViewReports')}
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentReports.map((report) => (
          <View key={report.id} style={styles.recentReportCard}>
            <View style={styles.recentReportHeader}>
              <View style={styles.recentReportInfo}>
                <Text style={styles.recentReportType}>
                  {report.animal_type.charAt(0).toUpperCase() +
                    report.animal_type.slice(1)}
                </Text>
                <Text style={styles.recentReportDate}>
                  {formatDate(report.created_at)}
                </Text>
              </View>
              <View
                style={[
                  styles.recentStatusBadge,
                  { backgroundColor: getStatusColor(report.status) },
                ]}
              >
                <Text style={styles.recentStatusText}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.recentReportDesc} numberOfLines={2}>
              {report.description}
            </Text>
            <View style={styles.recentReportFooter}>
              <Text style={styles.recentReportLocation} numberOfLines={1}>
                📍 {report.location}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AdminManage')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionText}>Manage All Reports</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportAnimal')}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Create New Report</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Key Metrics Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Key Insights</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Active Cases:</Text>
          <Text style={styles.summaryValue}>
            {stats.pending + stats.in_progress}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Completion Rate:</Text>
          <Text style={styles.summaryValue}>
            {stats.total > 0
              ? ((stats.resolved / stats.total) * 100).toFixed(1)
              : 0}
            %
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Most Common Type:</Text>
          <Text style={styles.summaryValue}>
            {Object.entries(animalStats).length > 0
              ? Object.entries(animalStats).sort((a, b) => b[1] - a[1])[0][0]
                  .charAt(0)
                  .toUpperCase() +
                Object.entries(animalStats).sort((a, b) => b[1] - a[1])[0][0].slice(
                  1
                )
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  headerNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 45) / 2,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  animalStatsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
  },
  animalStatRow: {
    marginBottom: 15,
  },
  animalStatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  animalType: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  animalCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  recentReportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentReportInfo: {
    flex: 1,
  },
  recentReportType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  recentReportDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  recentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  recentStatusText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  recentReportDesc: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  recentReportFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  recentReportLocation: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionArrow: {
    fontSize: 28,
    color: COLORS.textLight,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default AdminDashboardScreen;