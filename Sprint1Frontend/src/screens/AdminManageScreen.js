import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, STATUS_OPTIONS } from '../utils/constants';
import { getAllReports, updateReportStatus, deleteReport } from '../services/api';

const AdminManageScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch reports
  const fetchReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  // Open status update modal
  const openUpdateModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
    setNewStatus('');
  };

  // Update report status
  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;

    try {
      setUpdating(true);
      await updateReportStatus(selectedReport.id, newStatus);

      // Update local state
      setReports(
        reports.map((r) =>
          r.id === selectedReport.id ? { ...r, status: newStatus } : r
        )
      );

      Alert.alert('Success', 'Report status updated successfully');
      closeModal();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Delete report with confirmation
  const handleDeleteReport = (report) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${report.animal_type} report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReport(report.id);
              setReports(reports.filter((r) => r.id !== report.id));
              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : COLORS.textLight;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render report card
  const renderReportCard = ({ item }) => (
    <View style={styles.reportCard}>
      {/* Image */}
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.reportImage}
          resizeMode="cover"
        />
      )}

      {/* Report Info */}
      <View style={styles.reportInfo}>
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleContainer}>
            <Text style={styles.animalType}>
              {item.animal_type.charAt(0).toUpperCase() + item.animal_type.slice(1)}
            </Text>
            <Text style={styles.reportId}>#{item.id}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={styles.detailText}>{item.reporter_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={styles.detailText}>{item.reporter_contact}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕒</Text>
            <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => openUpdateModal(item)}
          >
            <Text style={styles.updateButtonText}>Update Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReport(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No reports to manage</Text>
      <Text style={styles.emptySubtext}>
        Reports will appear here once submitted
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerText}>
          Total Reports: <Text style={styles.headerNumber}>{reports.length}</Text>
        </Text>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Update Status Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Report Status</Text>

            {selectedReport && (
              <View style={styles.modalReportInfo}>
                <Text style={styles.modalReportText}>
                  Report #{selectedReport.id} -{' '}
                  {selectedReport.animal_type.charAt(0).toUpperCase() +
                    selectedReport.animal_type.slice(1)}
                </Text>
                <Text style={styles.modalReportSubtext} numberOfLines={2}>
                  {selectedReport.description}
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Select New Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newStatus}
                onValueChange={setNewStatus}
                style={styles.picker}
              >
                {STATUS_OPTIONS.map((status) => (
                  <Picker.Item
                    key={status.value}
                    label={status.label}
                    value={status.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  headerInfo: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  headerNumber: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  listContainer: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  reportImage: {
    width: '100%',
    height: 180,
  },
  reportInfo: {
    padding: 15,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportTitleContainer: {
    flex: 1,
  },
  animalType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  reportId: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  updateButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalReportInfo: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalReportText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalReportSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default AdminManageScreen;