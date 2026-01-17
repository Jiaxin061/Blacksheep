import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import adoptionService from '../services/adoptionService';

export default function AdminAdoptionDetailScreen({ route, navigation }) {
  const { requestId } = route.params || {};
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setError(null);
      const response = await adoptionService.getRequestById(requestId);

      if (response.success) {
        setRequest(response.data);
      } else {
        setError(response.message || 'Adoption request not found');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error retrieving adoption request';
      setError(errorMessage);
      console.error('Error loading adoption request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Adoption Request',
      `Are you sure you want to approve this adoption request? This will:
      
• Approve the request
• Mark the animal as "adopted"
• Reject all other pending requests for this animal`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              const response = await adoptionService.updateRequestStatus(requestId, 'approved');

              if (response.success) {
                Alert.alert(
                  'Success',
                  'Adoption request approved successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                throw new Error(response.message || 'Failed to approve request');
              }
            } catch (error) {
              console.error('Error approving request:', error);
              Alert.alert(
                'Error',
                error.message || 'An error occurred while approving the request. Please try again.'
              );
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Validation Error', 'Please provide a reason for rejection.');
      return;
    }

    setRejectModalVisible(false);
    setProcessing(true);

    try {
      const response = await adoptionService.updateRequestStatus(
        requestId,
        'rejected',
        rejectionReason.trim()
      );

      if (response.success) {
        Alert.alert(
          'Success',
          'Adoption request rejected successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setRejectionReason('');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred while rejecting the request. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading adoption request details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Adoption request not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.requestDate}>
            Requested: {new Date(request.request_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Animal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animal Information</Text>
          <InfoRow label="Name" value={request.animal_name} />
          <InfoRow label="Species" value={request.species} />
          <InfoRow label="Breed" value={request.breed} />
          {request.age !== null && <InfoRow label="Age" value={`${request.age} years`} />}
          <InfoRow label="Gender" value={request.gender} />
          <InfoRow label="Current Status" value={request.animal_status} />
        </View>

        {/* Applicant Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          <InfoRow
            label="Name"
            value={`${request.first_name} ${request.last_name}`}
          />
          <InfoRow label="Email" value={request.email} />
          {request.phone_number && (
            <InfoRow label="Phone" value={request.phone_number} />
          )}
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Request Details</Text>
          <View style={styles.textBlock}>
            <Text style={styles.textBlockLabel}>Adoption Reason:</Text>
            <Text style={styles.textBlockContent}>{request.adoption_reason}</Text>
          </View>
          <InfoRow label="Housing Type" value={request.housing_type} />
        </View>

        {/* Rejection Reason (if rejected) */}
        {request.status === 'rejected' && request.rejection_reason && (
          <View style={[styles.section, styles.rejectionSection]}>
            <Text style={styles.sectionTitle}>Rejection Reason</Text>
            <Text style={styles.rejectionText}>{request.rejection_reason}</Text>
          </View>
        )}

        {/* Action Buttons (only for pending requests) */}
        {request.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Approve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={processing}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Adoption Request</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this request:
            </Text>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmReject}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirm Reject</Text>
                )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  rejectionSection: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  textBlock: {
    marginBottom: 16,
  },
  textBlockLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  textBlockContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  rejectionText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#9E9E9E',
  },
  modalConfirmButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


