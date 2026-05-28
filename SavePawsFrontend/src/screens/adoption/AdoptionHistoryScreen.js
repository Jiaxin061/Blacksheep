import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import adoptionService from '../../features/adoption/services/adoptionService';
import { colors } from '../../theme/colors';

export default function AdoptionHistoryScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {
            setError(null);
            const response = await adoptionService.getMyRequests();
            // adoptionService.getMyRequests returns response.data directly based on service definition
            // but let's handle if it returns the full object or just data array depending on the service implementation details
            // The service file shows: return response.data;
            // Backend returns: { success: true, data: [...], count: ... } for my-requests
            // So response in service will be the full backend response object.
            // Wait, let's re-read service code. 
            // service: const response = await api.get('/api/adoption/my-requests'); return response.data;
            // api (axios) response.data IS the backend response json.
            // So result here is { success: true, data: [...], ... }

            if (response && response.success) {
                setRequests(response.data);
            } else {
                // Fallback if data is directly the array (unlikely based on backend)
                setRequests(Array.isArray(response) ? response : []);
            }
        } catch (err) {
            console.error('Error fetching adoption requests:', err);
            setError('Failed to load your adoption history.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return colors.success || '#4CAF50';
            case 'rejected': return colors.danger || '#F44336';
            case 'pending': return colors.warning || '#FF9800';
            default: return colors.textSecondary || '#757575';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdoptionRequestDetail', { request: item })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.animalName}>{item.animal_name || 'Unknown Animal'}</Text>
                    <Text style={styles.species}>{item.species} {item.breed ? `• ${item.breed}` : ''}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status ? item.status.toUpperCase() : 'UNKNOWN'}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.dateLabel}>Applied on {formatDate(item.request_date)}</Text>

                {item.status === 'rejected' && item.rejection_reason && (
                    <View style={styles.rejectionContainer}>
                        <Text style={styles.rejectionTitle}>Reason for Rejection:</Text>
                        <Text style={styles.rejectionText}>{item.rejection_reason}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.customHeader}>
            <TouchableOpacity
                style={styles.headerTab}
                onPress={() => navigation.navigate('AdoptionHub')}
            >
                <Text style={styles.headerTabText}>Animals</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.headerTab, styles.activeTab]}
                activeOpacity={1}
            >
                <Text style={[styles.headerTabText, styles.activeTabText]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.headerTab}
                onPress={() => navigation.navigate('AdoptionFollowUp')}
            >
                <Text style={styles.headerTabText}>Updates</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {requests.length === 0 && !error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>You haven't submitted any adoption requests yet.</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('AdoptionHub')}
                    >
                        <Text style={styles.browseButtonText}>Browse Animals</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                />
            )}
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
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    animalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    species: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateLabel: {
        fontSize: 13,
        color: '#999',
        marginBottom: 8,
    },
    rejectionContainer: {
        marginTop: 8,
        padding: 10,
        backgroundColor: '#FFEBEE',
        borderRadius: 6,
    },
    rejectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 2,
    },
    rejectionText: {
        fontSize: 13,
        color: '#C62828',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    browseButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    customHeader: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 5,
    },
    headerTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 4,
    },
    activeTab: {
        backgroundColor: '#14b8a6',
    },
    headerTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
});
