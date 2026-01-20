import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { colors } from '../../theme/colors';

export default function AdoptionRequestDetailScreen({ route, navigation }) {
    const { request } = route.params || {};

    if (!request) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Request details not available</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return colors.success || '#4CAF50';
            case 'rejected': return colors.danger || '#F44336';
            case 'pending': return colors.warning || '#FF9800';
            default: return colors.textSecondary || '#757575';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Animal Header Section */}
                <View style={styles.animalCard}>
                    {request.image_url ? (
                        <Image
                            source={{ uri: request.image_url }}
                            style={styles.animalImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>🐾</Text>
                        </View>
                    )}

                    <View style={styles.animalInfo}>
                        <Text style={styles.animalName}>{request.animal_name || 'Unknown Animal'}</Text>
                        <Text style={styles.animalDetails}>
                            {request.species} {request.breed ? `• ${request.breed}` : ''}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                            <Text style={styles.statusText}>{request.status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Status Information */}
                {request.status === 'rejected' && (
                    <View style={styles.rejectionContainer}>
                        <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                        <Text style={styles.rejectionText}>
                            {request.rejection_reason || 'No specific reason provided.'}
                        </Text>
                    </View>
                )}

                {/* Application Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Application Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Submitted On</Text>
                        <Text style={styles.value}>{formatDate(request.request_date)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Housing Type</Text>
                        <Text style={styles.value}>{request.housing_type}</Text>
                    </View>

                    <View style={styles.detailBlock}>
                        <Text style={styles.label}>Reason for Adoption</Text>
                        <Text style={styles.valueText}>{request.adoption_reason}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollContent: {
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    animalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    animalImage: {
        width: '100%',
        height: 200,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 50,
    },
    animalInfo: {
        padding: 16,
        alignItems: 'center',
    },
    animalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    animalDetails: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    rejectionContainer: {
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    rejectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 8,
    },
    rejectionText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
        paddingBottom: 8,
    },
    detailBlock: {
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    value: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
    valueText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginTop: 8,
        backgroundColor: '#FAFAFA',
        padding: 12,
        borderRadius: 8,
    },
});
