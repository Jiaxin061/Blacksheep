import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const UserProfilePage = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const response = await ApiService.getUserById(userId);
                if (response.success && response.user) {
                    setUser(response.user);
                } else if (response.success === false) {
                    console.error('Server error fetching profile:', response.message);
                    Alert.alert('Profile Error', response.message || 'Could not load your profile');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Network Error', 'Check your internet connection and make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole', 'userName']);
                            navigation.replace('Landing');
                        } catch (error) {
                            console.error('Logout error:', error);
                            navigation.replace('Landing');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    const firstInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
    const lastInitial = user?.last_name ? user.last_name.charAt(0).toUpperCase() : '';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{firstInitial}{lastInitial}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                    <View style={[styles.badge, user?.is_volunteer && styles.volunteerBadge]}>
                        <Text style={styles.badgeText}>
                            {user?.is_volunteer ? (user.volunteer_badge || 'Volunteer') : 'User'}
                        </Text>
                    </View>
                </View>

                {/* Account Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>

                    <View style={styles.infoCard}>
                        <InfoItem
                            icon="mail-outline"
                            label="Email Address"
                            value={user?.email || 'Not provided'}
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="call-outline"
                            label="Phone Number"
                            value={user?.phone_number || 'Not provided'}
                        />
                        <View style={styles.divider} />
                        <InfoItem
                            icon="card-outline"
                            label="IC Number"
                            value={(() => {
                                const ic = String(user?.ic_number || user?.icNumber || '');
                                if (!ic) return 'Not provided';
                                // Format: 990101-**-****
                                if (ic.length >= 6) {
                                    return `${ic.slice(0, 6)}-**-****`;
                                }
                                return 'Invalid IC';
                            })()}
                        />
                    </View>
                </View>

                {/* More Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <View style={styles.infoCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#14b8a6" />
                            </View>
                            <Text style={styles.menuText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="help-circle-outline" size={20} color="#14b8a6" />
                            </View>
                            <Text style={styles.menuText}>Help & Support</Text>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.1</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#14b8a6" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#14b8a6',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#14b8a6',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
    },
    volunteerBadge: {
        backgroundColor: '#ccfbf1',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#14b8a6',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        marginTop: 32,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 40,
        fontSize: 12,
        color: '#94a3b8',
    }
});

export default UserProfilePage;
