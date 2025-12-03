import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AdminManageRegisterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  // Mock data - replace with actual database data later
  const [volunteers, setVolunteers] = useState([
    {
      id: 1,
      name: 'John Doe',
      location: 'Skudai, Johor',
      experience: 'Volunteered at animal shelter for 2 years',
      capability: 'Animal feeding, transportation',
      status: 'pending',
      submittedDate: '2025-11-15',
    },
    {
      id: 2,
      name: 'Sarah Lee',
      location: 'Johor Bahru',
      experience: 'Pet owner with rescue experience',
      capability: 'Foster care, event organization',
      status: 'pending',
      submittedDate: '2025-11-16',
    },
    {
      id: 3,
      name: 'Ahmad Hassan',
      location: 'Taman Universiti',
      experience: 'First time volunteer, eager to learn',
      capability: 'Weekend availability, social media promotion',
      status: 'pending',
      submittedDate: '2025-11-17',
    },
    {
      id: 4,
      name: 'Michelle Tan',
      location: 'Permas Jaya',
      experience: 'Veterinary assistant background',
      capability: 'Medical support, training',
      status: 'approved',
      submittedDate: '2025-11-10',
    },
    {
      id: 5,
      name: 'David Wong',
      location: 'Mount Austin',
      experience: 'Incomplete information',
      capability: 'Not specified',
      status: 'rejected',
      submittedDate: '2025-11-12',
    },
  ]);

  const handleViewDetails = (volunteer: any) => {
    router.push({
      pathname: '/(tabs)/adminRegisterDetails',
      params: { volunteerId: volunteer.id }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || volunteer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const pendingCount = volunteers.filter(v => v.status === 'pending').length;
  const approvedCount = volunteers.filter(v => v.status === 'approved').length;
  const rejectedCount = volunteers.filter(v => v.status === 'rejected').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Volunteer Registrations</Text>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ff9800' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4caf50' }]}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f44336' }]}>{rejectedCount}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
              All ({volunteers.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'pending' && styles.filterChipActive]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'approved' && styles.filterChipActive]}
            onPress={() => setFilterStatus('approved')}
          >
            <Text style={[styles.filterText, filterStatus === 'approved' && styles.filterTextActive]}>
              Approved ({approvedCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'rejected' && styles.filterChipActive]}
            onPress={() => setFilterStatus('rejected')}
          >
            <Text style={[styles.filterText, filterStatus === 'rejected' && styles.filterTextActive]}>
              Rejected ({rejectedCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Volunteer List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {filteredVolunteers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No volunteers found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search' : 'No registrations match your filter'}
            </Text>
          </View>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <TouchableOpacity
              key={volunteer.id}
              style={styles.volunteerCard}
              onPress={() => handleViewDetails(volunteer)}
            >
              <View style={styles.volunteerHeader}>
                <View style={styles.volunteerInfo}>
                  <Text style={styles.volunteerName}>{volunteer.name}</Text>
                  <Text style={styles.volunteerLocation}>📍 {volunteer.location}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(volunteer.status) }]}>
                  <Text style={styles.statusIcon}>{getStatusIcon(volunteer.status)}</Text>
                  <Text style={styles.statusText}>{volunteer.status}</Text>
                </View>
              </View>

              <View style={styles.volunteerDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {volunteer.experience}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Capability:</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {volunteer.capability}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submitted:</Text>
                  <Text style={styles.detailValue}>{volunteer.submittedDate}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>Tap to view full details →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  volunteerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  volunteerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  volunteerLocation: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  volunteerDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 90,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#2196f3',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});