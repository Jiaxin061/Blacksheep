// File: volunteerEventListPage.js (Route: /volunteer/events)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router'; // NEW: Import router
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Embedded Constants (Teal Theme) ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#ccfbf1',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', success: '#10b981',
};
const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 4, m: 8, l: 12, xl: 16 };
// ---------------------------------------

import { MockDataStore } from '../model/MockDataStore';

// Helper function for date formatting
const formatDateTime = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
};

// Event Card Component
const EventCard = ({ item, onJoin, onDetails }) => { // Added onDetails prop
    const { id, title, description, location, startDate, isRegistered } = item;
    const dateDisplay = formatDateTime(startDate);

    return (
        // WRAPPED WITH TOUCHABLE OPACITY TO ENABLE DETAIL NAVIGATION
        <TouchableOpacity style={styles.card} onPress={() => onDetails(item)}>
            <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{title}</Text>
                <Text style={styles.location}>📍 {location} | 🗓️ {dateDisplay}</Text>
                <Text style={styles.description} numberOfLines={3}>{description}</Text>

                {/* Existing Join/Registered button */}
                <TouchableOpacity
                    style={[styles.joinButton, isRegistered && styles.registeredButton]}
                    onPress={() => onJoin(id)}
                    disabled={isRegistered}
                >
                    <Text style={styles.buttonText}>
                        {isRegistered ? 'Registered' : 'Join Event'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};


const VolunteerEventListPage = () => {
    const navigation = useNavigation();

    // Using simple state sync for this mock
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Reload data when screen focuses to catch updates from Details Page
    // Using navigation.addListener('focus') or generic fetch on mount? 
    // In expo-router/React Navigation, useFocusEffect is best, but let's stick to simple useEffect for now 
    // or add a listener if we want it to be perfectly synced on back.
    // For simplicity, I'll just fetch on mount and refresh. ideally useFocusEffect.

    const fetchEvents = async () => {
        const fetchMethod = isRefreshing ? setIsRefreshing : setIsLoading;
        fetchMethod(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const allEvents = MockDataStore.getEvents();
        setEvents(allEvents);

        fetchMethod(false);
    };

    // Add focus listener to refresh when coming back from Details page
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchEvents();
        });
        return unsubscribe;
    }, [navigation]);

    const handleJoinProgram = async (programId) => {
        const success = MockDataStore.registerForEvent(programId);
        if (success) {
            Alert.alert("Success", "Registered successfully");
            fetchEvents(); // Refresh UI
        } else {
            Alert.alert("Already Registered", "You are already registered.");
        }
    };

    // NEW: Handle event click to view details (UC18: Step 4)
    const handleEventDetails = (event) => {
        // Navigate to the new Details Page, passing ID so it can fetch the fresh full object
        router.push({
            pathname: '/pages/volunteerEventDetailsPage',
            params: { id: event.id }
        });
    };

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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Available Events</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.container}>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <EventCard
                            item={item}
                            onJoin={handleJoinProgram}
                            onDetails={handleEventDetails} // Pass the new handler
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
    safeArea: { flex: 1, backgroundColor: Colors.white, paddingTop: Platform.OS === 'android' ? 25 : 0 }, // Added safeArea
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.m,
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
    },
    cardContent: { padding: Spacing.m, },
    eventTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs, },
    location: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.s, },
    description: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: Spacing.m, },
    joinButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: BorderRadius.m,
        alignItems: 'center',
    },
    registeredButton: {
        backgroundColor: Colors.primaryDark,
        opacity: 0.7,
    },
    buttonText: { fontSize: 16, fontWeight: '700', color: Colors.white, },
});

export default VolunteerEventListPage;