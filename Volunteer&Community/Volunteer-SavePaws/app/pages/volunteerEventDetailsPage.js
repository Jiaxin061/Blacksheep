// File: volunteerEventDetailsPage.js
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';

import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants & Theme (Matching project theme) ---
const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    primaryLight: '#ccfbf1',
    white: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    background: '#F9FAFB',
};

const Spacing = { s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { m: 12, l: 16, xl: 24 };

import { VolunteerService } from '../services/VolunteerService';


const VolunteerEventDetailsPage = () => {
    const params = useLocalSearchParams();
    const [event, setEvent] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Mock User ID
    const CURRENT_USER_ID = 2;

    useFocusEffect(
        React.useCallback(() => {
            const loadEvent = async () => {
                if (params.id) {
                    try {
                        // 1. Fetch Event Details
                        const eventData = await VolunteerService.getEventDetails(params.id);

                        // 2. Check registration status
                        const userEvents = await VolunteerService.getUserEvents(CURRENT_USER_ID);
                        const isRegistered = userEvents.some(e => e.eventID.toString() === params.id.toString());

                        // Map DB fields to UI fields
                        setEvent({
                            id: eventData.eventID,
                            title: eventData.title,
                            description: eventData.description,
                            location: eventData.location,
                            time: eventData.time_range,
                            startDate: eventData.event_date,
                            image: eventData.image_url || 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1',
                            isRegistered: isRegistered
                        });
                    } catch (error) {
                        console.error(error);
                        Alert.alert("Error", "Failed to load event details");
                    }
                }
                setIsLoading(false);
            };
            loadEvent();
        }, [params.id])
    );

    const handleRegister = async () => {
        if (!event) return;

        try {
            const result = await VolunteerService.registerForEvent(CURRENT_USER_ID, event.id);

            if (result.success) {
                Alert.alert(
                    "Success",
                    "Registered successfully",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Navigate to Home first (unwinds stack), then push Contribution
                                router.navigate('/pages/homepage');
                                setTimeout(() => {
                                    router.push('/pages/volunteerContributionPage');
                                }, 100);
                            }
                        }
                    ]
                );
                setEvent({ ...event, isRegistered: true });
            } else {
                Alert.alert("Notice", result.message);
            }
        } catch (error) {
            Alert.alert("Error", "Could not register for this event.");
        }
    };

    if (isLoading || !event) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading event details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <Image source={{ uri: event.image }} style={styles.heroImage} />

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{event.title}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Open</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>{event.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>
                            {event.time || new Date(event.startDate).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>About this Event</Text>
                    <Text style={styles.description}>{event.description}</Text>

                    <View style={styles.organizerContainer}>
                        <View style={styles.organizerAvatar}>
                            <Text style={{ fontSize: 20 }}>🦁</Text>
                        </View>
                        <View>
                            <Text style={styles.organizerName}>SavePaws Organization</Text>
                            <Text style={styles.organizerRole}>Organizer</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.joinButton, event.isRegistered && styles.registeredButton]}
                    onPress={handleRegister}
                    disabled={event.isRegistered}
                >
                    <Text style={styles.joinButtonText}>
                        {event.isRegistered ? 'Registered' : 'Register'}
                    </Text>
                </TouchableOpacity>
            </View>
            <AIAssistantFAB bottom={100} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
        // Removed paddingTop to match Contribution Page
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingVertical: 10,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        // Removed padding to match Event List
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    container: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#e1e4e8',
        borderWidth: 1,
        borderColor: '#14b8a6',
    },
    contentContainer: {
        padding: Spacing.l,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        marginTop: -24,
        backgroundColor: Colors.white,
        flex: 1,
        minHeight: 500, // Ensure it fills space
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
        marginRight: Spacing.s,
    },
    badge: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: Colors.primaryDark,
        fontSize: 12,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    infoText: {
        marginLeft: Spacing.s,
        fontSize: 15,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.l,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.s,
    },
    description: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: Spacing.l,
    },
    organizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
    },
    organizerAvatar: {
        width: 48,
        height: 48,
        backgroundColor: '#FFD700', // Gold color for avatar bg
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    organizerName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    organizerRole: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    bottomBar: {
        padding: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.white,
    },
    joinButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: BorderRadius.l,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    registeredButton: {
        backgroundColor: Colors.textSecondary,
        shadowOpacity: 0,
    },
    joinButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
});

export default VolunteerEventDetailsPage;
