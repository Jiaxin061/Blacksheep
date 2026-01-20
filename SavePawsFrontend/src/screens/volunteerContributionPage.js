// File: volunteerContributionPage.js
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants & Theme ---
const Colors = {
    background: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#14b8a6', primaryDark: '#0f766e',
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
import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';



const VolunteerContributionPage = () => {
    const navigation = useNavigation();
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [contributions, setContributions] = useState([]); // State for contributions
    const [userStats, setUserStats] = useState({ name: 'Volunteer', hours: 0, events: 0 });

    // Refresh data when screen focuses
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            const loadData = async () => {
                try {

                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) {
                        console.log('No user ID found');
                        return;
                    }

                    // 1. Fetch Registered Events (All registrations)
                    const myEvents = await ApiService.getUserEvents(userId);

                    // 2. Fetch Contributions (Confirmed attendance)
                    const myContributions = await ApiService.getContributions(userId);
                    const completedEventIds = new Set(myContributions.map(c => c.eventID));

                    // 3. Map Registered Events and filter out those already in Contributions
                    const mappedUpcoming = myEvents.map(e => {
                        const start = new Date(e.start_date);
                        const end = new Date(e.end_date);
                        const timeString = !isNaN(start) && !isNaN(end)
                            ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Time TBD';

                        return {
                            id: (e.recordID || e.eventID).toString(),
                            eventID: e.eventID,
                            title: e.title,
                            location: e.eventLocation || e.location,
                            time: timeString,
                            startDate: e.start_date,
                            image: e.image_url,
                            tag: e.tag_text || (new Date(e.start_date) < new Date() ? 'Ongoing' : 'Upcoming'),
                            tagColor: new Date(e.start_date) < new Date() ? '#F59E0B' : Colors.primary,
                            volunteers: 0
                        };
                    });

                    // Only show events that aren't marked as "Attended" (contributed)
                    const activeRegistrations = mappedUpcoming
                        .filter(e => !completedEventIds.has(e.eventID))
                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Chronological order

                    setUpcomingEvents(activeRegistrations);

                    // 4. Map contributions to UI format
                    const mappedContributions = myContributions.map(c => ({
                        id: c.contributionID.toString(),
                        eventID: c.eventID,
                        title: c.title,
                        hours: c.hours_contributed,
                        date: new Date(c.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        eventDate: c.event_date,
                        description: c.description,
                        status: c.participation_status
                    })).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)); // Chronological order (Latest behind earlier)

                    setContributions(mappedContributions);

                    // 5. Fetch User Name (from Registration)
                    let userName = 'Volunteer';
                    try {
                        const regDetails = await ApiService.getRegistrationDetails(userId);
                        if (regDetails && regDetails.userName) {
                            userName = regDetails.userName;
                        }
                    } catch (e) {
                        console.log('User has no volunteer registration name, using default.');
                    }

                    // 6. Calculate Stats & Set State
                    const totalHours = mappedContributions.reduce((sum, item) => sum + Number(item.hours), 0);
                    // Total unique events = Active registrations + Completed contributions
                    const totalEvents = activeRegistrations.length + mappedContributions.length;

                    setUserStats({
                        name: userName,
                        hours: totalHours,
                        events: totalEvents
                    });

                } catch (error) {
                    console.warn("Failed to load contribution data", error);
                }
            };
            loadData();
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />


            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <View style={styles.nameRow}>
                            <Text style={styles.nameText}>{userStats.name}!</Text>
                            <Text style={styles.handWave}>👋</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard
                        value={userStats.hours}
                        label="Hours Contributed"
                        colorBg={'#14b8a6'} // Light Blue
                        colorText={'#ffffffff'}
                    />
                    <View style={{ width: Spacing.m }} />
                    <StatCard
                        value={upcomingEvents.length} // Dynamic Event Count
                        label="Events Registered"
                        colorBg={'#14b8a6'} // Light Purple/Pinkish
                        colorText={'#ffffffff'}
                    />
                </View>

                {/* Upcoming Events (Registered) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Registered Events</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('VolunteerEventList')}>
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
                    {contributions.length > 0 ? (
                        contributions.map((item) => (
                            <ContributionItem key={item.id} item={item} />
                        ))
                    ) : (
                        <View style={{ padding: Spacing.m, alignItems: 'center' }}>
                            <Text style={{ color: Colors.textSecondary }}>No contributions yet.</Text>
                        </View>
                    )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingVertical: 10,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        elevation: 0, // Remove shadow if any
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
        marginTop: Spacing.m,
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


// --- Sub-Components ---

const StatCard = ({ value, label, colorBg, colorText }) => (
    <View style={[styles.statCard, { backgroundColor: colorBg }]}>
        <Text style={[styles.statValue, { color: colorText }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colorText }]}>{label}</Text>
    </View>
);

const UpcomingEventCard = ({ event }) => (
    <View style={styles.eventCard}>
        <View style={styles.eventImageContainer}>
            {event.image ? (
                <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
            ) : (
                <View style={[styles.eventImage, { backgroundColor: Colors.textSecondary }]} />
            )}
            <View style={[styles.tagBadge, { backgroundColor: event.tagColor }]}>
                <Text style={styles.tagText}>{event.tag}</Text>
            </View>
        </View>
        <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
            <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                    {event.startDate && !isNaN(new Date(event.startDate).getTime())
                        ? new Date(event.startDate).toLocaleDateString()
                        : 'Date TBD'}
                </Text>
            </View>
            <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
            </View>
        </View>
    </View>
);

const ContributionItem = ({ item }) => (
    <View style={styles.contributionItem}>
        <View style={styles.contributionIconContainer}>
            <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
        </View>
        <View style={styles.contributionInfo}>
            <View style={styles.contributionHeader}>
                <Text style={styles.contributionTitle}>{item.title}</Text>
                <Text style={styles.contributionHours}>+{item.hours} hrs</Text>
            </View>
            <Text style={styles.contributionDate}>{item.date}</Text>
            <Text style={styles.contributionDesc}>{item.description}</Text>
        </View>
    </View>
);

export default VolunteerContributionPage;
