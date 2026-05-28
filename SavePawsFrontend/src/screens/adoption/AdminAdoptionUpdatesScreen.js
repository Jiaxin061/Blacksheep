import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { adoptionService } from '../services/adoptionService';
// Note: Depending on file structure, if adoptionService is in separate file, import correctly.
// Based on previous step, it seems adoptionService might be in `src/features/adoption/services/adoptionService.js`.
// But in AdoptionFollowUpScreen I imported from `../../services/api` because I thought it was there.
// I will adjust imports after checking where adoptionService actually is.
// For now, assuming it will be exported from `adoptionService.js` and maybe re-exported or used directly.

export default function AdminAdoptionUpdatesScreen({ navigation }) {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('pending'); // 'pending' | 'reviewed' | 'all'

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUpdate, setSelectedUpdate] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [reviewStatus, setReviewStatus] = useState('satisfactory');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUpdates();
    }, [filter]);

    const fetchUpdates = async () => {
        try {
            setLoading(true);
            // Construct filter params
            const filters = {};
            if (filter === 'pending') filters.status = 'pending';
            // For reviewed, we might need custom logic or backend support for "not pending"
            // or just fetch all and filter client side if backend doesn't support complex filters

            const response = await adoptionService.getAdoptionUpdates(filters);
            if (response.success) {
                let data = response.data;
                if (filter === 'reviewed') {
                    data = data.filter(u => u.review_status !== 'pending');
                }
                setUpdates(data);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
            Alert.alert('Error', 'Failed to fetch updates');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewPress = (update) => {
        setSelectedUpdate(update);
        setAdminNotes(update.admin_notes || '');
        setReviewStatus(update.review_status === 'pending' ? 'satisfactory' : update.review_status);
        setModalVisible(true);
    };

    const submitReview = async () => {
        try {
            setSubmitting(true);
            await adoptionService.reviewAdoptionUpdate(
                selectedUpdate.review_id,
                reviewStatus,
                adminNotes
            );

            Alert.alert('Success', 'Update reviewed successfully');
            setModalVisible(false);
            fetchUpdates(); // Refresh list
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'satisfactory': return '#4CAF50';
            case 'needs_visit': return '#F44336';
            default: return '#FF9800';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'reviewed' && styles.filterBtnActive]}
                    onPress={() => setFilter('reviewed')}
                >
                    <Text style={[styles.filterText, filter === 'reviewed' && styles.filterTextActive]}>Reviewed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
            ) : (
                <ScrollView style={styles.list}>
                    {updates.length === 0 ? (
                        <Text style={styles.emptyText}>No updates found.</Text>
                    ) : (
                        updates.map((update) => (
                            <TouchableOpacity
                                key={update.review_id}
                                style={styles.card}
                                onPress={() => handleReviewPress(update)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.petName}>{update.animal_name} ({update.species})</Text>
                                    <View style={[styles.badge, { backgroundColor: getStatusColor(update.review_status) }]}>
                                        <Text style={styles.badgeText}>{update.review_status.replace('_', ' ').toUpperCase()}</Text>
                                    </View>
                                </View>

                                <Text style={styles.userText}>By: {update.first_name} {update.last_name}</Text>
                                <Text style={styles.dateText}>Date: {new Date(update.update_date).toLocaleDateString()}</Text>

                                <Text style={styles.sectionHeader}>Health Status:</Text>
                                <Text style={styles.bodyText}>{update.health_status}</Text>

                                <Text style={styles.sectionHeader}>Description:</Text>
                                <Text numberOfLines={2} style={styles.bodyText}>{update.description}</Text>

                                {update.photo_url && (
                                    <Text style={styles.photoIndicator}>📷 Has Photo</Text>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Review Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Review Update</Text>

                        {selectedUpdate && (
                            <ScrollView style={{ maxHeight: 400 }}>
                                <Text style={styles.modalLabel}>Pet:</Text>
                                <Text style={styles.modalValue}>{selectedUpdate.animal_name}</Text>

                                <Text style={styles.modalLabel}>Description:</Text>
                                <Text style={styles.modalValue}>{selectedUpdate.description}</Text>

                                {selectedUpdate.photo_url && (
                                    <Image
                                        source={{ uri: `http://localhost:3000${selectedUpdate.photo_url}` }}
                                        style={styles.modalImage}
                                    />
                                )}

                                <Text style={styles.modalLabel}>Decision:</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity
                                        style={[styles.radioBtn, reviewStatus === 'satisfactory' && styles.radioBtnSelected]}
                                        onPress={() => setReviewStatus('satisfactory')}
                                    >
                                        <Text style={[styles.radioText, reviewStatus === 'satisfactory' && styles.radioTextSelected]}>Satisfactory</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.radioBtn, reviewStatus === 'needs_visit' && styles.radioBtnSelected, { borderColor: '#F44336' }]}
                                        onPress={() => setReviewStatus('needs_visit')}
                                    >
                                        <Text style={[styles.radioText, reviewStatus === 'needs_visit' && { color: '#F44336' }]}>Needs Visit</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.modalLabel}>Admin Notes:</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    value={adminNotes}
                                    onChangeText={setAdminNotes}
                                    placeholder="Add internal notes or feedback..."
                                    multiline
                                />
                            </ScrollView>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={submitReview}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
    },
    filterBtnActive: {
        backgroundColor: '#2196F3',
    },
    filterText: {
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    list: {
        padding: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    petName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    userText: {
        fontSize: 12,
        color: '#666',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
    },
    bodyText: {
        fontSize: 14,
        color: '#444',
    },
    photoIndicator: {
        fontSize: 12,
        color: '#2196F3',
        marginTop: 5,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalLabel: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 4,
        color: '#333',
    },
    modalValue: {
        fontSize: 14,
        color: '#555',
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 10,
        resizeMode: 'contain',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    radioBtn: {
        flex: 0.48,
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    radioBtnSelected: {
        backgroundColor: '#E8F5E9', // Lighter green
        borderWidth: 2,
    },
    radioText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    radioTextSelected: {
        fontWeight: 'bold',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        height: 80,
        textAlignVertical: 'top',
        marginTop: 5,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 10,
    },
    cancelBtn: {
        padding: 10,
    },
    cancelBtnText: {
        color: '#666',
    },
    saveBtn: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
