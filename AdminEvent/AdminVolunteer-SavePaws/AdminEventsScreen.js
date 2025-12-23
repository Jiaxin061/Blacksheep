import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from './constants/theme';
import { useAdminEventController } from './src/controllers/useAdminEventController';

export default function AdminEventsScreen() {
    const router = useRouter();
    const { getEvents, createEvent, updateEvent, deleteEvent, loading, error } = useAdminEventController();
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Event Form State
    // Event Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [maxVolunteers, setMaxVolunteers] = useState('');

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
        setIsEditing(false);
        setSelectedEventId(null);
    };

    const handleAddPress = () => {
        console.log('Add button pressed');
        resetForm();
        setModalVisible(true);
    };

    const handleEditPress = (event) => {
        console.log('Edit button pressed for event:', event);
        try {
            setTitle(event.title);
            setDescription(event.description);
            setLocation(event.location);
            const dateObj = event.start_date ? new Date(event.start_date) : new Date();
            setDate(dateObj);
            setMaxVolunteers(event.max_volunteers ? event.max_volunteers.toString() : '');

            setIsEditing(true);
            setSelectedEventId(event.id);
            setModalVisible(true);
        } catch (error) {
            console.error('Error in handleEditPress:', error);
            Alert.alert('Error', 'Failed to load event details: ' + error.message);
        }
    };

    const handleSave = async () => {
        console.log('Save button pressed. State:', { title, description, location, date, maxVolunteers });
        if (!title || !description || !location || !date || !maxVolunteers) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const eventData = {
                title,
                description,
                location,
                start_date: date.toISOString(),
                end_date: date.toISOString(), // Simplified: same as start for now
                max_volunteers: parseInt(maxVolunteers, 10)
            };

            console.log('Saving event data:', eventData);

            let success = false;
            if (isEditing && selectedEventId) {
                console.log('Updating event ID:', selectedEventId);
                success = await updateEvent(selectedEventId, eventData);
            } else {
                console.log('Creating new event');
                success = await createEvent(eventData);
            }

            console.log('Operation success:', success);

            if (success) {
                Alert.alert('Success', isEditing ? 'Event updated' : 'Event created');
                setModalVisible(false);
                resetForm();
                fetchData();
            } else {
                Alert.alert('Error', isEditing ? 'Failed to update event' : 'Failed to create event');
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            Alert.alert('Error', 'An error occurred while saving: ' + error.message);
        }
    };

    const handleDelete = (id) => {
        console.log('Delete requested for ID:', id);
        Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                style: 'destructive',
                onPress: async () => {
                    console.log('Confirm delete for ID:', id);
                    const success = await deleteEvent(id);
                    console.log('Delete success:', success);
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
                <Text style={styles.detail}>📅 {item.start_date ? new Date(item.start_date).toDateString() : 'No Date'}</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.iconButton}>
                    <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ fontSize: 24, color: Colors.text }}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Events</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
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
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                            />
                        )}

                        <TextInput style={styles.input} placeholder="Max Volunteers" value={maxVolunteers} onChangeText={setMaxVolunteers} keyboardType="numeric" />

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.m, marginBottom: Spacing.m, marginTop: 20 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
    addButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.m },
    addButtonText: { color: Colors.white, fontWeight: '600' },
    listContent: { padding: Spacing.m },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.m, padding: Spacing.m, marginBottom: Spacing.m, elevation: 2, paddingHorizontal: 16, paddingVertical: 20 },
    cardContent: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
    detail: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    deleteButton: { padding: Spacing.s },
    deleteText: { fontSize: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.m },
    modalContent: { backgroundColor: Colors.white, borderRadius: BorderRadius.l, padding: Spacing.l },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.m },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.s, padding: 10, marginBottom: Spacing.m },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: { padding: 10 },
    saveButton: { backgroundColor: Colors.primary, padding: 10, borderRadius: BorderRadius.s },
    saveButtonText: { color: Colors.white, fontWeight: '600' },

    // New styles
    actionButtons: { flexDirection: 'row', gap: 10 },
    iconButton: { padding: Spacing.s },
    iconText: { fontSize: 20 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: Colors.textSecondary },
    dateInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.s, padding: 10, marginBottom: Spacing.m },
    dateText: { fontSize: 16, color: Colors.text }
});
