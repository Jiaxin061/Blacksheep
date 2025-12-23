// File: volunteerContributionPage.js
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- Constants & Theme ---
const Colors = {
    background: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#14b8a6', // Teal/Cyan generic
    primaryLight: '#E0F2F1', // Light Teal for stats
    blueLight: '#E3F2FD', // Light Blue for stats
    cardBg: '#F3F4F6',
    white: '#FFFFFF',
    tagBlue: '#3B82F6',
    tagOrange: '#F59E0B',
    success: '#10B981',
    border: '#E5E7EB',
};

const Spacing = { s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 8, m: 12, l: 16, xl: 20 };

// --- Mock Data ---
import { MockDataStore } from '../model/MockDataStore';

const MOCK_USER = {
    name: 'Karen',
    hours: 24,
    events: 5,
};

const CONTRIBUTIONS = [
    {
        id: 'c1',
        title: 'Beach Cleanup Drive',
        date: 'November 10, 2025',
        description: 'Helped clean beach area and rescued 2 injured seabirds',
        hours: 4,
    },
    {
        id: 'c2',
        title: 'TNR Program',
        date: 'November 5, 2025',
        description: 'Trap-Neuter-Return program for 8 community cats',
        hours: 6,
    },
    {
        id: 'c3',
        title: 'Community Education',
        date: 'October 28, 2025',
        description: 'Distributed flyers about responsible pet ownership',
        hours: 3,
    }
];

// --- Components ---

const StatCard = ({ value, label, colorBg, colorText }) => (
    <View style={[styles.statCard, { backgroundColor: colorBg }]}>
        <Text style={[styles.statValue, { color: colorText }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colorText }]}>{label}</Text>
    </View>
);

const UpcomingEventCard = ({ event }) => (
    <View style={styles.eventCard}>
        <View style={styles.eventImageContainer}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <View style={[styles.tagBadge, { backgroundColor: event.tagColor }]}>
                <Text style={styles.tagText}>{event.tag}</Text>
            </View>
        </View>
        <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{event.title}</Text>

            <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>{event.location}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{event.time}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color={Colors.tagBlue} />
                <Text style={styles.detailText}>{event.volunteers} volunteers joined</Text>
            </View>
        </View>
    </View>
);

const ContributionItem = ({ item }) => (
    <View style={styles.contributionItem}>
        <View style={styles.contributionIconContainer}>
            <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
        </View>
        <View style={styles.contributionInfo}>
            <View style={styles.contributionHeader}>
                <Text style={styles.contributionTitle}>{item.title}</Text>
                <Text style={styles.contributionHours}>{item.hours}h</Text>
            </View>
            <Text style={styles.contributionDate}>{item.date}</Text>
            <Text style={styles.contributionDesc}>{item.description}</Text>
        </View>
    </View>
);

const VolunteerContributionPage = () => {
    const navigation = useNavigation();
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    // Refresh data when screen focuses
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // "The system displays the event in the 'Registered Events' section."
            // We assume "Upcoming Events" section displays registered events (and maybe top recommendations?)
            // Based on the prompt "If the user registered, the registration is stored and displayed in the 'Registered Events' section."
            // So we should show Registered events here.

            // For this layout, let's show ALL registered events + maybe some recommendations if empty?
            // Let's stick to showing registered events as per requirement.
            const registered = MockDataStore.getRegisteredEvents();
            setUpcomingEvents(registered);
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Volunteer</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <View style={styles.nameRow}>
                            <Text style={styles.nameText}>{MOCK_USER.name}!</Text>
                            <Text style={styles.handWave}>👋</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard
                        value={MOCK_USER.hours}
                        label="Hours"
                        colorBg={'#14b8a6'} // Light Blue
                        colorText={'#ffffffff'}
                    />
                    <View style={{ width: Spacing.m }} />
                    <StatCard
                        value={upcomingEvents.length} // Dynamic Event Count
                        label="Events"
                        colorBg={'#14b8a6'} // Light Purple/Pinkish
                        colorText={'#ffffffff'}
                    />
                </View>

                {/* Upcoming Events (Registered) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Registered Events</Text>
                    <TouchableOpacity onPress={() => router.push('/pages/volunteerEventListPage')}>
                        <Text style={styles.seeAllText}>Browse All</Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal Scroll for Events */}
                {upcomingEvents.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {upcomingEvents.map((event) => (
                            <View key={event.id} style={{ marginRight: Spacing.m }}>
                                <UpcomingEventCard event={event} />
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={{ padding: Spacing.m, alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.m, marginBottom: Spacing.l }}>
                        <Text style={{ color: Colors.textSecondary }}>You haven't registered for any events yet.</Text>
                    </View>
                )}

                {/* My Contributions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Contributions</Text>
                </View>

                <View style={styles.contributionsList}>
                    {CONTRIBUTIONS.map((item) => (
                        <ContributionItem key={item.id} item={item} />
                    ))}
                </View>

                {/* Bottom Padding for scroll */}
                <View style={{ height: 80 }} />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.m,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: Spacing.s,
        marginBottom: Spacing.l,
    },
    welcomeText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    nameText: {
        fontSize: 26,
        fontWeight: '800', // Extra bold
        color: Colors.text,
    },
    handWave: {
        fontSize: 24,
        marginLeft: 8,
    },
    settingsButton: {
        padding: 4,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        padding: Spacing.l,
        borderRadius: BorderRadius.l,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    sectionTitle: {
        fontSize: 20, // Slightly larger
        fontWeight: '700',
        color: Colors.text,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.tagBlue,
        fontWeight: '600',
    },
    horizontalScroll: {
        paddingBottom: Spacing.l,
    },
    eventCard: {
        width: 280,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.l,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    eventImageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    tagBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    eventDetails: {
        padding: Spacing.m,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.m,
    },
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
    contributionsList: {
        marginTop: Spacing.s,
    },
    contributionItem: {
        flexDirection: 'row',
        marginBottom: Spacing.l,
        backgroundColor: '#F9FAFB', // Very light grey background
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
    },
    contributionIconContainer: {
        marginRight: Spacing.m,
    },
    checkIcon: {
        width: 32,
        height: 32,
        backgroundColor: Colors.success,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contributionInfo: {
        flex: 1,
    },
    contributionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    contributionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
    },
    contributionHours: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.tagBlue, // Blue text for hours
    },
    contributionDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    contributionDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});

export default VolunteerContributionPage;
