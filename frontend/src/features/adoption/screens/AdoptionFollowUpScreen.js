import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { adoptionService } from '../services/adoptionService';

export default function AdoptionFollowUpScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [myAdoptions, setMyAdoptions] = useState([]);
    const [selectedAdoption, setSelectedAdoption] = useState(null);

    // Form State
    const [healthStatus, setHealthStatus] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Previous Updates State
    const [previousUpdates, setPreviousUpdates] = useState([]);
    const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'history'

    useEffect(() => {
        fetchMyAdoptions();
        fetchMyUpdates();
    }, []);

    const fetchMyAdoptions = async () => {
        try {
            setLoading(true);
            const response = await adoptionService.getMyRequests();
            if (response.success) {
                // Filter only approved adoptions
                const approved = response.data.filter(req => req.status === 'approved' || req.status === 'adopted');
                // Note: backend might return status 'approved' for request, animal status 'adopted'.
                // Let's filter by request status 'approved'.
                const approvedRequests = response.data.filter(req => req.status === 'approved');
                setMyAdoptions(approvedRequests);
            }
        } catch (error) {
            console.error('Error fetching adoptions:', error);
            Alert.alert('Error', 'Failed to load your adoptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyUpdates = async () => {
        try {
            const response = await adoptionService.getMyAdoptionUpdates();
            if (response.success) {
                setPreviousUpdates(response.data);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    };

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need camera roll permissions to upload photos!');
            return;
        }

        let result = await ImagePicker.launchImagePickerAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAdoption) {
            Alert.alert('Required', 'Please select an adopted pet');
            return;
        }
        if (!healthStatus.trim() || !description.trim()) {
            Alert.alert('Required', 'Please fill in health status and description');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('adoption_request_id', selectedAdoption.id);
            formData.append('health_status', healthStatus);
            formData.append('description', description);

            if (image) {
                // Append image
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('photo', {
                    uri: image,
                    name: filename,
                    type: type,
                });
            }

            await adoptionService.uploadAdoptionUpdate(formData);

            Alert.alert('Success', 'Update submitted successfully!');

            // Reset form
            setHealthStatus('');
            setDescription('');
            setImage(null);
            setSelectedAdoption(null);

            // Refresh list
            fetchMyUpdates();
            setActiveTab('history');

        } catch (error) {
            console.error('Error submitting update:', error);
            Alert.alert('Error', 'Failed to submit update');
        } finally {
            setSubmitting(false);
        }
    };

    const renderSubmitTab = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Select Adopted Pet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                {myAdoptions.length > 0 ? (
                    myAdoptions.map((adoption) => (
                        <TouchableOpacity
                            key={adoption.id}
                            style={[
                                styles.petCard,
                                selectedAdoption?.id === adoption.id && styles.petCardSelected
                            ]}
                            onPress={() => setSelectedAdoption(adoption)}
                        >
                            <Image
                                source={adoption.image_url ? { uri: adoption.image_url } : require('../../../../assets/image.png')}
                                style={styles.petThumbnail}
                            />
                            <Text style={[
                                styles.petName,
                                selectedAdoption?.id === adoption.id && styles.petNameSelected
                            ]}>
                                {adoption.animal_name}
                            </Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noPetsContainer}>
                        <Text style={styles.noPetsText}>You haven't adopted any pets yet.</Text>
                    </View>
                )}
            </ScrollView>

            {selectedAdoption && (
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Health Status</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Healthy, Recovering, Needs Checkup"
                        value={healthStatus}
                        onChangeText={setHealthStatus}
                    />

                    <Text style={styles.label}>Progress Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="How is your pet doing? Any new tricks?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Photo Update (Optional)</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Update</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'satisfactory': return '#4CAF50';
            case 'needs_visit': return '#F44336';
            default: return '#FF9800'; // pending
        }
    };

    const renderHistoryTab = () => (
        <ScrollView style={styles.tabContent}>
            {previousUpdates.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No updates submitted yet.</Text>
                </View>
            ) : (
                previousUpdates.map((update) => (
                    <View key={update.review_id} style={styles.updateCard}>
                        <View style={styles.updateHeader}>
                            <Text style={styles.updatePetName}>{update.animal_name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(update.review_status) }]}>
                                <Text style={styles.statusText}>{update.review_status.replace('_', ' ').toUpperCase()}</Text>
                            </View>
                        </View>

                        <Text style={styles.updateDate}>{new Date(update.update_date).toLocaleDateString()}</Text>

                        <Text style={styles.updateLabel}>Health: <Text style={styles.updateValue}>{update.health_status}</Text></Text>
                        <Text style={styles.updateLabel}>Note: <Text style={styles.updateValue}>{update.description}</Text></Text>

                        {update.photo_url && (
                            <Image
                                // Fix: Assuming backend serves uploads at root URL + photo_url path or if full URL stored
                                // Backend controller stores: `/uploads/filename`
                                // Frontend needs to prepend base URL if it's relative.
                                // For expo, we need full URL.
                                // Assuming api.js or global config holds base URL. 
                                // For now, I'll use a placeholder logic or assume absolute if not localhost.
                                // Since user is local, I'll assume standard localhost:3000
                                source={{ uri: `http://localhost:3000${update.photo_url}` }}
                                style={styles.updateImage}
                            />
                        )}

                        {update.admin_notes && (
                            <View style={styles.adminNote}>
                                <Text style={styles.adminNoteLabel}>Admin Feedback:</Text>
                                <Text style={styles.adminNoteText}>{update.admin_notes}</Text>
                            </View>
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#E91E63', '#C2185B']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Adoption Follow-up</Text>
                <Text style={styles.headerSubtitle}>Keep us updated on your furry friend!</Text>
            </LinearGradient>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'submit' && styles.activeTab]}
                    onPress={() => setActiveTab('submit')}
                >
                    <Text style={[styles.tabText, activeTab === 'submit' && styles.activeTabText]}>Submit Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>My Updates</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E91E63" />
                </View>
            ) : (
                activeTab === 'submit' ? renderSubmitTab() : renderHistoryTab()
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 5,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginTop: 10,
        marginHorizontal: 15,
        borderRadius: 10,
        padding: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#FCE4EC',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#C2185B',
    },
    tabContent: {
        flex: 1,
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    petSelector: {
        marginBottom: 20,
    },
    petCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginRight: 10,
        alignItems: 'center',
        width: 100,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    petCardSelected: {
        borderColor: '#E91E63',
        backgroundColor: '#FFF0F5',
    },
    petThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    petName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    petNameSelected: {
        color: '#C2185B',
    },
    noPetsContainer: {
        padding: 20,
        alignItems: 'center',
        width: '100%',
    },
    noPetsText: {
        color: '#888',
        fontStyle: 'italic',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imagePicker: {
        height: 150,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: 5,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 30,
        marginBottom: 5,
    },
    imagePlaceholderText: {
        color: '#888',
    },
    submitButton: {
        backgroundColor: '#E91E63',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 25,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyStateText: {
        color: '#999',
        fontSize: 16,
    },
    updateCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    updateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    updatePetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    updateDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    updateLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    updateValue: {
        color: '#333',
        fontWeight: '500',
    },
    updateImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
        resizeMode: 'cover',
    },
    adminNote: {
        marginTop: 10,
        backgroundColor: '#F3E5F5',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C27B0',
    },
    adminNoteLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7B1FA2',
        marginBottom: 2,
    },
    adminNoteText: {
        fontSize: 13,
        color: '#4A148C',
    }
});
