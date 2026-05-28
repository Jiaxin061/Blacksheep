// File: volunteerEventListPage.js (Route: /volunteer/events)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router'; // NEW: Import router
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Embedded Constants (Teal Theme) ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#ccfbf1',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', success: '#10b981',
};
const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 4, m: 8, l: 12, xl: 16 };
// ---------------------------------------

import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function for date formatting
const formatDateTime = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTimeRange = (start, end) => {
    if (!start || !end) return 'Time TBD';
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Time TBD';
    return `${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// Event Card Component
const EventCard = ({ item, onDetails }) => {
    const { id, title, description, location, startDate, isRegistered, image } = item;
    const dateDisplay = formatDateTime(startDate);

    return (
        <TouchableOpacity style={styles.card} onPress={() => onDetails(item)}>
            {image && <Image source={{ uri: image }} style={styles.cardImage} />}
            <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs }}>
                    <Text style={styles.eventTitle}>{title}</Text>
                    {item.isOngoing ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#FADFA1' }]}>
                            <Text style={[styles.statusText, { color: '#B45309' }]}>Ongoing</Text>
                        </View>
                    ) : isRegistered && (
                        <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Registered</Text>
                    )}
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{location || 'Location TBD'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{dateDisplay}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{item.timeRange}</Text>
                </View>
                <Text style={styles.description} numberOfLines={3}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const VolunteerEventListPage = () => {
    const navigation = useNavigation();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);



    const fetchEvents = async () => {
        const fetchMethod = isRefreshing ? setIsRefreshing : setIsLoading;
        fetchMethod(true);

        try {
            // 1. Fetch all available events
            const allEvents = await ApiService.getAvailableEvents();

            // 2. Fetch user's registered events to mark 'isRegistered' status
            const userId = await AsyncStorage.getItem('userId');
            let userEvents = [];
            if (userId) {
                userEvents = await ApiService.getUserEvents(userId);
            }
            const registeredIds = new Set(userEvents.map(e => e.eventID));

            const now = new Date();
            const mappedEvents = allEvents.map(e => {
                const startDate = new Date(e.start_date);
                const endDate = e.end_date ? new Date(e.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                const isOngoing = startDate <= now && endDate > now;

                return {
                    id: e.eventID,
                    title: e.title,
                    description: e.description,
                    location: e.eventLocation,
                    startDate: e.start_date,
                    endDate: e.end_date,
                    timeRange: formatTimeRange(e.start_date, e.end_date),
                    image: e.image_url || 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1', // Fallback
                    isRegistered: registeredIds.has(e.eventID),
                    isOngoing: isOngoing
                };
            });

            setEvents(mappedEvents);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load events.");
        } finally {
            fetchMethod(false);
        }
    };

    const handleEventDetails = (event) => {
        navigation.navigate('VolunteerEventDetails', { id: event.id });
    };

    // Auto-refresh on focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchEvents();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Fetching available events...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />


            <View style={styles.container}>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <EventCard
                            item={item}
                            onDetails={handleEventDetails}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={fetchEvents} tintColor={Colors.primary} />
                    }
                    ListEmptyComponent={
                        !isLoading && (
                            <View style={styles.centerContainer}>
                                <Text style={styles.noDataText}>No available events at the moment.</Text>
                            </View>
                        )
                    }
                />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.white }, // Removed paddingTop
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    container: { flex: 1, backgroundColor: Colors.white, },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, },
    loadingText: { color: Colors.textSecondary, marginTop: Spacing.m, fontSize: 16 },
    noDataText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
    listContent: { padding: Spacing.m, },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.l,
        marginBottom: Spacing.m,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#e1e4e8',
        borderWidth: 1,
        borderColor: '#14b8a6', // Teal border to make it visible
    },
    cardContent: { padding: Spacing.m, },
    eventTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs, },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        marginLeft: 8,
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    description: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: Spacing.m, },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default VolunteerEventListPage;