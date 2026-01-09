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
  SafeAreaView,
} from 'react-native';
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

const AcceptRescueTaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    fetchRescueTasks();
  }, []);

  const fetchRescueTasks = async () => {
    try {
      console.log('🚑 VOLUNTEER: Fetching available rescue tasks...');
      
      const response = await ApiService.getRescueTasks(false); // false = only available tasks
      console.log('🚑 Response:', response);
      
      if (response.success && response.tasks) {
        const rescueTasks = response.tasks;
        
        console.log('🚑 Found', rescueTasks.length, 'available rescue tasks');
        
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        rescueTasks.sort((a, b) => {
          const aOrder = urgencyOrder[a.urgency_level] ?? 4;
          const bOrder = urgencyOrder[b.urgency_level] ?? 4;
          return aOrder - bOrder;
        });
        
        setTasks(rescueTasks);
      } else {
        console.error('❌ Failed to load rescue tasks:', response.message);
        Alert.alert('Error', response.message || 'Failed to load rescue tasks');
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching rescue tasks:', error);
      Alert.alert('Error', error.message || 'Network error. Please check your connection.');
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRescueTasks();
  };

  const handleAcceptTask = (task) => {
    Alert.alert(
      '🚑 Accept Rescue Task?',
      `Do you want to accept this ${task.animal_type} rescue task?\n\nAfter accepting, you'll see the exact location and contact details.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Task',
          onPress: () => confirmAccept(task),
        },
      ]
    );
  };

  const confirmAccept = async (task) => {
    try {
      const response = await ApiService.acceptRescueTask(task.id);
      
      if (response.success) {
        Alert.alert(
          '✅ Task Accepted!',
          `You've accepted this rescue task! Exact location and contact details will be available in your task list.`,
          [
            { 
              text: 'View Task', 
              onPress: () => {
                fetchRescueTasks();
                navigation.navigate('MyRescueTaskDetail', { taskId: task.id });
              }
            },
            { 
              text: 'OK', 
              onPress: () => fetchRescueTasks() 
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to accept task');
      }
    } catch (error) {
      console.error('❌ accept task error:', error);
      Alert.alert('Error', error.message || 'Network error');
    }
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

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const renderTaskCard = ({ item }) => {
    const isExpanded = expandedTaskId === item.id;
    const isAccepted = item.status !== 'available';

    return (
      <View style={styles.taskCard}>
        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency_level) }]}>
          <Text style={styles.urgencyText}>{getUrgencyLabel(item.urgency_level)}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>

        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.taskHeader}>
            <View style={styles.animalInfo}>
              <Text style={styles.animalType}>
                {item.animal_type === 'dog' ? '🐕' : item.animal_type === 'cat' ? '🐈' : '🐾'}{' '}
                {item.animal_type?.charAt(0).toUpperCase() + item.animal_type?.slice(1)}
              </Text>
              <Text style={styles.reportId}>Task #{item.id}</Text>
            </View>
            <Text style={styles.timeAgo}>{formatDate(item.created_at)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
            {item.description}
          </Text>

          {/* Condition */}
          {item.animal_condition && (
            <View style={styles.conditionBox}>
              <Text style={styles.conditionLabel}>Condition:</Text>
              <Text style={styles.conditionText}>{item.animal_condition}</Text>
            </View>
          )}

          {/* PRIVACY: Show general area only (until accepted) */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {isAccepted 
                ? `${item.rescue_area || 'Location provided after acceptance'}`
                : `${item.rescue_area || 'General area: Pending'}`}
            </Text>
          </View>

          {/* Show exact coordinates ONLY if task is accepted */}
          {isExpanded && isAccepted && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>📍 Exact Location:</Text>
              <Text style={styles.detailsText}>
                {item.location || item.rescue_area || 'Address not provided'}
              </Text>
              <Text style={styles.detailsTitle}>📞 Contact:</Text>
              <Text style={styles.detailsText}>
                {item.reporter_contact || 'Contact not provided'}
              </Text>
            </View>
          )}

          {/* Privacy Notice */}
          {!isAccepted && isExpanded && (
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={styles.privacyText}>
                Exact location and contact details will be revealed after you accept this task
              </Text>
            </View>
          )}

          {/* Expand indicator */}
          <Text style={styles.expandText}>
            {isExpanded ? '▲ Tap to collapse' : '▼ Tap for details'}
          </Text>
        </TouchableOpacity>

        {/* Accept Button (only for available tasks) */}
        {item.status === 'available' && (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptTask(item)}
          >
            <Text style={styles.acceptButtonText}>🚑 Accept Task</Text>
          </TouchableOpacity>
        )}

        {/* Assigned Indicator */}
        {item.status === 'assigned' && (
          <View style={styles.assignedIndicator}>
            <Text style={styles.assignedText}>✅ Task Accepted</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>No rescue tasks available</Text>
      <Text style={styles.emptyText}>
        All animals have been rescued! Check back later for new tasks.
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>Available Tasks</Text>
          <Text style={styles.headerTitle}>Accept Rescue Task</Text>
        </View>
        <View style={styles.taskCountBadge}>
          <Text style={styles.taskCountText}>{tasks.length}</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>ℹ️</Text>
        <Text style={styles.infoBannerText}>
          Accept a task to help rescue animals in need. Exact location will be shown after acceptance.
        </Text>
      </View>

      <FlatList
        data={tasks}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  taskCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  taskCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoBannerIcon: {
    fontSize: 18,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
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
  detailsBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  expandText: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  assignedIndicator: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  assignedText: {
    color: COLORS.success,
    fontSize: 15,
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
});

export default AcceptRescueTaskScreen;