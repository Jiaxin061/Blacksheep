import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants';
import ApiService from '../services/api';

const UserRescueHistoryScreen = ({ navigation }) => {
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in_progress', 'completed'

  useEffect(() => {
    fetchTaskOutcomes();
  }, []);

  const fetchTaskOutcomes = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyTaskOutcomes();
      if (response.success) {
        // Handle new response structure with in_progress and completed sections
        if (response.in_progress && response.completed) {
          setInProgressTasks(response.in_progress.tasks || []);
          setCompletedTasks(response.completed.tasks || []);
        } else {
          // Fallback for old response format
          const allTasks = response.tasks || [];
          setInProgressTasks(allTasks.filter(task => task.task_status === 'in_progress'));
          setCompletedTasks(allTasks.filter(task => task.task_status === 'completed'));
        }
      } else {
        // Check if it's an authentication error
        if (response.message && (response.message.includes('token') || response.message.includes('login') || response.message.includes('Invalid'))) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to login screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', response.message || 'Failed to load rescue history');
        }
      }
    } catch (error) {
      console.error('Fetch task outcomes error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTaskOutcomes();
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return Colors.success;
      case 'Flagged':
        return Colors.danger;
      case 'Pending':
        return Colors.warning;
      default:
        return Colors.gray500;
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'in_progress':
        return Colors.info;
      case 'assigned':
        return Colors.primary;
      default:
        return Colors.gray500;
    }
  };

  const renderTaskCard = ({ item }) => (
    <View style={styles.taskCard}>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>
            {item.animal_type === 'dog' ? '🐕' : item.animal_type === 'cat' ? '🐈' : '🐾'}{' '}
            Task #{item.task_id}
          </Text>
          <Text style={styles.taskDate}>
            {item.completed_at
              ? `Completed: ${new Date(item.completed_at).toLocaleDateString()}`
              : item.assigned_at
                ? `Started: ${new Date(item.assigned_at).toLocaleDateString()}`
                : 'In Progress'}
          </Text>
        </View>
        {item.verification_status && item.verification_status !== 'Pending' && (
          <View
            style={[
              styles.verificationBadge,
              { backgroundColor: getVerificationStatusColor(item.verification_status) },
            ]}
          >
            <Text style={styles.verificationBadgeText}>
              {item.verification_status}
            </Text>
          </View>
        )}
      </View>

      {/* Task Details */}
      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getTaskStatusColor(item.task_status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.task_status === 'completed'
                ? 'Completed'
                : item.task_status === 'in_progress'
                  ? 'In Progress'
                  : item.task_status === 'assigned'
                    ? 'Assigned'
                    : item.task_status}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {item.location || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {item.description || 'N/A'}
          </Text>
        </View>

        {item.evidence_submitted && (
          <View style={styles.evidenceIndicator}>
            <Text style={styles.evidenceText}>✅ Evidence submitted</Text>
          </View>
        )}
      </View>

      {/* Admin Feedback Section - Prominently displayed */}
      {item.feedback_note ? (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackTitle}>📝 Admin Feedback After Review:</Text>
            <View
              style={[
                styles.verificationBadge,
                { backgroundColor: getVerificationStatusColor(item.verification_status) },
              ]}
            >
              <Text style={styles.verificationBadgeText}>
                {item.verification_status || 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.feedbackText}>{item.feedback_note}</Text>
        </View>
      ) : (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingText}>
            ⏳ Waiting for admin review and feedback...
          </Text>
        </View>
      )}

      {item.verification_status === 'Flagged' && (
        <View style={styles.flaggedWarning}>
          <Text style={styles.flaggedText}>
            ⚠️ This task has been flagged. Please review the admin feedback above.
          </Text>
        </View>
      )}

      {/* Update Button for In-Progress Tasks */}
      {(item.task_status === 'in_progress' || item.task_status === 'assigned') && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => navigation.navigate('MyRescueTaskDetail', { taskId: item.task_id })}
        >
          <Text style={styles.updateButtonIcon}>📝</Text>
          <Text style={styles.updateButtonText}>Update Evidence</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && inProgressTasks.length === 0 && completedTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading rescue history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'in_progress':
        return inProgressTasks;
      case 'completed':
        return completedTasks;
      default:
        return [
          ...inProgressTasks.map(task => ({ ...task, section: 'in_progress' })),
          ...completedTasks.map(task => ({ ...task, section: 'completed' }))
        ];
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'all' && styles.filterButtonTextActive
          ]}>
            All ({inProgressTasks.length + completedTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'in_progress' && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter('in_progress')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'in_progress' && styles.filterButtonTextActive
          ]}>
            In Progress ({inProgressTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'completed' && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'completed' && styles.filterButtonTextActive
          ]}>
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item, index) => `${item.task_id || item.id || index}`}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'all'
                ? 'No rescue tasks yet'
                : activeFilter === 'in_progress'
                  ? 'No in-progress tasks'
                  : 'No completed tasks'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all'
                ? 'Accept and complete rescue tasks to see admin feedback here'
                : activeFilter === 'in_progress'
                  ? 'Tasks you are currently working on will appear here'
                  : 'Completed tasks with admin feedback will appear here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textMuted,
  },
  listContent: {
    padding: Spacing.lg,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  taskDate: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  verificationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  verificationBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  taskDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    flex: 1,
  },
  detailValue: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  evidenceIndicator: {
    backgroundColor: Colors.success + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  evidenceText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: Spacing.md,
  },
  feedbackTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 20,
  },
  pendingCard: {
    backgroundColor: Colors.warning + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  pendingText: {
    fontSize: FontSizes.sm,
    color: Colors.warning,
    fontWeight: '600',
  },
  flaggedWarning: {
    backgroundColor: Colors.danger + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    marginTop: Spacing.md,
  },
  flaggedText: {
    fontSize: FontSizes.sm,
    color: Colors.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  updateButtonIcon: {
    fontSize: 20,
  },
  updateButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default UserRescueHistoryScreen;

