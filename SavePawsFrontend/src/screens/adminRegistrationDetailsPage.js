import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import ApiService from '../services/api';

const Colors = {
    primary: '#14b8a6',
    secondary: '#0f766e',
    background: '#f9fafb',
    white: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    pendingBg: '#fef3c7',
    pendingText: '#d97706',
    approvedBg: '#dcfce7',
    approvedText: '#15803d',
    rejectedBg: '#fee2e2',
    rejectedText: '#b91c1c',
};

const Spacing = {
    s: 8,
    m: 16,
    l: 24,
};

const BorderRadius = {
    s: 4,
    m: 12,
    l: 16,
};

export default function AdminRegistrationDetailsPage() {
    const navigation = useNavigation();
    const route = useRoute();
    const { registration } = route.params || {};
    const [loading, setLoading] = useState(false);

    const [regData, setRegData] = useState(null);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [rejectedResultModalVisible, setRejectedResultModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (registration) {
            try {
                setRegData(JSON.parse(registration));
            } catch (e) {
                console.error("Failed to parse registration data", e);
            }
        }
    }, [registration]);

    if (!regData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const handleApprove = async () => {
        setLoading(true);
        try {
            const success = await ApiService.approveRegistration(regData.registrationID);
            if (success) {
                setApproveModalVisible(false);
                setSuccessModalVisible(true);
            } else {
                Alert.alert('Error', 'Failed to approve volunteer');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred during approval');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            Alert.alert('Error', 'Please provide a rejection reason');
            return;
        }
        setLoading(true);
        try {
            const success = await ApiService.rejectRegistration(regData.registrationID, rejectionReason);
            if (success) {
                setRejectModalVisible(false);
                setRejectedResultModalVisible(true);
            } else {
                Alert.alert('Error', 'Failed to reject volunteer');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred during rejection');
        } finally {
            setLoading(false);
        }
    };

    const statusStyle = regData.registration_status === 'Pending'
        ? { bg: Colors.pendingBg, text: Colors.pendingText }
        : regData.registration_status === 'Approved'
            ? { bg: Colors.approvedBg, text: Colors.approvedText }
            : { bg: Colors.rejectedBg, text: Colors.rejectedText };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Registration Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: Colors.background }}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: statusStyle.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                    <Text style={[styles.statusLabel, { color: statusStyle.text }]}>
                        Status: {regData.registration_status.toUpperCase()}
                    </Text>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Full Name:</Text>
                            <Text style={styles.infoValue}>{regData.userName || `${regData.first_name} ${regData.last_name}`}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Location:</Text>
                            <Text style={styles.infoValue}>{regData.location || 'Not specified'}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Submitted:</Text>
                            <Text style={styles.infoValue}>{new Date(regData.submition_date).toISOString().split('T')[0]}</Text>
                        </View>
                    </View>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    <View style={styles.textBox}>
                        <Text style={styles.textBody}>{regData.experience || 'No experience details provided.'}</Text>
                    </View>
                </View>

                {/* Capabilities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Capabilities</Text>
                    <View style={styles.textBox}>
                        <Text style={styles.textBody}>{regData.capability || 'No capability details provided.'}</Text>
                    </View>
                </View>

                {/* Actions (Only if Pending) */}
                {regData.registration_status === 'Pending' && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => setRejectModalVisible(true)}>
                            <Ionicons name="close" size={20} color={Colors.white} />
                            <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => setApproveModalVisible(true)}>
                            <Ionicons name="checkmark" size={20} color={Colors.white} />
                            <Text style={styles.btnText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Approval Confirmation Modal */}
            <Modal visible={approveModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Approve Application</Text>
                        <Text style={styles.modalSubtitle}>
                            Are you sure you want to approve {regData.userName || regData.first_name}'s volunteer registration?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setApproveModalVisible(false)}>
                                <Text style={styles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmApprove} onPress={handleApprove}>
                                <Text style={styles.confirmTextApprove}>APPROVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Result Modal */}
            <Modal visible={successModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalSubtitle}>Volunteer application approved!</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalConfirmApprove} onPress={() => {
                                setSuccessModalVisible(false);
                                navigation.goBack();
                            }}>
                                <Text style={styles.confirmTextApprove}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Reject Reason Modal */}
            <Modal visible={rejectModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rejection Reason *</Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Reason for rejection..."
                            multiline
                            numberOfLines={4}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            autoFocus
                        />
                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity style={styles.cancelBtnOutline} onPress={() => setRejectModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmRejectBtn} onPress={handleReject}>
                                <Text style={styles.confirmRejectText}>Confirm Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Rejected Result Modal */}
            <Modal visible={rejectedResultModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rejected</Text>
                        <Text style={styles.modalSubtitle}>Volunteer application has been rejected</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalConfirmApprove} onPress={() => {
                                setRejectedResultModalVisible(false);
                                navigation.goBack();
                            }}>
                                <Text style={styles.confirmTextApprove}>OK</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: 16,
        backgroundColor: Colors.primary
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
    scrollContent: { padding: Spacing.m },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: BorderRadius.m,
        marginBottom: Spacing.l,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    statusLabel: { fontSize: 16, fontWeight: 'bold' },

    section: { marginBottom: Spacing.l },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
    infoCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.m,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoRow: { flexDirection: 'row', paddingVertical: 12 },
    infoLabel: { fontSize: 14, color: Colors.textSecondary, width: 100 },
    infoValue: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 1 },
    infoDivider: { height: 1, backgroundColor: '#f1f5f9' },

    textBox: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.m,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 100,
    },
    textBody: { fontSize: 14, color: Colors.text, lineHeight: 22 },

    actionRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: BorderRadius.m,
        gap: 8,
    },
    rejectBtn: { backgroundColor: '#d94b3e' },
    approveBtn: { backgroundColor: '#69a85c' },
    btnText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.m },
    modalContent: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
    modalSubtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 },
    modalCancel: { padding: 4 },
    cancelText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14 },
    modalConfirmApprove: { padding: 4 },
    confirmTextApprove: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14 },

    reasonInput: {
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: 8,
        padding: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        fontSize: 15,
        marginBottom: 24,
    },
    modalActionsRow: { flexDirection: 'row', gap: 12 },
    cancelBtnOutline: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
    confirmRejectBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#d94b3e',
        alignItems: 'center',
    },
    confirmRejectText: { color: Colors.white, fontWeight: 'bold' },
});
