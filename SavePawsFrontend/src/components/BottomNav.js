import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const BottomNav = () => {
    const navigation = useNavigation();
    const currentRoute = useNavigationState(state => state?.routes[state.index]?.name);

    const navItems = [
        { name: 'Home', icon: 'home-outline', route: 'UserHome' },
        { name: 'Adoption', icon: 'paw-outline', route: 'AdoptionHub' },
        { name: 'Volunteer', icon: 'hand-left-outline', route: 'VolunteerContribution' },
        { name: 'Community', icon: 'people-outline', route: 'CommunityPage' },
        { name: 'Donate', icon: 'heart-outline', route: 'DonationHome' },
    ];

    const handlePress = async (item) => {
        if (item.name === 'Volunteer') {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('Error', 'User ID not found. Please log in again.');
                    return;
                }

                const statusData = await ApiService.getVolunteerStatus(userId);
                console.log('Volunteer Status (Nav):', statusData);

                if (!statusData.hasRegistration) {
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
            navigation.navigate(item.route);
        }
    };

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                    <TouchableOpacity
                        key={item.name}
                        style={[styles.navItem, isActive && styles.navItemActive]}
                        onPress={() => handlePress(item)}
                    >
                        <Ionicons
                            name={item.icon}
                            size={isActive ? 26 : 24}
                            color={isActive ? '#14b8a6' : '#5b6b7c'}
                        />
                        <Text
                            style={[
                                styles.navText,
                                isActive && styles.navTextActive,
                                isActive && { color: '#14b8a6' }
                            ]}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
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
    },
});

export default BottomNav;
