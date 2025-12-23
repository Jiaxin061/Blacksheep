import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdminRegisterDetailScreen() {
  const { volunteerId } = useLocalSearchParams();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  // Mock data - replace with actual database query later
  const volunteer = {
    id: volunteerId,
    name: 'John Doe',
    location: 'Skudai, Johor',
    experience: 'I have been volunteering at animal shelters for over 2 years. During this time, I have helped with feeding, cleaning, and socializing rescued animals. I also participated in several rescue operations for stray dogs in my neighborhood.',
    capability: 'Animal feeding, transportation, basic first aid for animals, social media promotion, event organization',
    status: 'pending',
    submittedDate: '2025-11-15',
  };

  const handleBack = () => {
    router.back();
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Application',
      `Are you sure you want to approve ${volunteer.name}'s volunteer registration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            // TODO: Update database status to 'approved'
            console.log('Approved volunteer:', volunteerId);
            Alert.alert('Success', 'Volunteer application approved!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleReject = () => {
    setShowRejectionInput(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection');
      return;
    }

    Alert.alert(
      'Reject Application',
      `Are you sure you want to reject ${volunteer.name}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // TODO: Update database status to 'rejected' with reason
            console.log('Rejected volunteer:', volunteerId, 'Reason:', rejectionReason);
            Alert.alert('Rejected', 'Volunteer application has been rejected', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Registration Details</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(volunteer.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(volunteer.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(volunteer.status) }]}>
            Status: {volunteer.status.toUpperCase()}
          </Text>
        </View>

        {/* Volunteer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name:</Text>
              <Text style={styles.infoValue}>{volunteer.name}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{volunteer.location}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted:</Text>
              <Text style={styles.infoValue}>{volunteer.submittedDate}</Text>
            </View>
          </View>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.textCard}>
            <Text style={styles.textContent}>{volunteer.experience}</Text>
          </View>
        </View>

        {/* Capabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capabilities</Text>
          <View style={styles.textCard}>
            <Text style={styles.textContent}>{volunteer.capability}</Text>
          </View>
        </View>

        {/* Rejection Reason Input */}
        {showRejectionInput && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejection Reason *</Text>
            <TextInput
              style={styles.rejectionInput}
              placeholder="Please provide a reason for rejection..."
              placeholderTextColor="#999"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Action Buttons */}
        {volunteer.status === 'pending' && (
          <View style={styles.actionButtons}>
            {!showRejectionInput ? (
              <>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rejectButtonText}>✘ Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={handleApprove}
                  activeOpacity={0.8}
                >
                  <Text style={styles.approveButtonText}>✓ Approve</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowRejectionInput(false);
                    setRejectionReason('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmRejectButton}
                  onPress={confirmReject}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmRejectButtonText}>Confirm Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {volunteer.status === 'approved' && (
          <View style={styles.statusMessage}>
            <Text style={styles.statusMessageIcon}>✅</Text>
            <Text style={styles.statusMessageText}>This application has been approved</Text>
          </View>
        )}

        {volunteer.status === 'rejected' && (
          <View style={[styles.statusMessage, { backgroundColor: '#ffebee' }]}>
            <Text style={styles.statusMessageIcon}>❌</Text>
            <Text style={[styles.statusMessageText, { color: '#f44336' }]}>
              This application has been rejected
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  textCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  rejectionInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f44336',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#333',
    height: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmRejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmRejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  statusMessageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusMessageText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4caf50',
  },
});