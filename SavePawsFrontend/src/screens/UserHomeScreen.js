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
<<<<<<< HEAD
import ApiService from '../services/api';
=======
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Dog Icon SVG Component
const DogIcon = ({ size = 32, color = "#ffffff" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 4V7C16 9.20914 14.2091 11 12 11H10V15H0V13L0.931622 10.8706C1.25226 10.9549 1.59036 11 1.94124 11C3.74931 11 5.32536 9.76947 5.76388 8.01538L3.82359 7.53031C3.60766 8.39406 2.83158 9.00001 1.94124 9.00001C1.87789 9.00001 1.81539 8.99702 1.75385 8.99119C1.02587 8.92223 0.432187 8.45551 0.160283 7.83121C0.0791432 7.64491 0.0266588 7.44457 0.00781272 7.23658C-0.0112323 7.02639 0.00407892 6.80838 0.0588889 6.58914L0.698705 4.02986C1.14387 2.24919 2.7438 1 4.57928 1H10L12 4H16ZM9 6C9.55229 6 10 5.55228 10 5C10 4.44772 9.55229 4 9 4C8.44771 4 8 4.44772 8 5C8 5.55228 8.44771 6 9 6Z"
      fill={color}
    />
  </Svg>
);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

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

<<<<<<< HEAD
=======
  const handleServicePress = async (service) => {
    if (service.title === 'Volunteer') {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'User ID not found. Please log in again.');
          return;
        }

        // Show loading indicator or toast if possible, otherwise just wait
        const statusData = await ApiService.getVolunteerStatus(userId);

        console.log('Volunteer Status:', statusData);

        if (!statusData.hasRegistration) {
          // Not registered -> Go to Registration
          navigation.navigate('VolunteerRegistration');
        } else {
          switch (statusData.status) {
            case 'Pending':
              Alert.alert(
                'Application Pending',
                'Your volunteer application is currently under review by an admin. Please check back later.'
              );
              break;
            case 'Approved':
              // Approved -> Go to Contribution/Dashboard
              navigation.navigate('VolunteerContribution');
              break;
            case 'Rejected':
              Alert.alert(
                'Application Rejected',
                `Your application was rejected. Reason: ${statusData.rejectionReason || 'No reason provided.'}.`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Apply Again", onPress: () => navigation.navigate('VolunteerRegistration') }
                ]
              );
              break;
            default:
              Alert.alert('Error', 'Unknown volunteer status.');
          }
        }
      } catch (error) {
        console.error('Navigation Error:', error);
        Alert.alert('Error', 'Failed to check volunteer status. Please try again.');
      }
    } else {
      navigation.navigate(service.screen);
    }
  };

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
      icon: '📋',
      screen: 'ViewReport',
=======
      icon: 'clipboard-outline',
      iconType: 'ionicon',
      screen: 'ViewReports',
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      color: '#0f766e',
    },
    {
      id: 3,
      title: 'Rescue Tasks',
      subtitle: 'Accept & complete rescue missions',
<<<<<<< HEAD
      icon: '🚑',
      screen: 'AcceptRescueTask', 
=======
      icon: 'medkit-outline',
      iconType: 'ionicon',
      screen: 'AcceptRescueTask',
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Rescue History',
      subtitle: 'View task outcomes & feedback',
<<<<<<< HEAD
      icon: '📊',
=======
      icon: 'bar-chart-outline',
      iconType: 'ionicon',
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      screen: 'UserRescueHistory',
      color: '#8b5cf6',
    },
  ];

  const otherServices = [
    {
      id: 4,
      title: 'Adopt',
      subtitle: 'Find your new friend',
      icon: '❤️',
      screen: 'AdoptionHub',
      color: '#ec4899',
    },
    {
      id: 5,
      title: 'Donate',
      subtitle: 'Support our mission',
      icon: '💰',
      screen: 'DonationHome',
      color: '#8b5cf6',
    },
    {
      id: 6,
      title: 'Volunteer',
      subtitle: 'Join our team',
      icon: '🤝',
<<<<<<< HEAD
      screen: 'Volunteer',
      color: '#10b981',
    },
=======
      screen: 'VolunteerEventList',
      color: '#10b981',
    },
    {
      id: 7,
      title: 'Community',
      subtitle: 'Share & Connect',
      icon: '💬',
      screen: 'CommunityPage',
      color: '#14b8a6',
    },
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />
<<<<<<< HEAD
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, User! 👋</Text>
=======

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, User!</Text>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          <Text style={styles.headerSubtitle}>How can we help today?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
<<<<<<< HEAD
          onPress={() => navigation.navigate('Profile')}
=======
          onPress={() => navigation.navigate('UserProfile')}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
              <Text style={styles.mainActionEmoji}>🐕</Text>
=======
              <DogIcon size={32} color="#ffffff" />
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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

<<<<<<< HEAD
=======
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

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
              <Text style={styles.emptyTasksIcon}>📋</Text>
=======
              <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
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
=======

          {/* First 2 items in 2-column grid */}
          <View style={styles.actionsGrid}>
            {secondaryActions.slice(0, 2).map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  {action.iconType === 'ionicon' ? (
                    <Ionicons name={action.icon} size={24} color="#ffffff" />
                  ) : (
                    <Text style={styles.actionEmoji}>{action.icon}</Text>
                  )}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
<<<<<<< HEAD
=======

          {/* Last item as full-width horizontal card */}
          {secondaryActions.slice(2).map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCardHorizontal}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconHorizontal, { backgroundColor: action.color }]}>
                {action.iconType === 'ionicon' ? (
                  <Ionicons name={action.icon} size={24} color="#ffffff" />
                ) : (
                  <Text style={styles.actionEmoji}>{action.icon}</Text>
                )}
              </View>
              <View style={styles.actionTextHorizontal}>
                <Text style={styles.actionTitleHorizontal}>{action.title}</Text>
                <Text style={styles.actionSubtitleHorizontal}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        </View>

        {/* Other Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Services</Text>
          <View style={styles.servicesGrid}>
            {otherServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
<<<<<<< HEAD
                onPress={() => navigation.navigate(service.screen)}
=======
                onPress={() => handleServicePress(service)}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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

<<<<<<< HEAD
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
=======


        <View style={{ height: 100 }} />
      </ScrollView>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
    paddingVertical: 20,
=======
    paddingTop: 50,
    paddingBottom: 20,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
=======
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
<<<<<<< HEAD
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
=======
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
<<<<<<< HEAD
    fontSize: 16,
=======
    fontSize: 15,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
<<<<<<< HEAD
    fontSize: 12,
=======
    fontSize: 11,
    color: '#5b6b7c',
  },
  actionCardHorizontal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconHorizontal: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextHorizontal: {
    flex: 1,
  },
  actionTitleHorizontal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitleHorizontal: {
    fontSize: 11,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    color: '#5b6b7c',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
<<<<<<< HEAD
    width: '31%',
=======
    width: '48%',
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
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
=======
    height: 70,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navItemActive: {
    transform: [{ scale: 1.1 }],
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    color: '#5b6b7c',
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: '600',
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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