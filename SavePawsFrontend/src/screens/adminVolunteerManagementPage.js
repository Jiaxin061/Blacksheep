import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import {
    Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput,
    TouchableOpacity, View, SafeAreaView, StatusBar, Image, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';

// Theme constants
const Colors = {
    primary: '#14b8a6',
    secondary: '#0f766e',
    background: '#f0fdfa',
    white: '#ffffff',
    text: '#111827',
    textSecondary: '#5b6b7c',
    border: '#e2e8ef',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
};

const Spacing = {
    s: 8,
    m: 16,
    l: 24,
};

const BorderRadius = {
    s: 4,
    m: 8,
    l: 16,
};

export default function AdminVolunteerManagementPage() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('Events'); // 'Events' or 'Registrations'

    // --- Shared Refresh State ---
    const [refreshing, setRefreshing] = useState(false);

    // --- Events State ---
    const [events, setEvents] = useState([]);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Event Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [maxVolunteers, setMaxVolunteers] = useState('');
    const [hours, setHours] = useState('');
    const [image, setImage] = useState(null);

    // --- Registrations State ---
    const [registrations, setRegistrations] = useState([]);
    const [selectedReg, setSelectedReg] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            if (activeTab === 'Events') {
                const data = await ApiService.getAdminEvents();
                setEvents(data);
            } else {
                const data = await ApiService.getAdminRegistrations();
                setRegistrations(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // --- Event Logic ---
    const resetEventForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setDate(new Date());
        setStartTime(new Date());
        setEndTime(new Date());
        setMaxVolunteers('');
        setHours('0');
        setImage(null);
        setIsEditing(false);
        setSelectedEventId(null);
    };

    const handleSaveEvent = async () => {
        if (!title || !description || !location || !maxVolunteers || !hours) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const combinedStart = new Date(date);
            combinedStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

            const combinedEnd = new Date(date);
            combinedEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

            const eventData = {
                title,
                description,
                location,
                start_date: combinedStart.toISOString().slice(0, 19).replace('T', ' '),
                end_date: combinedEnd.toISOString().slice(0, 19).replace('T', ' '),
                max_volunteers: parseInt(maxVolunteers, 10),
                hours: parseFloat(hours),
                image_url: image
            };

            const success = isEditing
                ? await ApiService.updateAdminEvent(selectedEventId, eventData)
                : await ApiService.createAdminEvent(eventData);

            if (success) {
                Alert.alert('Success', `Event ${isEditing ? 'updated' : 'created'} successfully`);
                setEventModalVisible(false);
                resetEventForm();
                fetchData();
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while saving: ' + error.message);
        }
    };

    const handleDeleteEvent = (id) => {
        Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm', style: 'destructive',
                onPress: async () => {
                    const success = await ApiService.deleteAdminEvent(id);
                    if (success) {
                        fetchData();
                    }
                }
            }
        ]);
    };

    const handleEditEvent = (event) => {
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.eventLocation);
        const dateObj = event.start_date ? new Date(event.start_date) : new Date();
        const startObj = event.start_date ? new Date(event.start_date) : dateObj;
        const endObj = event.end_date ? new Date(event.end_date) : dateObj;
        setDate(dateObj);
        setStartTime(startObj);
        setEndTime(endObj);
        setMaxVolunteers(event.max_volunteers ? event.max_volunteers.toString() : '');
        setHours(event.hours ? event.hours.toString() : '');
        setImage(event.image_url);
        setIsEditing(true);
        setSelectedEventId(event.eventID);
        setEventModalVisible(true);
    };

    // --- Registration Logic ---
    const stats = useMemo(() => {
        const counts = { Pending: 0, Approved: 0, Rejected: 0, Total: registrations.length };
        registrations.forEach(r => {
            if (counts[r.registration_status] !== undefined) {
                counts[r.registration_status]++;
            }
        });
        return counts;
    }, [registrations]);

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(r => {
            const matchesFilter = filterStatus === 'All' || r.registration_status === filterStatus;
            const fullName = `${r.first_name || ''} ${r.last_name || ''} ${r.userName || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        });
    }, [registrations, filterStatus, searchQuery]);

    const handleApproveReg = (reg) => {
        Alert.alert('Approve Volunteer', `Approve ${reg.userName || reg.first_name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: async () => {
                    const success = await ApiService.approveRegistration(reg.registrationID);
                    if (success) {
                        Alert.alert('Success', 'Volunteer approved');
                        fetchData();
                    }
                }
            }
        ]);
    };

    const handleRejectReg = (reg) => {
        setSelectedReg(reg);
        setRejectModalVisible(true);
    };

    const handleConfirmRejectReg = async () => {
        if (!rejectionReason) {
            Alert.alert('Error', 'Please provide a reason');
            return;
        }
        const success = await ApiService.rejectRegistration(selectedReg.registrationID, rejectionReason);
        if (success) {
            setRejectModalVisible(false);
            setRejectionReason('');
            fetchData();
        }
    };

    // --- Render Helpers ---
    const renderEventItem = ({ item }) => (
        <View style={styles.eventCard}>
            <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.detail}>📍 {item.eventLocation}</Text>
                <Text style={styles.detail}>📅 {new Date(item.start_date).toDateString()}</Text>
                <Text style={styles.detail}>⏱️ {parseFloat(item.hours)} Hours</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditEvent(item)} style={styles.iconButton}>
                    <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.eventID)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRegItem = ({ item }) => (
        <TouchableOpacity
            style={styles.regCard}
            onPress={() => navigation.navigate('AdminRegistrationDetails', { registration: JSON.stringify(item) })}
        >
            <View style={styles.regCardHeader}>
                <Text style={styles.userName}>{item.userName || `${item.first_name} ${item.last_name}`}</Text>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.registration_status === 'Pending' ? '#fde68a' :
                        item.registration_status === 'Approved' ? '#bbf7d0' : '#fecaca'
                }]}>
                    <Text style={[styles.statusTabText, {
                        color: item.registration_status === 'Pending' ? '#92400e' :
                            item.registration_status === 'Approved' ? '#166534' : '#991b1b'
                    }]}>
                        {item.registration_status}
                    </Text>
                </View>
            </View>
            <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={12} color={Colors.error} />
                <Text style={styles.locationText}>{item.location}</Text>
            </View>
            {item.registration_status === 'Pending' && (
                <View style={styles.regActions}>
                    <TouchableOpacity style={[styles.regBtn, styles.approveBtn]} onPress={() => handleApproveReg(item)}>
                        <Text style={styles.regBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.regBtn, styles.rejectBtn]} onPress={() => handleRejectReg(item)}>
                        <Text style={styles.regBtnText}>Reject</Text>
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Volunteer Management</Text>
                {activeTab === 'Events' ? (
                    <TouchableOpacity style={styles.addButton} onPress={() => { resetEventForm(); setEventModalVisible(true); }}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 24 }} />}
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Events' && styles.activeTab]}
                    onPress={() => setActiveTab('Events')}
                >
                    <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Registrations' && styles.activeTab]}
                    onPress={() => setActiveTab('Registrations')}
                >
                    <Text style={[styles.tabText, activeTab === 'Registrations' && styles.activeTabText]}>Applications</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                {activeTab === 'Registrations' && (
                    <View style={styles.regHeader}>
                        {/* Registration Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Text style={[styles.statNumber, { color: Colors.warning }]}>{stats.Pending}</Text>
                                <Text style={styles.statLabel}>Pending</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.Approved}</Text>
                                <Text style={styles.statLabel}>Approved</Text>
                            </View>
                        </View>
                        {/* Search Bar */}
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={Colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search applicants..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>
                )}

                <FlatList
                    data={activeTab === 'Events' ? events : filteredRegistrations}
                    renderItem={activeTab === 'Events' ? renderEventItem : renderRegItem}
                    keyExtractor={(item) => (activeTab === 'Events' ? item.eventID : item.registrationID).toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
                />
            </View>

            {/* Event Modal (Simplified placeholder, used for adding/editing) */}
            <Modal visible={eventModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditing ? 'Edit Event' : 'New Event'}</Text>
                        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
                        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
                        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
                        <TextInput style={styles.input} placeholder="Max Volunteers" value={maxVolunteers} onChangeText={setMaxVolunteers} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Hours" value={hours} onChangeText={setHours} keyboardType="numeric" />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEventModalVisible(false)} style={styles.cancelButton}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveEvent} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Reject Modal */}
            <Modal visible={rejectModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Application</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Reason..."
                            multiline
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={styles.cancelButton}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirmRejectReg} style={[styles.saveButton, { backgroundColor: Colors.error }]}>
                                <Text style={styles.saveButtonText}>Confirm</Text>
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
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.m, paddingVertical: 16, backgroundColor: Colors.primary
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
    addButton: { backgroundColor: 'rgba(255, 255, 255, 0.43)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.m },
    addButtonText: { color: Colors.white, fontWeight: '600' },
    tabContainer: {
        flexDirection: 'row', backgroundColor: Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: Colors.primary },
    tabText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
    activeTabText: { color: Colors.primary },
    listContent: { padding: Spacing.m, paddingBottom: 100 },
    eventCard: {
        flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.m,
        padding: Spacing.m, marginBottom: Spacing.m, elevation: 2
    },
    cardContent: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    detail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
    actionButtons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    iconButton: { padding: 4 },
    iconText: { fontSize: 20 },
    regHeader: { padding: Spacing.m, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
    statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    statCard: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: Colors.textSecondary },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, height: 40 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    regCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.m, padding: Spacing.m, marginBottom: Spacing.m, elevation: 1 },
    regCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    userName: { fontSize: 16, fontWeight: '700', color: Colors.text },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusTabText: { fontSize: 10, fontWeight: 'bold' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    locationText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
    regActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    regBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
    approveBtn: { backgroundColor: Colors.primary },
    rejectBtn: { backgroundColor: Colors.error },
    regBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.m },
    modalContent: { backgroundColor: Colors.white, borderRadius: BorderRadius.l, padding: Spacing.l },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.m },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 6, padding: 10, marginBottom: Spacing.m, backgroundColor: '#f8fafc' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelButton: { padding: 10 },
    saveButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
    saveButtonText: { color: Colors.white, fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary }
});
