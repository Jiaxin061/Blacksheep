import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ApiService from '../services/api';

const UserHomeScreen = ({ navigation }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await ApiService.getMyRescueTasks();
      console.log('📋 My tasks response:', response);
      if (response.success && response.tasks) {
        // Show all tasks assigned to user (assigned, in_progress, completed)
        // Filter out only 'available' status since those shouldn't be in my tasks
        const myTasks = response.tasks.filter(
          t => t.assigned_to_user_id && t.status !== 'available'
        );
        console.log('📋 Filtered tasks:', myTasks);
        setMyTasks(myTasks);
      } else {
        console.error('❌ Failed to fetch tasks:', response.message);
        setMyTasks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      setMyTasks([]);
    } finally {
      setLoadingTasks(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyTasks();
  };

  // Main actions for users
  const mainActions = [
    {
      id: 1,
      title: 'Report Animal',
      subtitle: 'Report a stray or injured animal',
      icon: '🐕',
      screen: 'ReportAnimal',
      color: '#14b8a6',
      isMain: true,
    },
  ];

  const secondaryActions = [
    {
      id: 2,
      title: 'My Reports',
      subtitle: 'View your submitted reports',
      icon: '📋',
      screen: 'ViewReport',
      color: '#0f766e',
    },
    {
      id: 3,
      title: 'Rescue Tasks',
      subtitle: 'Accept & complete rescue missions',
      icon: '🚑',
      screen: 'AcceptRescueTask', 
      color: '#f59e0b',
    },
  ];

  const otherServices = [
    {
      id: 4,
      title: 'Adopt',
      subtitle: 'Find your new friend',
      icon: '❤️',
      screen: 'Adopt',
      color: '#ec4899',
    },
    {
      id: 5,
      title: 'Donate',
      subtitle: 'Support our mission',
      icon: '💰',
      screen: 'Donate',
      color: '#8b5cf6',
    },
    {
      id: 6,
      title: 'Volunteer',
      subtitle: 'Join our team',
      icon: '🤝',
      screen: 'Volunteer',
      color: '#10b981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, User! 👋</Text>
          <Text style={styles.headerSubtitle}>How can we help today?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Action - Report Animal */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.mainActionCard}
            onPress={() => navigation.navigate('ReportAnimal')}
            activeOpacity={0.9}
          >
            <View style={styles.mainActionIcon}>
              <Text style={styles.mainActionEmoji}>🐕</Text>
            </View>
            <View style={styles.mainActionContent}>
              <Text style={styles.mainActionTitle}>Report Animal</Text>
              <Text style={styles.mainActionSubtitle}>
                Found a stray or injured animal? Report it now to help save a life
              </Text>
            </View>
            <View style={styles.mainActionArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Rescue Tasks</Text>
            {myTasks.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{myTasks.length}</Text>
              </View>
            )}
          </View>
          {loadingTasks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#14b8a6" />
            </View>
          ) : myTasks.length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <Text style={styles.emptyTasksIcon}>📋</Text>
              <Text style={styles.emptyTasksText}>No active tasks</Text>
              <Text style={styles.emptyTasksSubtext}>
                Accept a rescue task to get started
              </Text>
              <TouchableOpacity
                style={styles.acceptTaskButton}
                onPress={() => navigation.navigate('AcceptRescueTask')}
              >
                <Text style={styles.acceptTaskButtonText}>Browse Tasks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {myTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('MyRescueTaskDetail', { taskId: task.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.taskCardHeader}>
                    <View style={styles.taskCardLeft}>
                      <Text style={styles.taskCardIcon}>
                        {task.animal_type === 'dog' ? '🐕' : task.animal_type === 'cat' ? '🐈' : '🐾'}
                      </Text>
                      <View>
                        <Text style={styles.taskCardTitle}>Task #{task.id}</Text>
                        <Text style={styles.taskCardSubtitle} numberOfLines={1}>
                          {task.description || 'No description'}
                        </Text>
                      </View>
                    </View>
                    <View style={[
                      styles.taskStatusBadge,
                      { backgroundColor: task.status === 'assigned' ? '#14b8a6' : '#3b82f6' }
                    ]}>
                      <Text style={styles.taskStatusText}>
                        {task.status === 'assigned' ? 'Assigned' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskCardFooter}>
                    <Text style={styles.taskCardLocation} numberOfLines={1}>
                      📍 {task.location || task.rescue_area || 'Location not specified'}
                    </Text>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => navigation.navigate('MyRescueTaskDetail', { taskId: task.id })}
                    >
                      <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* My Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Actions</Text>
          <View style={styles.actionsGrid}>
            {secondaryActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Services</Text>
          <View style={styles.servicesGrid}>
            {otherServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => navigation.navigate(service.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Impact</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myTasks.length}</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {myTasks.filter(t => t.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ViewReport')}
        >
          <Text style={styles.navIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ReportAnimal')}
        >
          <View style={styles.navMainButton}>
            <Text style={styles.navMainIcon}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AcceptRescueTask')}
        >
          <Text style={styles.navIcon}>🚑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  header: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccfbf1',
  },
  profileButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  mainActionCard: {
    backgroundColor: '#14b8a6',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainActionIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainActionEmoji: {
    fontSize: 32,
  },
  mainActionContent: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  mainActionSubtitle: {
    fontSize: 13,
    color: '#ccfbf1',
    lineHeight: 18,
  },
  mainActionArrow: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#5b6b7c',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 11,
    color: '#5b6b7c',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8ef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5b6b7c',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8ef',
    paddingHorizontal: 24,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navDot: {
    width: 6,
    height: 6,
    backgroundColor: '#14b8a6',
    borderRadius: 3,
    marginTop: 4,
  },
  navMainButton: {
    width: 56,
    height: 56,
    backgroundColor: '#14b8a6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navMainIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTasksContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8ef',
  },
  emptyTasksIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTasksText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptyTasksSubtext: {
    fontSize: 13,
    color: '#5b6b7c',
    textAlign: 'center',
    marginBottom: 16,
  },
  acceptTaskButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptTaskButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8ef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskCardSubtitle: {
    fontSize: 13,
    color: '#5b6b7c',
  },
  taskStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskStatusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8ef',
  },
  taskCardLocation: {
    flex: 1,
    fontSize: 12,
    color: '#5b6b7c',
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default UserHomeScreen;