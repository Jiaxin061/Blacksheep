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
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants';
import ApiService from '../services/api';

const BlacklistManagementScreen = ({ navigation }) => {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchBlacklistedUsers();
  }, []);

  const fetchBlacklistedUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBlacklistedUsers();
      
      if (response.success) {
        setBlacklistedUsers(response.users || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load blacklisted users');
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
    fetchBlacklistedUsers();
  };

  const handleUnblockUser = (user) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.first_name} ${user.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(user.id);
            try {
              const response = await ApiService.toggleUserStatus(user.id);
              if (response.success) {
                Alert.alert('✅ Success', response.message);
                fetchBlacklistedUsers(); // Refresh list
              } else {
                Alert.alert('Error', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone_number && (
            <Text style={styles.userPhone}>{item.phone_number}</Text>
          )}
        </View>
        <View style={styles.bannedBadge}>
          <Text style={styles.bannedBadgeText}>🚫 BANNED</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>User ID:</Text>
          <Text style={styles.detailValue}>#{item.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Blacklisted:</Text>
          <Text style={styles.detailValue}>{formatDate(item.updated_at)}</Text>
        </View>
        {item.active_task_count > 0 && (
          <View style={styles.taskWarning}>
            <Text style={styles.taskWarningText}>
              ⚠️ {item.active_task_count} rescue task(s) were detached when this user was blacklisted
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.unblockButton,
          processingId === item.id && styles.unblockButtonDisabled,
        ]}
        onPress={() => handleUnblockUser(item)}
        disabled={processingId === item.id}
      >
        {processingId === item.id ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.unblockButtonText}>🔓 Unblock User</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading blacklisted users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{blacklistedUsers.length}</Text>
          <Text style={styles.statLabel}>Blacklisted Users</Text>
        </View>
      </View>

      {/* Users List */}
      {blacklistedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>No Blacklisted Users</Text>
          <Text style={styles.emptyText}>
            All users are currently active. No users have been blacklisted.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blacklistedUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: FontSizes.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statsBar: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  userPhone: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  bannedBadge: {
    backgroundColor: Colors.danger + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  bannedBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.danger,
  },
  userDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  taskWarning: {
    backgroundColor: Colors.warning + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  taskWarningText: {
    fontSize: FontSizes.xs,
    color: Colors.warning,
    fontWeight: '500',
  },
  unblockButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  unblockButtonDisabled: {
    opacity: 0.6,
  },
  unblockButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
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
    lineHeight: 22,
  },
});

export default BlacklistManagementScreen;

