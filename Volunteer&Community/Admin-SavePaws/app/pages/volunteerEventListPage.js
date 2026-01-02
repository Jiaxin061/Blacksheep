
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    background: '#F9FAFB',
    white: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6b7280',
};

const EventCard = ({ item }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/pages/volunteerEventDetailsPage', params: { id: item.id } })}
    >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
            <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.cardLocation}>{item.location}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const VolunteerEventListPage = () => {
    const navigation = useNavigation();
    const [events, setEvents] = useState([
        { id: 1, title: 'Beach Cleanup', date: 'Sat, 12 Aug - 09:00 AM', location: 'Sunny Beach', image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec' },
        { id: 2, title: 'Shelter Help', date: 'Sun, 13 Aug - 10:00 AM', location: 'City Shelter', image: 'https://images.unsplash.com/photo-1551730459-92db2a308d6b' }
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upcoming Events</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EventCard item={item} />}
                contentContainerStyle={styles.list}
            />
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
    list: { padding: 16 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        overflow: 'hidden'
    },
    cardImage: { width: '100%', height: 150 },
    cardContent: { padding: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    cardDate: { color: Colors.primary, fontWeight: '600', marginBottom: 8 },
    locationContainer: { flexDirection: 'row', alignItems: 'center' },
    cardLocation: { color: Colors.textSecondary, marginLeft: 4 }
});

export default VolunteerEventListPage;
