import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Colors = {
    primary: '#14b8a6',
    white: '#ffffff',
    background: '#f1f5f9',
    text: '#111827',
    textSecondary: '#5b6b7c',
    cardBg: '#f0fdfa',
    cardBorder: '#ccfbf1',
};

const AdminVolunteerHubScreen = () => {
    const navigation = useNavigation();

    const options = [
        {
            id: 'registrations',
            title: 'Registration Management',
            desc: 'Review and approve volunteer applications',
            icon: 'people',
            screen: 'AdminRegistrationManagement',
            color: '#0f766e',
        },
        {
            id: 'events',
            title: 'Event Management',
            desc: 'Create and manage volunteer events',
            icon: 'calendar',
            screen: 'AdminEventManagement',
            color: '#0d9488',
        },
    ];


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Volunteer Management</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>Select a management module to continue</Text>

                <View style={styles.grid}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.card}
                            onPress={() => navigation.navigate(option.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                                <Ionicons name={option.icon} size={32} color={Colors.white} />
                            </View>
                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle}>{option.title}</Text>
                                <Text style={styles.cardDesc}>{option.desc}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.primary,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
    },
    content: {
        padding: 24,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    grid: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8ef',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardText: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});

export default AdminVolunteerHubScreen;
