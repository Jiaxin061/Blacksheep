import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { COLORS, STATUS_OPTIONS } from '../utils/constants';
import { getAllReports } from '../services/api';

const ViewReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch reports
  const fetchReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  // Filter reports by status
  const filterReports = (status) => {
    setSelectedFilter(status);
    if (status === 'all') {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter((report) => report.status === status);
      setFilteredReports(filtered);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : COLORS.textLight;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render report card
  const renderReportCard = ({ item }) => (
    <View style={styles.reportCard}>
      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
      </View>

      {/* Image */}
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.reportImage}
          resizeMode="cover"
        />
      )}

      {/* Report Info */}
      <View style={styles.reportInfo}>
        <View style={styles.reportHeader}>
          <Text style={styles.animalType}>
            {item.animal_type.charAt(0).toUpperCase() + item.animal_type.slice(1)}
          </Text>
          <Text style={styles.reportId}>#{item.id}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.reportFooter}>
          <View style={styles.reporterInfo}>
            <Text style={styles.reporterLabel}>Reported by:</Text>
            <Text style={styles.reporterName}>{item.reporter_name}</Text>
          </View>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>

        {item.reporter_contact && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contact}>{item.reporter_contact}</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No reports found</Text>
      <Text style={styles.emptySubtext}>
        {selectedFilter === 'all'
          ? 'Be the first to report an animal in need!'
          : `No ${getStatusLabel(selectedFilter).toLowerCase()} reports`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => filterReports('all')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'all' && styles.filterTextActive,
            ]}
          >
            All ({reports.length})
          </Text>
        </TouchableOpacity>
        {STATUS_OPTIONS.map((status) => {
          const count = reports.filter((r) => r.status === status.value).length;
          return (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.filterTab,
                selectedFilter === status.value && styles.filterTabActive,
                selectedFilter === status.value && { borderBottomColor: status.color },
              ]}
              onPress={() => filterReports(status.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === status.value && styles.filterTextActive,
                ]}
              >
                {status.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportImage: {
    width: '100%',
    height: 200,
  },
  reportInfo: {
    padding: 15,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  reportId: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  location: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  reporterName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  contact: {
    fontSize: 13,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default ViewReportsScreen;