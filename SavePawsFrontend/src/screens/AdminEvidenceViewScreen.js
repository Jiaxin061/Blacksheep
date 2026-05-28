import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants';
import ApiService from '../services/api';

const AdminEvidenceViewScreen = ({ navigation, route }) => {
  const taskId = route?.params?.taskId;
  
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('Pending');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [blacklistUser, setBlacklistUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchEvidence();
    }
  }, [taskId]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching evidence for task:', taskId);
      const response = await ApiService.getTaskEvidence(taskId);
      console.log('📋 Evidence response:', response);
      
      if (response.success) {
        setEvidence(response.evidence);
        setVerificationStatus(response.evidence.verification_status || 'Pending');
        setFeedbackNote(response.evidence.feedback_note || '');
      } else {
        console.error('❌ Failed to fetch evidence:', response.message);
        Alert.alert('Error', response.message || 'Failed to load evidence');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Fetch evidence error:', error);
      Alert.alert('Error', error.message || 'Network error');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getUpdateMessage = (status) => {
    switch (status) {
      case 'Pending':
        return 'Rescue task status will be changed to "In Progress"';
      case 'Verified':
        return 'Task has been verified successfully';
      case 'Flagged':
        return 'User will be withdrawn from the rescue task and task will be set to "Available"';
      default:
        return 'Verification status updated';
    }
  };

  const handleVerify = async () => {
    if (!feedbackNote.trim() && verificationStatus !== 'Pending') {
      Alert.alert('Error', 'Please provide feedback note when verifying or flagging');
      return;
    }

    const message = getUpdateMessage(verificationStatus);
    const blacklistMessage = blacklistUser 
      ? '\n\n⚠️ User will be blacklisted and will not be able to log in.' 
      : '';
    
    Alert.alert(
      'Confirm Update',
      `${message}${blacklistMessage}\n\nDo you want to continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
    setSubmitting(true);

    try {
      const response = await ApiService.verifyTask(taskId, {
        verification_status: verificationStatus,
        feedback_note: feedbackNote.trim(),
        blacklist_user: blacklistUser,
      });

      if (response.success) {
        Alert.alert(
          '✅ Success',
                  response.message || getUpdateMessage(verificationStatus),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
              Alert.alert('Error', 'Failed to update verification status');
      console.error('Verify task error:', error);
    } finally {
      setSubmitting(false);
    }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return Colors.success;
      case 'Flagged':
        return Colors.danger;
      case 'Pending':
        return Colors.warning;
      default:
        return Colors.gray500;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading evidence...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!evidence) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No evidence found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Task Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Task ID:</Text>
            <Text style={styles.value}>#{evidence.task_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{evidence.task_status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Animal Type:</Text>
            <Text style={styles.value}>{evidence.report?.animal_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{evidence.report?.location || 'N/A'}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned User</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {evidence.user?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{evidence.user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>User Status:</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    evidence.user?.status === 'banned'
                      ? Colors.danger
                      : Colors.success,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {evidence.user?.status === 'banned' ? 'Banned' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Evidence Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rescue Evidence</Text>

          {/* Notes */}
          {evidence.notes ? (
            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceLabel}>📝 Notes:</Text>
              <Text style={styles.evidenceText}>{evidence.notes}</Text>
            </View>
          ) : (
            <View style={styles.noEvidenceCard}>
              <Text style={styles.noEvidenceText}>No notes provided</Text>
            </View>
          )}

          {/* Photo */}
          {evidence.photo_path ? (
            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceLabel}>📸 Photo:</Text>
              <Image
                source={{ uri: evidence.photo_path }}
                style={styles.evidenceImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.noEvidenceCard}>
              <Text style={styles.noEvidenceText}>No photo provided</Text>
            </View>
          )}

          {!evidence.notes && !evidence.photo_path && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ No evidence submitted by user
              </Text>
            </View>
          )}
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>

          <View style={styles.statusButtons}>
            {['Pending', 'Verified', 'Flagged'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  verificationStatus === status && styles.statusButtonActive,
                  {
                    backgroundColor:
                      verificationStatus === status
                        ? getStatusColor(status)
                        : Colors.gray200,
                  },
                ]}
                onPress={() => setVerificationStatus(status)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    verificationStatus === status &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.label}>Feedback Note *</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Enter feedback for the user..."
              placeholderTextColor={Colors.gray400}
              value={feedbackNote}
              onChangeText={setFeedbackNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.blacklistSection}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Blacklist User</Text>
              <Switch
                value={blacklistUser}
                onValueChange={setBlacklistUser}
                trackColor={{ false: Colors.gray300, true: Colors.danger }}
                thumbColor={Colors.white}
              />
            </View>
            <Text style={styles.switchHint}>
              Check this if the evidence is fake or shows misconduct
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleVerify}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textMuted,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  value: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  evidenceCard: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  evidenceLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  evidenceText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 20,
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  noEvidenceCard: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  noEvidenceText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  warningBox: {
    backgroundColor: Colors.warning + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  statusButtonActive: {
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: Colors.white,
  },
  feedbackSection: {
    marginBottom: Spacing.lg,
  },
  feedbackInput: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: Spacing.sm,
  },
  blacklistSection: {
    backgroundColor: Colors.danger + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  switchLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  switchHint: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
});

export default AdminEvidenceViewScreen;

