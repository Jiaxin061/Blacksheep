import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import ApiService from '../services/api';

const Colors = {
    primary: '#14b8a6',
    primaryLight: '#ccfbf1',
    secondary: '#0f766e',
    background: '#f9fafb',
    white: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
};

const Spacing = {
    s: 8,
    m: 16,
    l: 24,
};

const BorderRadius = {
    s: 4,
    m: 12,
    l: 20,
};

export default function AdminRegistrationManagementPage() {
    const navigation = useNavigation();
    const [registrations, setRegistrations] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReg, setSelectedReg] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = async () => {
        try {
            const data = await ApiService.getAdminRegistrations();
            setRegistrations(data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const stats = useMemo(() => {
        const counts = { Pending: 0, Approved: 0, Rejected: 0, Total: registrations.length };
        registrations.forEach(r => {
            if (counts[r.registration_status] !== undefined) {
                counts[r.registration_status]++;
            }
        });
        return counts;
    }, [registrations]);

    const filteredData = useMemo(() => {
        return registrations.filter(r => {
            const matchesFilter = filterStatus === 'All' || r.registration_status === filterStatus;
            const fullName = `${r.first_name || ''} ${r.last_name || ''} ${r.userName || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        });
    }, [registrations, filterStatus, searchQuery]);

    const handleApprove = (reg) => {
        Alert.alert(
            'Approve Volunteer',
            `Are you sure you want to approve ${reg.userName || reg.first_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        const success = await ApiService.approveRegistration(reg.registrationID);
                        if (success) {
                            Alert.alert('Success', 'Volunteer approved successfully');
                            fetchData();
                        } else {
                            Alert.alert('Error', 'Failed to approve volunteer');
                        }
                    }
                }
            ]
        );
    };

    const handleRejectPress = (reg) => {
        setSelectedReg(reg);
        setRejectModalVisible(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason) {
            Alert.alert('Error', 'Please provide a reason for rejection');
            return;
        }
        const success = await ApiService.rejectRegistration(selectedReg.registrationID, rejectionReason);
        if (success) {
            Alert.alert('Success', 'Volunteer rejected');
            setRejectModalVisible(false);
            setRejectionReason('');
            fetchData();
        } else {
            Alert.alert('Error', 'Failed to reject volunteer');
        }
    };

    const getGeneralLocation = (location) => {
        if (!location) return 'Not Specified';
        const parts = location.split(',').map(p => p.trim());
        if (parts.length <= 2) return location;
        // Return the last two parts (e.g., City, State)
        return parts.slice(-2).join(', ');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                navigation.navigate('AdminRegistrationDetails', {
                    registration: JSON.stringify(item)
                });
            }}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.userName}>{item.userName || `${item.first_name} ${item.last_name}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.registration_status === 'Pending' ? '#fde68a' : item.registration_status === 'Approved' ? '#bbf7d0' : '#fecaca' }]}>
                    <Ionicons
                        name={item.registration_status === 'Pending' ? 'hourglass-outline' : item.registration_status === 'Approved' ? 'checkmark-circle' : 'close-circle'}
                        size={14}
                        color={item.registration_status === 'Pending' ? Colors.warning : item.registration_status === 'Approved' ? Colors.success : Colors.error}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.statusText, { color: item.registration_status === 'Pending' ? '#92400e' : item.registration_status === 'Approved' ? '#166534' : '#991b1b' }]}>
                        {item.registration_status}
                    </Text>
                </View>
            </View>

            <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={14} color={Colors.error} />
                <Text style={styles.locationText}>{getGeneralLocation(item.location)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Experience:</Text>
                    <Text style={styles.detailText} numberOfLines={1}>{item.experience || 'None'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Capability:</Text>
                    <Text style={styles.detailText} numberOfLines={1}>{item.capability || 'None'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Submitted:</Text>
                    <Text style={styles.detailText}>{new Date(item.submition_date).toISOString().split('T')[0]}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('AdminRegistrationDetails', {
                        registration: JSON.stringify(item)
                    });
                }}>
                    <Text style={styles.footerText}>Tap to view full details →</Text>
                </TouchableOpacity>
            </View>

            {item.registration_status === 'Pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item)}>
                        <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleRejectPress(item)}>
                        <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Volunteer Registrations</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: Colors.warning }]}>{stats.Pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.Approved}</Text>
                        <Text style={styles.statLabel}>Approved</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: Colors.error }]}>{stats.Rejected}</Text>
                        <Text style={styles.statLabel}>Rejected</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or location..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Filter Chips */}
                <View style={{ height: 50, marginBottom: 12 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterChip,
                                    filterStatus === status && styles.filterChipActive
                                ]}
                                onPress={() => setFilterStatus(status)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    filterStatus === status && styles.filterTextActive
                                ]}>
                                    {status} ({status === 'All' ? stats.Total : stats[status]})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* List */}
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.registrationID.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color={Colors.border} />
                            <Text style={styles.emptyText}>No registration requests found</Text>
                        </View>
                    }
                />
            </View>

            {/* Reject Modal */}
            <Modal visible={rejectModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Volunteer</Text>
                        <Text style={styles.modalSubtitle}>Please provide a reason for rejecting this application:</Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Reason for rejection..."
                            multiline
                            numberOfLines={4}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setRejectModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmReject}>
                                <Text style={styles.confirmText}>Confirm Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.primary, paddingTop: StatusBar.currentHeight || 0 },
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: 16,
        backgroundColor: Colors.primary
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },

    statsContainer: {
        flexDirection: 'row',
        padding: Spacing.m,
        justifyContent: 'space-between'
    },
    statCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.m,
        padding: Spacing.m,
        width: '31%',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statNumber: { fontSize: 24, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

    searchContainer: { paddingHorizontal: Spacing.m, marginBottom: Spacing.m },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: BorderRadius.l,
        paddingHorizontal: 16,
        height: 48,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: Colors.text },

    filterContainer: { paddingHorizontal: Spacing.m, gap: 10, height: 40 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 36,
    },
    filterChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    filterText: { fontSize: 14, color: Colors.textSecondary },
    filterTextActive: { color: Colors.white, fontWeight: '600' },

    listContent: { padding: Spacing.m, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.m,
        padding: 20,
        marginBottom: Spacing.m,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    userName: { fontSize: 18, fontWeight: '700', color: Colors.text },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: { fontSize: 12, fontWeight: 'bold' },

    locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    locationText: { fontSize: 13, color: Colors.textSecondary, marginLeft: 4 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },

    cardBody: { marginBottom: 16 },
    detailRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
    label: { fontSize: 13, fontWeight: '600', color: Colors.text, width: 80 },
    detailText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },

    cardFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    footerText: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },

    actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    approveButton: { backgroundColor: Colors.primary },
    rejectButton: { backgroundColor: Colors.error },
    buttonText: { color: Colors.white, fontWeight: '700' },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { textAlign: 'center', marginTop: 16, fontSize: 16, color: Colors.textSecondary },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: Spacing.m },
    modalContent: { backgroundColor: Colors.white, borderRadius: 24, padding: Spacing.l, elevation: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
    reasonInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        textAlignVertical: 'top',
        marginBottom: 24,
        fontSize: 15,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, alignItems: 'center' },
    cancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 16 },
    modalConfirm: { backgroundColor: Colors.error, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    confirmText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 }
});
