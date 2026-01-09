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
  Image,
  Modal,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, UrgencyLabels } from '../constants';
import ApiService from '../services/api';

const RescueTasksScreen = ({ navigation }) => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // available, my-tasks
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'available') {
        const response = await ApiService.getAvailableRescueTasks();
        if (response.success) {
          setAvailableTasks(response.tasks || []);
        }
      } else {
        const response = await ApiService.getMyRescueTasks();
        if (response.success) {
          setMyTasks(response.tasks || []);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleAcceptTask = async (taskId) => {
    Alert.alert(
      '🚑 Accept Rescue Task?',
      'Are you sure you want to accept this rescue task? You will see the exact location and contact details after accepting.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const response = await ApiService.acceptRescueTask(taskId);
              if (response.success) {
                Alert.alert(
                  '✅ Task Accepted!',
                  'You can now view full details including exact location and reporter contact.',
                  [{ text: 'OK', onPress: () => {
                    setActiveTab('my-tasks');
                    fetchTasks();
                  }}]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to accept task');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
    setDetailsModalVisible(true);
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const response = await ApiService.updateRescueTaskStatus(taskId, status);
      if (response.success) {
        Alert.alert('✅ Success', 'Task status updated');
        fetchTasks();
        setDetailsModalVisible(false);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: Colors.urgencyLow,
      medium: Colors.urgencyMedium,
      high: Colors.urgencyHigh,
      critical: Colors.urgencyCritical,
    };
    return colors[urgency] || Colors.gray500;
  };

  const renderAvailableTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      {/* Urgency Badge */}
      <View
        style={[
          styles.urgencyBadge,
          { backgroundColor: getUrgencyColor(task.urgency_level) },
        ]}
      >
        <Text style={styles.urgencyText}>
          {UrgencyLabels[task.urgency_level]} Urgency
        </Text>
      </View>

      {/* Task Image */}
      {task.photo_url && (
        <Image
          source={{ uri: task.photo_url }}
          style={styles.taskImage}
          resizeMode="cover"
        />
      )}

      {/* Task Info */}
      <View style={styles.taskInfo}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskId}>Task #{task.id}</Text>
          <Text style={styles.animalType}>
            {task.animal_type === 'dog' ? '🐕 Dog' : task.animal_type === 'cat' ? '🐈 Cat' : '🐾 Other'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText}>{task.rescue_area || 'Location not specified'}</Text>
        </View>

        {task.animal_condition && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🩹</Text>
            <Text style={styles.infoText}>{task.animal_condition}</Text>
          </View>
        )}

        <Text style={styles.description} numberOfLines={3}>
          {task.description}
        </Text>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptTask(task.id)}
        >
          <Text style={styles.acceptButtonText}>Accept Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMyTask = (task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.myTaskCard}
      onPress={() => navigation.navigate('MyRescueTaskDetail', { taskId: task.id })}
    >
      <View style={styles.myTaskHeader}>
        <Text style={styles.taskId}>Task #{task.id}</Text>
        <View
          style={[
            styles.taskStatusBadge,
            { backgroundColor: task.status === 'completed' ? Colors.success : Colors.info },
          ]}
        >
          <Text style={styles.taskStatusText}>
            {task.status === 'assigned' ? 'Assigned' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </Text>
        </View>
      </View>

      {task.photo_url && (
        <Image
          source={{ uri: task.photo_url }}
          style={styles.myTaskImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.myTaskInfo}>
        <Text style={styles.animalType}>
          {task.animal_type === 'dog' ? '🐕 Dog' : task.animal_type === 'cat' ? '🐈 Cat' : '🐾 Other'}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            {task.location_address || task.location || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📞</Text>
          <Text style={styles.infoText}>{task.reporter_contact || 'N/A'}</Text>
        </View>

        <Text style={styles.tapToView}>Tap to view full details</Text>
      </View>
    </TouchableOpacity>
  );

  const tasks = activeTab === 'available' ? availableTasks : myTasks;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>Volunteer</Text>
          <Text style={styles.headerTitle}>Rescue Tasks</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
          {activeTab === 'available' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-tasks' && styles.tabActive]}
          onPress={() => setActiveTab('my-tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'my-tasks' && styles.tabTextActive]}>
            My Tasks
          </Text>
          {activeTab === 'my-tasks' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading tasks...</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚑</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'available' ? 'No tasks available' : 'No tasks yet'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'available'
                ? 'Check back later for rescue opportunities'
                : 'Accept tasks to help rescue animals'}
            </Text>
          </View>
        ) : (
          tasks.map((task) =>
            activeTab === 'available' ? renderAvailableTask(task) : renderMyTask(task)
          )
        )}
      </ScrollView>

      {/* Task Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalTaskId}>Task #{selectedTask.id}</Text>

                {selectedTask.photo_url && (
                  <Image
                    source={{ uri: selectedTask.photo_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Animal Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedTask.animal_type === 'dog' ? '🐕 Dog' : selectedTask.animal_type === 'cat' ? '🐈 Cat' : '🐾 Other'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    📍 {selectedTask.location_address || selectedTask.location || 'N/A'}
                  </Text>
                  {selectedTask.location_latitude && selectedTask.location_longitude && (
                    <Text style={styles.coordinates}>
                      GPS: {selectedTask.location_latitude}, {selectedTask.location_longitude}
                    </Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Reporter Contact</Text>
                  <Text style={styles.detailValue}>📞 {selectedTask.reporter_contact || 'N/A'}</Text>
                </View>

                {selectedTask.animal_condition && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Condition</Text>
                    <Text style={styles.detailValue}>{selectedTask.animal_condition}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedTask.description}</Text>
                </View>

                {selectedTask.status !== 'completed' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.progressButton}
                      onPress={() => handleUpdateTaskStatus(selectedTask.id, 'in_progress')}
                    >
                      <Text style={styles.buttonText}>Mark In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleUpdateTaskStatus(selectedTask.id, 'completed')}
                    >
                      <Text style={styles.buttonText}>Mark Completed</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('UserHome')}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🚑</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ReportAnimal')}>
          <Text style={styles.navIconLarge}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ViewReport')}>
          <Text style={styles.navIcon}>✉</Text>
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
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FontSizes.xxl,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.white,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urgencyBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  taskImage: {
    width: '100%',
    height: 200,
  },
  taskInfo: {
    padding: Spacing.xl,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  taskId: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  animalType: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    lineHeight: 22,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  myTaskCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  myTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.gray50,
  },
  taskStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  taskStatusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  myTaskImage: {
    width: '100%',
    height: 150,
  },
  myTaskInfo: {
    padding: Spacing.lg,
  },
  tapToView: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  modalBody: {
    padding: Spacing.xxl,
  },
  modalTaskId: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  detailSection: {
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  detailValue: {
    fontSize: FontSizes.base,
    color: Colors.text,
    lineHeight: 22,
  },
  coordinates: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  progressButton: {
    flex: 1,
    backgroundColor: Colors.info,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
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

export default RescueTasksScreen;