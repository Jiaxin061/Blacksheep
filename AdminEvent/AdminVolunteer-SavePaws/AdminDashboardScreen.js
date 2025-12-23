import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
};

const AdminDashboardScreen = () => {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalReports: 127,
        activeReports: 43,
        rescued: 89,
        volunteers: 156,
    });

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // navigation.replace('Landing');
                        // Check if Landing exists or just go back
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/'); // fallback to root
                        }
                    }
                }
            ]
        );
    };

    const quickActions = [
        {
            icon: '📊',
            title: 'View Reports',
            desc: 'Review all submitted reports',
            screen: '/(tabs)/AdminViewReport',
            color: COLORS.primary,
        },
        {
            icon: '⚙️',
            title: 'Manage Reports',
            desc: 'Update status & urgency',
            screen: '/(tabs)/AdminManageReport',
            color: COLORS.secondary,
        },
        {
            icon: '🚑',
            title: 'Rescue Tasks',
            desc: 'Assign & track rescues',
            screen: '/(tabs)/ManageRescueTasks',
            color: COLORS.warning,
        },
        {
            icon: '👥',
            title: 'Volunteers',
            desc: 'Manage volunteer team',
            screen: '/(tabs)/adminHomePage',
            color: '#8b5cf6',
        },
        {
            icon: '🐾',
            title: 'Animal Records',
            desc: 'View & update profiles',
            screen: '/(tabs)/AnimalRecords',
            color: '#ec4899',
        },
        {
            icon: '💰',
            title: 'Donations',
            desc: 'Track funding & expenses',
            screen: '/(tabs)/Donations',
            color: COLORS.success,
        },
    ];

    const recentActivity = [
        { icon: '📝', title: 'New report submitted', desc: 'Injured dog in Skudai • 15 mins ago', color: COLORS.warning },
        { icon: '✅', title: 'Rescue completed', desc: 'Task #1234 marked as rescued • 1 hour ago', color: COLORS.success },
        { icon: '👤', title: 'New volunteer registered', desc: 'Ahmad joined as volunteer • 2 hours ago', color: COLORS.primary },
        { icon: '💰', title: 'Donation received', desc: 'RM 500 for medical care • 3 hours ago', color: '#8b5cf6' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>🛡️ ADMIN</Text>
                    </View>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutIcon}>🚪</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Urgent Alerts */}
                    <View style={styles.urgentAlerts}>
                        <View style={styles.alertHeader}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                            <Text style={styles.alertTitle}>Urgent Attention Required</Text>
                        </View>
                        <View style={styles.alertItem}>
                            <Text style={styles.alertText}>
                                <Text style={styles.alertBold}>3 Critical Reports</Text> awaiting assignment
                            </Text>
                        </View>
                        <View style={styles.alertItem}>
                            <Text style={styles.alertText}>
                                <Text style={styles.alertBold}>5 High Priority Tasks</Text> need review
                            </Text>
                        </View>
                    </View>

                    {/* Statistics */}
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.totalReports}</Text>
                            <Text style={styles.statLabel}>Total Reports</Text>
                            <Text style={styles.statTrend}>↑ 12% this week</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.activeReports}</Text>
                            <Text style={styles.statLabel}>Active Tasks</Text>
                            <Text style={styles.statTrend}>↓ 8% from last week</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.rescued}</Text>
                            <Text style={styles.statLabel}>Animals Rescued</Text>
                            <Text style={styles.statTrend}>↑ 23% this month</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: COLORS.secondary }]}>{stats.volunteers}</Text>
                            <Text style={styles.statLabel}>Volunteers</Text>
                            <Text style={styles.statTrend}>↑ 15 new this month</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={() => action.screen && router.push(action.screen)}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                                    <Text style={styles.actionEmoji}>{action.icon}</Text>
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionDesc}>{action.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityList}>
                        {recentActivity.map((activity, index) => (
                            <View key={index} style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                                    <Text style={styles.activityEmoji}>{activity.icon}</Text>
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityDesc}>{activity.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
                    <View style={styles.navDot} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/(tabs)/AdminViewReport')}
                >
                    <Text style={styles.navIcon}>📊</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/(tabs)/AdminManageReport')}
                >
                    <Text style={styles.navIcon}>⚙️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/(tabs)/ManageRescueTasks')}
                >
                    <Text style={styles.navIcon}>🚑</Text>
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
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: COLORS.primary,
        paddingTop: 50,
    },
    adminBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
    },
    logoutButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIcon: {
        fontSize: 24,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    urgentAlerts: {
        backgroundColor: '#fef3c7',
        borderWidth: 1.5,
        borderColor: '#fbbf24',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    warningIcon: {
        fontSize: 20,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
    },
    alertItem: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    alertText: {
        fontSize: 14,
        color: '#78350f',
    },
    alertBold: {
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 16,
    },
    viewAll: {
        fontSize: 14,
        color: COLORS.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    statTrend: {
        fontSize: 12,
        color: COLORS.success,
        marginTop: 8,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionEmoji: {
        fontSize: 28,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    actionDesc: {
        fontSize: 12,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    activityList: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        overflow: 'hidden',
    },
    activityItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 12,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityEmoji: {
        fontSize: 20,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 2,
    },
    activityDesc: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    bottomNav: {
        flexDirection: 'row',
        height: 64,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 24,
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 24,
        color: COLORS.textLight,
    },
    navIconActive: {
        color: COLORS.secondary,
    },
    navDot: {
        width: 6,
        height: 6,
        backgroundColor: COLORS.secondary,
        borderRadius: 3,
        marginTop: 4,
    },
});

export default AdminDashboardScreen;
