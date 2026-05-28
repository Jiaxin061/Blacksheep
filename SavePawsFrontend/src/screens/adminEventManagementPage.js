import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, StatusBar, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';

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
    const navigation = useNavigation();
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
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [maxVolunteers, setMaxVolunteers] = useState('');
    const [hours, setHours] = useState('');
    const [image, setImage] = useState(null);

    const fetchData = async () => {
        try {
            const data = await ApiService.getAdminEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
            Alert.alert('Error', 'Failed to load events');
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

    const resetForm = () => {
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

    // --- Time Sync Logic ---
    const updateEndTime = (start, h) => {
        if (!start || isNaN(parseFloat(h))) return;
        const durationMinutes = parseFloat(h) * 60;
        const newEnd = new Date(start.getTime() + durationMinutes * 60000);
        setEndTime(newEnd);
    };

    const updateHours = (start, end) => {
        if (!start || !end) return;
        const diffMs = end.getTime() - start.getTime();
        const h = diffMs / 3600000; // ms to hours
        setHours(h > 0 ? h.toFixed(1) : '0');
    };

    const handleStartTimeChange = (event, selectedDate) => {
        setShowStartTimePicker(false);
        if (selectedDate) {
            setStartTime(selectedDate);
            if (hours && hours !== '0') {
                updateEndTime(selectedDate, hours);
            } else {
                updateEndTime(selectedDate, '0');
            }
        }
    };

    const handleEndTimeChange = (event, selectedDate) => {
        setShowEndTimePicker(false);
        if (selectedDate) {
            setEndTime(selectedDate);
            updateHours(startTime, selectedDate);
        }
    };

    const handleHoursChange = (text) => {
        setHours(text);
        const h = parseFloat(text);
        if (!isNaN(h)) {
            updateEndTime(startTime, text);
        }
    };

    const incrementHours = () => {
        const current = parseFloat(hours) || 0;
        const newH = (current + 0.5).toString();
        setHours(newH);
        updateEndTime(startTime, newH);
    };

    const decrementHours = () => {
        const current = parseFloat(hours) || 0;
        if (current >= 0.5) {
            const newH = (current - 0.5).toString();
            setHours(newH);
            updateEndTime(startTime, newH);
        } else {
            setHours('0');
            updateEndTime(startTime, '0');
        }
    };

    const handleAddPress = () => {
        resetForm();
        setModalVisible(true);
    };

    const handleEditPress = (event) => {
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
        setModalVisible(true);
    };

    const handleSave = async () => {
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
                setModalVisible(false);
                resetForm();
                fetchData();
            } else {
                Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} event`);
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
                    const success = await ApiService.deleteAdminEvent(id);
                    if (success) {
                        Alert.alert('Success', 'Event deleted successfully');
                        fetchData();
                    } else {
                        Alert.alert('Error', 'Failed to delete event');
                    }
                }
            }
        ]);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.detail}>📍 {item.eventLocation}</Text>
                <Text style={styles.detail}>📅 {item.start_date ? new Date(item.start_date).toDateString() : 'No Date'}</Text>
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
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
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
                style={{ flex: 1, backgroundColor: Colors.background }}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditing ? 'Edit Event' : 'New Event'}</Text>

                        <View style={styles.imageSection}>
                            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
                                        <Text style={styles.imagePlaceholderText}>Select Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={styles.imageButtonsRow}>
                                <TouchableOpacity style={styles.imageOptionButton} onPress={pickImage}>
                                    <Ionicons name="images-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.imageOptionText}>Gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.imageOptionButton} onPress={takePhoto}>
                                    <Ionicons name="camera-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.imageOptionText}>Camera</Text>
                                </TouchableOpacity>
                                {image && (
                                    <TouchableOpacity
                                        style={[styles.imageOptionButton, { borderColor: Colors.error }]}
                                        onPress={() => setImage(null)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                        <Text style={[styles.imageOptionText, { color: Colors.error }]}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

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
                                display="spinner"
                                accentColor={Colors.primary}
                                textColor={Colors.primary}
                                positiveButton={{ label: 'OK', textColor: Colors.primary }}
                                negativeButton={{ label: 'Cancel' }}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                            />
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: Spacing.m }}>
                            <TouchableOpacity
                                style={[styles.dateInput, { flex: 1, marginBottom: 0 }]}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Text style={styles.label}>Start Time</Text>
                                <Text style={styles.dateText}>
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dateInput, { flex: 1, marginBottom: 0 }]}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Text style={styles.label}>End Time</Text>
                                <Text style={styles.dateText}>
                                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display="spinner"
                                is24Hour={false}
                                accentColor={Colors.primary}
                                textColor={Colors.primary}
                                positiveButton={{ label: 'OK', textColor: Colors.primary }}
                                negativeButton={{ label: 'Cancel' }}
                                onChange={handleStartTimeChange}
                            />
                        )}

                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                display="spinner"
                                is24Hour={false}
                                accentColor={Colors.primary}
                                textColor={Colors.primary}
                                positiveButton={{ label: 'OK', textColor: Colors.primary }}
                                negativeButton={{ label: 'Cancel' }}
                                onChange={handleEndTimeChange}
                            />
                        )}

                        <TextInput style={styles.input} placeholder="Max Volunteers" value={maxVolunteers} onChangeText={setMaxVolunteers} keyboardType="numeric" />

                        <Text style={styles.label}>Hours</Text>
                        <View style={styles.stepperContainer}>
                            <TextInput
                                style={[styles.stepperInput]}
                                placeholder="Hours"
                                value={hours}
                                onChangeText={handleHoursChange}
                                keyboardType="numeric"
                            />
                            <View style={styles.stepperButtons}>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={incrementHours}
                                >
                                    <Ionicons name="chevron-up" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={decrementHours}
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
    stepperButton: {
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageSection: {
        marginBottom: Spacing.m,
    },
    imagePickerContainer: {
        width: '100%',
        height: 180,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.m,
        marginBottom: Spacing.s,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    imagePlaceholder: {
        alignItems: 'center'
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: Colors.textSecondary,
        fontSize: 14
    },
    imageButtonsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    imageOptionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: BorderRadius.s,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    imageOptionText: {
        marginLeft: 6,
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    label: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4
    }
});
