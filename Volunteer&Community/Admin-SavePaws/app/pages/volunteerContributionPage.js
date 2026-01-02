
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    background: '#F9FAFB',
    white: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
};

const VolunteerContributionPage = () => {
    const navigation = useNavigation();

    // Placeholder data since original file was lost
    const [stats, setStats] = useState({
        hours: 12.5,
        events: 3,
        impact: "High"
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Volunteer Dashboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>My Contribution</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.hours}</Text>
                            <Text style={styles.statLabel}>Hours</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.events}</Text>
                            <Text style={styles.statLabel}>Events</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.impact}</Text>
                            <Text style={styles.statLabel}>Impact</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/pages/volunteerEventListPage')}
                >
                    <Ionicons name="calendar-outline" size={24} color={Colors.white} />
                    <Text style={styles.actionText}>Browse Events</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#0f766e', marginTop: 12 }]}
                    onPress={() => router.push('/pages/volunteerRegistrationPage')}
                >
                    <Ionicons name="clipboard-outline" size={24} color={Colors.white} />
                    <Text style={styles.actionText}>Registration Status</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
    content: { padding: 16 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        elevation: 2
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
    statLabel: { color: Colors.textSecondary },
    actionButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 3
    },
    actionText: { color: Colors.white, fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});

export default VolunteerContributionPage;
