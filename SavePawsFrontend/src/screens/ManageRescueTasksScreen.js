import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/api';

// Teal Color Theme
const COLORS = {
  primary: '#14b8a6',
  secondary: '#0f766e',
  background: '#f0fdfa',
  white: '#ffffff',
  text: '#111827',
  textLight: '#5b6b7c',
  border: '#e2e8ef',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  critical: '#991b1b',
};

const URGENCY_LEVELS = [
  { label: 'All Urgency', value: 'all', color: COLORS.textLight },
  { label: 'Critical', value: 'critical', color: COLORS.critical },
  { label: 'High', value: 'high', color: COLORS.danger },
  { label: 'Medium', value: 'medium', color: COLORS.warning },
  { label: 'Low', value: 'low', color: COLORS.success },
];

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

const ManageRescueTasksScreen = ({ navigation }) => {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Assignment modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('assigned');

  // Map region
  const [mapRegion, setMapRegion] = useState({
    latitude: 1.5535,
    longitude: 103.6380,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fetch all rescue tasks
  const fetchRescueTasks = async () => {
    try {
      console.log('📊 ADMIN: Fetching ALL rescue tasks...');
      const response = await ApiService.getRescueTasks(true); // Pass true to get all tasks
      console.log('📊 Response:', response);
      if (response.success) {
        const rescueTasks = response.tasks || [];
        console.log('📊 Found', rescueTasks.length, 'rescue tasks');
        
        // Log tasks with location data for debugging
        const tasksWithLocation = rescueTasks.filter(
          t => t.latitude != null && t.longitude != null
        );
        console.log('📍 Tasks with location:', tasksWithLocation.length);
        if (tasksWithLocation.length > 0) {
          console.log('📍 Sample location:', {
            id: tasksWithLocation[0].id,
            lat: tasksWithLocation[0].latitude,
            lng: tasksWithLocation[0].longitude
          });
        }
        
        setAllReports(rescueTasks);
        applyFilters(rescueTasks, urgencyFilter, statusFilter);

        // Set initial map region to fit all tasks with locations
        if (tasksWithLocation.length > 0) {
          const latitudes = tasksWithLocation
            .map(t => parseFloat(t.latitude))
            .filter(lat => !isNaN(lat));
          const longitudes = tasksWithLocation
            .map(t => parseFloat(t.ongitude))
            .filter(lng => !isNaN(lng));
          
          if (latitudes.length > 0 && longitudes.length > 0) {
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);
            
            const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
            const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);
            
            setMapRegion({
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            });
            console.log('🗺️ Map region set to fit all tasks');
          } else {
            // Fallback to first task location
            const firstTask = tasksWithLocation[0];
            setMapRegion({
              latitude: parseFloat(firstTask.latitude),
              longitude: parseFloat(firstTask.longitude),
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      } else {
        console.error('❌ Failed to load rescue tasks:', response.message);
        Alert.alert('Error', response.message || 'Failed to load rescue tasks');
        setAllReports([]);
        setFilteredReports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching rescue tasks:', error);
      Alert.alert('Error', error.message || 'Network error. Please check your connection.');
      setAllReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRescueTasks();
  }, []);

  // Apply filters
  const applyFilters = (reports, urgency, status) => {
    let filtered = [...reports];

    // Filter by urgency
    if (urgency !== 'all') {
      filtered = filtered.filter(r => r.urgency_level === urgency);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }

    // Sort by urgency (critical first)
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency_level] ?? 4;
      const bOrder = urgencyOrder[b.urgency_level] ?? 4;
      return aOrder - bOrder;
    });

    setFilteredReports(filtered);
  };

  useEffect(() => {
    applyFilters(allReports, urgencyFilter, statusFilter);
  }, [urgencyFilter, statusFilter, allReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRescueTasks();
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: COLORS.success,
      medium: COLORS.warning,
      high: COLORS.danger,
      critical: COLORS.critical,
    };
    return colors[urgency] || COLORS.textLight;
  };

  const getUrgencyLabel = (urgency) => {
    return urgency?.charAt(0).toUpperCase() + urgency?.slice(1) || 'Medium';
  };

  const getStatusColor = (status) => {
    const colors = {
      available: COLORS.warning,
      assigned: COLORS.primary,
      in_progress: '#3b82f6',
      completed: COLORS.success,
    };
    return colors[status] || COLORS.textLight;
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Available',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  const handleOpenStatus = (task) => {
    setTaskToUpdate(task);
    setSelectedStatus(task.status || 'available');
    setStatusModalVisible(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      const response = await ApiService.updateRescueTaskStatus(taskToUpdate.id, selectedStatus);
      if (response.success) {
        Alert.alert('Success', 'Rescue task status updated');
        setStatusModalVisible(false);
        setTaskToUpdate(null);
        fetchRescueTasks();
      } else {
        Alert.alert('Error', response.message || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const confirmDeleteTask = (task) => {
    Alert.alert(
      'Delete Rescue Task',
      `Delete task #${task.id}? This will not remove the original report.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteRescueTask(task.id);
              if (response.success) {
                Alert.alert('Deleted', 'Rescue task removed');
                fetchRescueTasks();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleMarkerPress = (task) => {
    setSelectedTask(task);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTaskCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => {
        if (item.latitude && item.longitude) {
          setViewMode('map');
          setMapRegion({
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setSelectedTask(item);
        }
      }}
      activeOpacity={0.9}
    >
      {/* Urgency Badge */}
      <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency_level) }]}>
        <Text style={styles.urgencyText}>{getUrgencyLabel(item.urgency_level)}</Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
      </View>

      {/* Image if available */}
      {item.photo_url && (
        <Image source={{ uri: item.photo_url }} style={styles.taskImage} resizeMode="cover" />
      )}

      <View style={styles.taskContent}>
        {/* Header */}
        <View style={styles.taskHeader}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalType}>
              {item.animal_type === 'dog' ? '🐕' : item.animal_type === 'cat' ? '🐈' : '🐾'}{' '}
              {item.animal_type?.charAt(0).toUpperCase() + item.animal_type?.slice(1)}
            </Text>
            <Text style={styles.reportId}>Report #{item.id}</Text>
          </View>
          <Text style={styles.timeAgo}>{formatDate(item.created_at)}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Condition */}
        {item.animal_condition && (
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Condition:</Text>
            <Text style={styles.conditionText}>{item.animal_condition}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location_address || item.location || 'Location not specified'}
          </Text>
          {item.latitude && item.longitude && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {
                setViewMode('map');
                setMapRegion({
                  latitude: parseFloat(item.atitude),
                  longitude: parseFloat(item.longitude),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
                setSelectedTask(item);
              }}
            >
              <Text style={styles.mapButtonText}>🗺️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reporter / Assignee Info */}
        <View style={styles.reporterInfo}>
          <View style={styles.reporterRow}>
            <Text style={styles.reporterLabel}>Reporter:</Text>
            <Text style={styles.reporterName}>{item.reporter_name || 'Anonymous'}</Text>
          </View>
          <View style={styles.assignedRow}>
            <Text style={styles.assignedLabel}>Accepted by:</Text>
            <Text style={styles.assignedName}>
              {item.assigned_to_user_id ? `User #${item.assigned_to_user_id}` : 'Not accepted yet'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Module 3: View Evidence Button (show for all tasks to allow verification) */}
          <TouchableOpacity 
            style={styles.evidenceButton}
            onPress={() => navigation.navigate('AdminEvidenceView', { taskId: item.id })}
          >
            <Text style={styles.evidenceButtonText}>🔍 View Evidence</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.assignButton}
            onPress={() => handleOpenStatus(item)}
          >
            <Text style={styles.assignButtonText}>📝 Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => confirmDeleteTask(item)}
          >
            <Text style={styles.detailsButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMapView = () => {
    // Filter tasks with valid coordinates
    const tasksWithLocation = filteredReports.filter(
      r => r.latitude != null && 
           r.longitude != null &&
           !isNaN(parseFloat(r.latitude)) &&
           !isNaN(parseFloat(r.longitude))
    );

    console.log('🗺️ Rendering map with', tasksWithLocation.length, 'tasks with valid locations');

    // Calculate map region to fit all markers if we have tasks
    let initialRegion = mapRegion;
    if (tasksWithLocation.length > 0) {
      const latitudes = tasksWithLocation.map(t => parseFloat(t.latitude));
      const longitudes = tasksWithLocation.map(t => parseFloat(t.longitude));
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
      const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);
      
      initialRegion = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    } else {
      // Default to Malaysia if no tasks have locations
      initialRegion = {
        latitude: 3.1390,
        longitude: 101.6869,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    // Map urgency to pin colors (MapView supports: red, green, purple)
    const getPinColor = (urgency) => {
      switch (urgency) {
        case 'critical':
          return 'red';
        case 'high':
          return 'red';
        case 'medium':
          return 'purple';
        case 'low':
          return 'green';
        default:
          return 'purple';
      }
    };

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          region={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          onRegionChangeComplete={setMapRegion}
        >
          {tasksWithLocation.map((task) => {
            const lat = parseFloat(task.latitude);
            const lng = parseFloat(task.longitude);
            
            if (isNaN(lat) || isNaN(lng)) {
              return null;
            }

            return (
              <Marker
                key={`task-${task.id}`}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                onPress={() => handleMarkerPress(task)}
                title={`${task.animal_type?.charAt(0).toUpperCase() + task.animal_type?.slice(1) || 'Animal'} - ${getUrgencyLabel(task.urgency_level)}`}
                description={task.description?.substring(0, 80) || 'No description'}
                pinColor={getPinColor(task.urgency_level)}
              />
            );
          })}
        </MapView>

        {/* Map Legend */}
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>Urgency Levels:</Text>
          <View style={styles.legendItems}>
            {URGENCY_LEVELS.filter(u => u.value !== 'all').map(level => (
              <View key={level.value} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: level.color }]} />
                <Text style={styles.legendLabel}>{level.label}</Text>
              </View>
            ))}
          </View>
          {tasksWithLocation.length === 0 && (
            <Text style={styles.noLocationText}>No tasks with location data</Text>
          )}
        </View>

      {/* Selected Task Card */}
      {selectedTask && (
        <View style={styles.selectedTaskCard}>
          <View style={styles.selectedTaskHeader}>
            <View style={styles.selectedTaskInfo}>
              <Text style={styles.selectedTaskTitle}>
                {selectedTask.animal_type === 'dog' ? '🐕' : selectedTask.animal_type === 'cat' ? '🐈' : '🐾'}{' '}
                {selectedTask.animal_type?.charAt(0).toUpperCase() + selectedTask.animal_type?.slice(1)}
              </Text>
              <Text style={styles.selectedTaskLocation}>{selectedTask.location_address}</Text>
            </View>
            <View style={styles.selectedBadges}>
              <View style={[styles.selectedUrgencyBadge, { backgroundColor: getUrgencyColor(selectedTask.urgency_level) }]}>
                <Text style={styles.selectedBadgeText}>{getUrgencyLabel(selectedTask.urgency_level)}</Text>
              </View>
              <View style={[styles.selectedStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) }]}>
                <Text style={styles.selectedBadgeText}>{getStatusLabel(selectedTask.status)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.selectedTaskDescription} numberOfLines={2}>
            {selectedTask.description}
          </Text>
          <View style={styles.selectedTaskActions}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedTask(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            {selectedTask.status === 'pending' && (
              <TouchableOpacity
                style={styles.assignButtonSmall}
                onPress={() => handleAssignTask(selectedTask)}
              >
                <Text style={styles.assignButtonTextSmall}>Assign</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.detailsButtonSmall}
              onPress={() => {
                setSelectedTask(null);
                navigation.navigate('AdminManageReport', { reportId: selectedTask.id });
              }}
            >
              <Text style={styles.detailsButtonTextSmall}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>No rescue tasks found</Text>
      <Text style={styles.emptyText}>
        {urgencyFilter !== 'all' || statusFilter !== 'all'
          ? 'Try adjusting your filters'
          : 'All animals have been rescued!'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading rescue tasks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>

          <Text style={styles.headerSubtitle}>
            {filteredReports.length} of {allReports.length} tasks
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterIcon}>🔍</Text>
            {(urgencyFilter !== 'all' || statusFilter !== 'all') && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.toggleIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={styles.toggleIcon}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Bar */}
      {showFilters && (
        <View style={styles.filterBar}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Urgency:</Text>
            <View style={styles.filterChips}>
              {URGENCY_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.filterChip,
                    urgencyFilter === level.value && { 
                      backgroundColor: level.color,
                      borderColor: level.color,
                    }
                  ]}
                  onPress={() => setUrgencyFilter(level.value)}
                >
                  <Text style={[
                    styles.filterChipText,
                    urgencyFilter === level.value && styles.filterChipTextActive
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterChips}>
              {STATUS_FILTERS.map(status => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.filterChip,
                    statusFilter === status.value && styles.filterChipActive
                  ]}
                  onPress={() => setStatusFilter(status.value)}
                >
                  <Text style={[
                    styles.filterChipText,
                    statusFilter === status.value && styles.filterChipTextActive
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.critical }]}>
            {allReports.filter(r => r.urgency_level === 'critical').length}
          </Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.danger }]}>
            {allReports.filter(r => r.urgency_level === 'high').length}
          </Text>
          <Text style={styles.statLabel}>High</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {allReports.filter(r => r.status === 'available').length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>
            {allReports.filter(r => r.status === 'assigned').length}
          </Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredReports}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderMapView()
      )}

      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Rescue Task Status</Text>
            <Text style={styles.modalSubtitle}>
              {taskToUpdate && `Task #${taskToUpdate.id} - ${taskToUpdate.animal_type || ''}`}
            </Text>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Select Status:</Text>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
              >
                <Picker.Item label="Available" value="available" />
                <Picker.Item label="Assigned" value="assigned" />
                <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmStatusUpdate}
              >
                <Text style={styles.modalConfirmText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  filterIcon: {
    fontSize: 20,
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleIcon: {
    fontSize: 18,
  },
  filterBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  urgencyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 2,
  },
  urgencyText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    position: 'absolute',
    top: 42,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    zIndex: 2,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  taskImage: {
    width: '100%',
    height: 180,
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalType: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  reportId: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  conditionBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 13,
    color: '#78350f',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  mapButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapButtonText: {
    fontSize: 14,
  },
  reporterInfo: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  updateBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  updateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  updateText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  updateTextContainer: {
    marginBottom: 12,
  },
  updateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  updateImageContainer: {
    marginBottom: 12,
  },
  updateImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  updateTimestamp: {
    fontSize: 10,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reporterLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginRight: 6,
  },
  reporterName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  assignedLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginRight: 6,
  },
  assignedName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  evidenceButton: {
    flex: 1,
    backgroundColor: COLORS.info || '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '100%',
    marginBottom: 8,
  },
  evidenceButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailsButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  noLocationText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 8,
    fontStyle: 'italic',
  },
  criticalPulse: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: COLORS.critical,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  mapLegend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 10,
    color: COLORS.text,
  },
  selectedTaskCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectedTaskInfo: {
    flex: 1,
  },
  selectedTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedTaskLocation: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  selectedBadges: {
    gap: 4,
  },
  selectedUrgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  selectedTaskDescription: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 12,
  },
  selectedTaskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  closeButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  assignButtonSmall: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonTextSmall: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsButtonSmall: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonTextSmall: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfo: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ManageRescueTasksScreen;