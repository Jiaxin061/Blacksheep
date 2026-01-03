
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    background: '#F9FAFB',
    white: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6b7280',
};

const VolunteerEventDetailsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || { id: 1 };

    const [isRegistered, setIsRegistered] = useState(false);

    const handleRegister = () => {
        setIsRegistered(true);
        Alert.alert("Success", "You have registered for this event!");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec' }} style={styles.coverImage} />

                <View style={styles.content}>
                    <Text style={styles.title}>Beach Cleanup Drive</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>Sat, 12 Aug - 09:00 AM</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>Sunny Beach, CA</Text>
                    </View>

                    <Text style={styles.sectionTitle}>About Event</Text>
                    <Text style={styles.description}>
                        Join us to help clean up the local beach! Gloves and bags will be provided.
                        Let's make our environment cleaner and safer for everyone.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.registerButton, isRegistered && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isRegistered}
                >
                    <Text style={styles.buttonText}>{isRegistered ? "Registered" : "Register Now"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        position: 'absolute', top: 40, left: 20, zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8
    },
    coverImage: { width: '100%', height: 250 },
    content: { padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoText: { marginLeft: 12, fontSize: 16, color: Colors.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 8, color: Colors.text },
    description: { lineHeight: 24, color: Colors.textSecondary, fontSize: 15 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: Colors.white },
    registerButton: {
        backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center'
    },
    disabledButton: { backgroundColor: Colors.textSecondary },
    buttonText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 }
});

export default VolunteerEventDetailsPage;
