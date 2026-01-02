import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, StatusBar } from 'react-native';
import { useAdminEventController } from '../_controller/AdminEventController';

// Theme constants integrated for consistency
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

export default function AdminEventManagementPage() {
    const router = useRouter();
    const { getEvents, createEvent, updateEvent, deleteEvent, loading, error } = useAdminEventController();
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Event Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [maxVolunteers, setMaxVolunteers] = useState('');
    const [hours, setHours] = useState('');

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
        }
    }, [error]);

    const fetchData = async () => {
        const data = await getEvents();
        setEvents(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setDate(new Date());
        setMaxVolunteers('');
        setHours('');
        setIsEditing(false);
        setSelectedEventId(null);
    };

    const handleAddPress = () => {
        resetForm();
        setModalVisible(true);
    };

    const handleEditPress = (event) => {
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location);
        const dateObj = event.event_date ? new Date(event.event_date) : new Date();
        setDate(dateObj);
        setMaxVolunteers(event.max_volunteers ? event.max_volunteers.toString() : '');
        setHours(event.hours ? event.hours.toString() : '');

        setIsEditing(true);
        setSelectedEventId(event.eventID);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!title || !description || !location || !date || !maxVolunteers || !hours) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const eventData = {
                title,
                description,
                location,
                start_date: date.toISOString().slice(0, 19).replace('T', ' '),
                end_date: date.toISOString().slice(0, 19).replace('T', ' '),
                max_volunteers: parseInt(maxVolunteers, 10),
                hours: parseFloat(hours)
            };

            let success = false;
            if (isEditing && selectedEventId) {
                success = await updateEvent(selectedEventId, eventData);
            } else {
                success = await createEvent(eventData);
            }

            if (success) {
                Alert.alert('Success', isEditing ? 'Event updated' : 'Event created');
                setModalVisible(false);
                resetForm();
                fetchData();
            } else {
                Alert.alert('Error', isEditing ? 'Failed to update event' : 'Failed to create event');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while saving: ' + error.message);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                style: 'destructive',
                onPress: async () => {
                    const success = await deleteEvent(id);
                    if (success) fetchData();
                    else Alert.alert('Error', 'Failed to delete');
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.detail}>📍 {item.location}</Text>
                <Text style={styles.detail}>📅 {item.event_date ? new Date(item.event_date).toDateString() : 'No Date'}</Text>
                <Text style={styles.detail}>⏱️ {parseFloat(item.hours || 0)} Hours</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.iconButton}>
                    <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.eventID)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Events</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={(item) => item.eventID.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No event records</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditing ? 'Edit Event' : 'New Event'}</Text>
                        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
                        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
                        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                accentColor={Colors.primary}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                            />
                        )}

                        <TextInput style={styles.input} placeholder="Max Volunteers" value={maxVolunteers} onChangeText={setMaxVolunteers} keyboardType="numeric" />

                        <View style={styles.stepperContainer}>
                            <TextInput
                                style={[styles.stepperInput]}
                                placeholder="Hours"
                                value={hours}
                                onChangeText={setHours}
                                keyboardType="numeric"
                            />
                            <View style={styles.stepperButtons}>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => {
                                        const current = parseFloat(hours) || 0;
                                        setHours((current + 0.5).toString());
                                    }}
                                >
                                    <Ionicons name="chevron-up" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => {
                                        const current = parseFloat(hours) || 0;
                                        if (current >= 0.5) setHours((current - 0.5).toString());
                                        else setHours("0");
                                    }}
                                >
                                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: 16,
        backgroundColor: Colors.primary
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
    addButton: { backgroundColor: 'rgba(255, 255, 255, 0.43)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.m },
    addButtonText: { color: Colors.white, fontWeight: '600' },
    listContent: { padding: Spacing.m },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.m, padding: Spacing.m, marginBottom: Spacing.m, elevation: 2, paddingHorizontal: 16, paddingVertical: 20 },
    cardContent: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
    detail: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.m },
    modalContent: { backgroundColor: Colors.white, borderRadius: BorderRadius.l, padding: Spacing.l },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.m },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.s, padding: 10, marginBottom: Spacing.m },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: { padding: 10 },
    saveButton: { backgroundColor: Colors.primary, padding: 10, borderRadius: BorderRadius.s },
    saveButtonText: { color: Colors.white, fontWeight: '600' },
    actionButtons: { flexDirection: 'row', gap: 10 },
    iconButton: { padding: Spacing.s },
    iconText: { fontSize: 20 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: Colors.textSecondary },
    dateInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.s, padding: 10, marginBottom: Spacing.m },
    dateText: { fontSize: 16, color: Colors.text },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.s,
        marginBottom: Spacing.m,
        paddingRight: 8
    },
    stepperInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: Colors.text
    },
    stepperButtons: {
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 8
    },
    stepperButton: {
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
