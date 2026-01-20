import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, ReportStatusLabels, UrgencyLabels } from '../constants';
import ApiService from '../services/api';

const AdminViewReportScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Modals
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [rescueTaskModalVisible, setRescueTaskModalVisible] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('medium');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await ApiService.getAllReports();
      if (response.success) {
        setReports(response.reports || []);
      } else {
        Alert.alert('Error', 'Failed to load reports');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // ==================== BUTTON 1: UPDATE STATUS ====================
  const handleOpenStatusModal = (report) => {
    setSelectedReport(report);
    setSelectedStatus(report.status);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !selectedStatus) return;

    try {
      const response = await ApiService.updateReportStatus(selectedReport.id, selectedStatus);
      if (response.success) {
        Alert.alert('✅ Success', 'Report status updated');
        setStatusModalVisible(false);
        fetchReports();
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  // ==================== BUTTON 2: CREATE RESCUE TASK ====================
  const handleOpenRescueTaskModal = (report) => {
    setSelectedReport(report);
    setSelectedUrgency('medium');
    setRescueTaskModalVisible(true);
  };

  const handleCreateRescueTask = async () => {
    if (!selectedReport || !selectedUrgency) return;

    try {
      const response = await ApiService.createRescueTask({
        report_id: selectedReport.id,
        urgency_level: selectedUrgency,
      });

      if (response.success) {
        Alert.alert(
          '✅ Rescue Task Created!',
          `Task created with ${selectedUrgency} urgency.\nLocation will be shown from report details.`,
          [{
            text: 'OK', onPress: () => {
              setRescueTaskModalVisible(false);
              fetchReports();
            }
          }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create rescue task');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  // ==================== BUTTON 3: DELETE REPORT ====================
  const handleDeleteReport = (report) => {
    Alert.alert(
      '🗑️ Delete Report?',
      `Are you sure you want to delete Report #${report.id}?\n\nThis will:\n• Set status to 'closed'\n• Delete the report permanently\n• Delete any associated rescue task`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteReport(report.id);
              if (response.success) {
                Alert.alert('✅ Success', 'Report deleted');
                fetchReports();
              } else {
                Alert.alert('Error', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff5e6',
      active: '#e0f2fe', // Blue background for active
      approved: Colors.primaryLight,
      closed: Colors.gray100,
    };
    return colors[status] || Colors.gray100;
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#f2994a',
      active: '#0369a1', // Blue text for active
      approved: Colors.primary700,
      closed: Colors.gray600,
    };
    return colors[status] || Colors.gray600;
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>Admin</Text>
          <Text style={styles.headerTitle}>All Reports</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{reports.length}</Text>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading reports...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>Reports will appear here once submitted</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              {/* Report Header */}
              <View style={styles.reportHeader}>
                <Text style={styles.reportId}>Report #{report.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusTextColor(report.status) },
                    ]}
                  >
                    {ReportStatusLabels[report.status]}
                  </Text>
                </View>
              </View>

              {/* Report Image */}
              {report.photo_url && (
                <Image
                  source={{ uri: report.photo_url }}
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              )}

              {/* Report Details */}
              <View style={styles.reportBody}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Animal:</Text>
                  <Text style={styles.reportValue}>
                    {report.animal_type === 'dog'
                      ? '🐕 Dog'
                      : report.animal_type === 'cat'
                        ? '🐈 Cat'
                        : '🐾 Other'}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Reporter:</Text>
                  <Text style={styles.reportValue}>
                    {report.reporter_name || 'Anonymous'}
                    {report.reporter_contact && ` (${report.reporter_contact})`}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Location:</Text>
                  <Text style={styles.reportValue} numberOfLines={2}>
                    📍 {report.location_address || report.location || 'N/A'}
                  </Text>
                </View>

                {report.animal_condition && (
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Condition:</Text>
                    <Text style={styles.reportValue}>{report.animal_condition}</Text>
                  </View>
                )}

                <Text style={styles.reportDesc} numberOfLines={3}>
                  {report.description}
                </Text>

                <Text style={styles.reportDate}>
                  Reported: {new Date(report.created_at).toLocaleString()}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {/* Button 1: Update Status */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.statusButton]}
                  onPress={() => handleOpenStatusModal(report)}
                >
                  <Text style={styles.actionButtonIcon}>📝</Text>
                  <Text style={styles.actionButtonText}>Status</Text>
                </TouchableOpacity>

                {/* Button 2: Create Rescue Task */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.rescueButton]}
                  onPress={() => handleOpenRescueTaskModal(report)}
                  disabled={report.status !== 'pending'}
                >
                  <Text style={styles.actionButtonIcon}>🚑</Text>
                  <Text style={styles.actionButtonText}>Rescue</Text>
                </TouchableOpacity>

                {/* Button 3: Delete */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteReport(report)}
                >
                  <Text style={styles.actionButtonIcon}>🗑️</Text>
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Report #{selectedReport.id}</Text>

                <Text style={styles.inputLabel}>Select New Status:</Text>
                <View style={styles.statusOptions}>
                  {['pending', 'active', 'approved', 'closed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        selectedStatus === status && styles.statusOptionActive,
                        { backgroundColor: getStatusColor(status) },
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          { color: getStatusTextColor(status) },
                        ]}
                      >
                        {ReportStatusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleUpdateStatus}>
                  <Text style={styles.submitButtonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Rescue Task Modal */}
      <Modal
        visible={rescueTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRescueTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Rescue Task</Text>
              <TouchableOpacity onPress={() => setRescueTaskModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Report #{selectedReport.id}</Text>

                {/* Location Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>📍 Location (Auto from Report):</Text>
                  <Text style={styles.infoValue}>
                    {selectedReport.location_address || selectedReport.location || 'N/A'}
                  </Text>
                  <Text style={styles.infoNote}>
                    This location will be hidden until volunteer accepts the task
                  </Text>
                </View>

                {/* Urgency Selection */}
                <Text style={styles.inputLabel}>Select Urgency Level:</Text>
                <View style={styles.urgencyOptions}>
                  {['low', 'medium', 'high', 'critical'].map((urgency) => (
                    <TouchableOpacity
                      key={urgency}
                      style={[
                        styles.urgencyOption,
                        selectedUrgency === urgency && styles.urgencyOptionActive,
                        selectedUrgency === urgency && { backgroundColor: getUrgencyColor(urgency) },
                      ]}
                      onPress={() => setSelectedUrgency(urgency)}
                    >
                      <Text
                        style={[
                          styles.urgencyOptionText,
                          selectedUrgency === urgency && styles.urgencyOptionTextActive,
                        ]}
                      >
                        {UrgencyLabels[urgency]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleCreateRescueTask}>
                  <Text style={styles.submitButtonText}>Create Rescue Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>⚙️</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
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
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.sm,
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
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.gray50,
  },
  reportId: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reportImage: {
    width: '100%',
    height: 200,
  },
  reportBody: {
    padding: Spacing.xl,
  },
  reportRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  reportLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    minWidth: 80,
  },
  reportValue: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  reportDesc: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  reportDate: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  statusButton: {
    backgroundColor: Colors.primary,
  },
  rescueButton: {
    backgroundColor: Colors.info,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  modalBody: {
    padding: Spacing.xxl,
  },
  modalSubtitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statusOptions: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statusOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  statusOptionActive: {
    borderWidth: 2,
    borderColor: Colors.primary700,
  },
  statusOptionText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  urgencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  urgencyOption: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  urgencyOptionActive: {
    borderColor: Colors.white,
  },
  urgencyOptionText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  urgencyOptionTextActive: {
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoValue: {
    fontSize: FontSizes.base,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoNote: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingHorizontal: Spacing.xxl,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  navIconActive: {
    color: Colors.primary700,
  },
  navDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.primary700,
    borderRadius: 3,
    marginTop: 4,
  },
});

export default AdminViewReportScreen;