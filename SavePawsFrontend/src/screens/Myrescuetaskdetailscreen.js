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
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSizes, BorderRadius, UrgencyLabels } from '../constants';
import ApiService from '../services/api';

const MyRescueTaskDetailScreen = ({ navigation, route }) => {
  const taskId = route?.params?.taskId;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateImage, setUpdateImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await ApiService.getRescueTaskById(taskId);
      if (response.success) {
        setTask(response.task);
      } else {
        Alert.alert('Error', 'Failed to load task details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const statusLabels = {
      in_progress: 'In Progress',
      completed: 'Completed'
    };

    Alert.alert(
      `Update Status to "${statusLabels[newStatus]}"?`,
      `Are you sure you want to mark this task as ${statusLabels[newStatus].toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await ApiService.updateRescueTaskStatus(taskId, newStatus);
              if (response.success) {
                Alert.alert('✅ Success', 'Task status updated!');
                fetchTaskDetails();
              } else {
                Alert.alert('Error', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (task?.location_latitude && task?.location_longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${task.location_latitude},${task.location_longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Location coordinates not available');
    }
  };

  const handleCallReporter = () => {
    if (task?.reporter_contact) {
      const phoneNumber = task.reporter_contact.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUpdateImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmitUpdate = async () => {
    if (!updateText.trim() && !updateImage) {
      Alert.alert('Error', 'Please provide an update text or image');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (updateImage) {
        console.log('📤 Uploading update image...');
        const uploadResult = await ApiService.uploadImage(updateImage);
        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
        } else {
          Alert.alert('Error', 'Failed to upload image');
          setUploading(false);
          return;
        }
      }

      // Update task with text and image
      const updateData = {
        update_text: updateText.trim() || null,
        update_image: imageUrl,
      };

      const response = await ApiService.updateRescueTask(taskId, updateData);

      if (response.success) {
        Alert.alert('✅ Success', 'Task update submitted successfully!');
        setUpdateModalVisible(false);
        setUpdateText('');
        setUpdateImage(null);
        fetchTaskDetails(); // Refresh task details
      } else {
        Alert.alert('Error', response.message || 'Failed to submit update');
      }
    } catch (error) {
      console.error('Error submitting update:', error);
      Alert.alert('Error', 'Failed to submit update. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: Colors.urgencyLow,
      medium: Colors.urgencyMedium,
      high: Colors.urgencyHigh,
      critical: Colors.urgencyCritical,
    };
    return colors[urgency] || Colors.gray500;
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: Colors.primary,
      in_progress: Colors.info,
      completed: Colors.success,
    };
    return colors[status] || Colors.gray500;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Task ID#{task.id}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status & Urgency Badges */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(task.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {task.status === 'assigned' ? '📋 Assigned' : task.status === 'in_progress' ? '🚀 In Progress' : '✅ Completed'}
            </Text>
          </View>
          <View
            style={[
              styles.urgencyBadge,
              { backgroundColor: getUrgencyColor(task.urgency_level) },
            ]}
          >
            <Text style={styles.badgeText}>
              {UrgencyLabels[task.urgency_level]} Urgency
            </Text>
          </View>
        </View>

        {/* Task Image */}
        {task.photo_url && (
          <Image
            source={{ uri: task.photo_url }}
            style={styles.taskImage}
            resizeMode="cover"
          />
        )}

        {/* Animal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animal Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {task.animal_type === 'dog' ? '🐕 Dog' : task.animal_type === 'cat' ? '🐈 Cat' : '🐾 Other'}
            </Text>
          </View>

          {task.animal_condition && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition:</Text>
              <Text style={styles.detailValue}>{task.animal_condition}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
          </View>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationContent}>
              <Text style={styles.locationAddress}>
                {task.location_address || task.location || 'Address not available'}
              </Text>
              {task.location_latitude && task.location_longitude && (
                <Text style={styles.coordinates}>
                  GPS: {task.location_latitude}, {task.location_longitude}
                </Text>
              )}
            </View>
          </View>

          {task.location_latitude && task.location_longitude && (
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
              <Text style={styles.mapButtonIcon}>🗺️</Text>
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reporter Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporter Contact</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactIcon}>👤</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>
                  {task.reporter_name || 'Anonymous'}
                </Text>
                <Text style={styles.contactPhone}>
                  {task.reporter_contact || 'No contact provided'}
                </Text>
              </View>
            </View>
            
            {task.reporter_contact && (
              <TouchableOpacity style={styles.callButton} onPress={handleCallReporter}>
                <Text style={styles.callButtonIcon}>📞</Text>
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Task Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Assigned</Text>
                <Text style={styles.timelineDate}>
                  {new Date(task.assigned_at).toLocaleString()}
                </Text>
              </View>
            </View>

            {task.status === 'in_progress' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>In Progress</Text>
                  <Text style={styles.timelineDate}>Current status</Text>
                </View>
              </View>
            )}

            {task.completed_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Completed</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(task.completed_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Updates Section */}
        {(task.update_text || task.update_image) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Updates</Text>
            {task.update_text && (
              <View style={styles.updateCard}>
                <Text style={styles.updateText}>{task.update_text}</Text>
              </View>
            )}
            {task.update_image && (
              <Image
                source={{ uri: task.update_image }}
                style={styles.updateImage}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <View style={styles.actionButtons}>
            {(task.status === 'assigned' || task.status === 'in_progress') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={() => setUpdateModalVisible(true)}
              >
                <Text style={styles.actionButtonIcon}>📝</Text>
                <Text style={styles.actionButtonText}>Add Update</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={styles.completedText}>
              Great job! This rescue task has been completed.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Update Task Modal */}
      <Modal
        visible={updateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Task Update</Text>
              <TouchableOpacity
                onPress={() => {
                  setUpdateModalVisible(false);
                  setUpdateText('');
                  setUpdateImage(null);
                }}
                disabled={uploading}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Update Text *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Describe the progress or situation..."
                placeholderTextColor={Colors.gray400}
                multiline
                numberOfLines={6}
                value={updateText}
                onChangeText={setUpdateText}
                editable={!uploading}
              />

              <Text style={styles.modalLabel}>Update Image (Optional)</Text>
              {updateImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: updateImage }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setUpdateImage(null)}
                    disabled={uploading}
                  >
                    <Text style={styles.removeImageText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerText}>Pick Image</Text>
                </TouchableOpacity>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setUpdateModalVisible(false);
                    setUpdateText('');
                    setUpdateImage(null);
                  }}
                  disabled={uploading}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSubmitButton, uploading && styles.modalButtonDisabled]}
                  onPress={handleSubmitUpdate}
                  disabled={uploading || (!updateText.trim() && !updateImage)}
                >
                  {uploading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.modalSubmitText}>Submit Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FontSizes.xxl,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: 100,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  urgencyBadge: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  taskImage: {
    width: '100%',
    height: 250,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textMuted,
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.text,
  },
  description: {
    fontSize: FontSizes.base,
    color: Colors.text,
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationAddress: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  coordinates: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  mapButtonIcon: {
    fontSize: 20,
  },
  mapButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  contactCard: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: FontSizes.base,
    color: Colors.textMuted,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  callButtonIcon: {
    fontSize: 18,
  },
  callButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  timeline: {
    gap: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gray300,
    marginRight: Spacing.md,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: Colors.info,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  startButton: {
    backgroundColor: Colors.info,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
  },
  completedBanner: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  completedText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.textMuted,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.textMuted,
  },
  updateCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  updateText: {
    fontSize: FontSizes.base,
    color: Colors.text,
    lineHeight: 24,
  },
  updateImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  updateButton: {
    backgroundColor: Colors.warning,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  modalClose: {
    fontSize: FontSizes.xxl,
    color: Colors.textMuted,
  },
  modalBody: {
    padding: Spacing.xl,
  },
  modalLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  imagePickerIcon: {
    fontSize: 24,
  },
  imagePickerText: {
    fontSize: FontSizes.base,
    color: Colors.textMuted,
  },
  imagePreviewContainer: {
    marginTop: Spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  removeImageButton: {
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  removeImageText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.gray200,
  },
  modalCancelText: {
    color: Colors.text,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});

export default MyRescueTaskDetailScreen;