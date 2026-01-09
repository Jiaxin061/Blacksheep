import * as ImagePicker from "expo-image-picker";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { deleteAllocation, fetchAllocationByAnimal, fetchAllocationDetail, updateAllocation } from "../../../../services/api";
import { colors } from "../../../../theme/colors";
import { getImageUrl } from "../../../../utils/imageHelper";

// Constants for Edit Mode
const categories = ["Vet", "Medication", "Food", "Shelter", "Other"];
const allocationTypes = [
  "Vet Visit",
  "Vaccination",
  "Surgery",
  "Emergency Transport",
  "Daily Feeding",
];
const statusOptions = ["Draft", "Verified", "Published"] as const;
const externalFundingSources = [
  "Shelter Emergency Fund",
  "Corporate Sponsor",
  "Partner Vet Clinic",
  "Volunteer Contribution",
  "Other",
] as const;

interface AllocationDetail {
  allocationID: number;
  animalID: number;
  category: string;
  allocationType?: string;
  serviceProvider?: string;
  amount: number;
  // Enhanced funding fields
  totalCost?: number;
  donationCoveredAmount?: number;
  externalCoveredAmount?: number;
  externalFundingSource?: string;
  externalFundingNotes?: string;
  fundingStatus?: "Fully Funded" | "Partially Funded";
  // Existing fields
  allocationDate: string;
  status?: "Draft" | "Verified" | "Published";
  publicDescription?: string;
  internalNotes?: string;
  conditionUpdate?: string;
  receiptImage?: string;
  treatmentPhoto?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  donorName?: string;
  transactionID?: number;
  animal?: {
    name: string;
    type: string;
    status?: string;
  };
}



export default function AllocationDetailScreen() {
  const router = useRouter();
  const { animalID, allocationID, mode } = useLocalSearchParams<{
    animalID: string;
    allocationID: string;
    mode?: string;
  }>();

  // View State
  const [allocation, setAllocation] = useState<AllocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Financial Context for Calculations
  const [amountRaised, setAmountRaised] = useState(0);
  const [currentRemaining, setCurrentRemaining] = useState(0);

  // Form State
  const [category, setCategory] = useState("");
  const [allocationType, setAllocationType] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [allocationDate, setAllocationDate] = useState("");
  const [status, setStatus] = useState<string>("Draft");
  const [amount, setAmount] = useState(""); // Total Cost
  const [publicDescription, setPublicDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [conditionUpdate, setConditionUpdate] = useState("");

  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [treatmentPhoto, setTreatmentPhoto] = useState<string | null>(null);
  // Track if images were changed to avoid re-uploading existing URLs
  const [newReceiptPicked, setNewReceiptPicked] = useState(false);
  const [newTreatmentPicked, setNewTreatmentPicked] = useState(false);

  const [externalFundingSource, setExternalFundingSource] = useState("");
  const [externalFundingNotes, setExternalFundingNotes] = useState("");
  const [externalFundingConfirmed, setExternalFundingConfirmed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadAllocation = useCallback(async () => {
    if (!allocationID) return;
    try {
      setError(null);
      const data = await fetchAllocationDetail(allocationID);
      setAllocation(data);
    } catch (err: any) {
      console.error("Allocation detail fetch error:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to load allocation details."
      );
    } finally {
      setLoading(false);
    }
  }, [allocationID]);

  // Load financials to determine available funds
  const loadFinancials = async () => {
    if (!animalID) return;
    try {
      const data = await fetchAllocationByAnimal(animalID);
      setAmountRaised(data?.summary?.amountRaised ?? 0);
      setCurrentRemaining(data?.summary?.remaining ?? 0);
    } catch (e) {
      console.error("Failed to load financials", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAllocation();
    }, [loadAllocation]),
  );

  // Auto-enter edit mode if requested via params
  useEffect(() => {
    if (mode === 'edit' && allocation && !isEditing) {
      enterEditMode();
    }
  }, [mode, allocation]);

  // Initialize fields when entering edit mode
  const enterEditMode = async () => {
    if (!allocation) return;

    // Status Check
    if (allocation.status === "Published") {
      Alert.alert(
        "Editing Published Allocation",
        "This allocation is currently visible to donors. Any changes will be live immediately after saving. Proceed?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Proceed", onPress: () => startEdit() }
        ]
      );
    } else {
      startEdit();
    }
  };

  const startEdit = async () => {
    if (!allocation) return;

    setLoading(true);
    await loadFinancials(); // Refresh financials ensures up-to-date remaining calc

    setCategory(allocation.category);
    setAllocationType(allocation.allocationType || "");
    setServiceProvider(allocation.serviceProvider || "");
    setAllocationDate(allocation.allocationDate ? allocation.allocationDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setStatus(allocation.status || "Draft");
    setAmount((allocation.totalCost || allocation.amount).toString());
    setPublicDescription(allocation.publicDescription || "");
    setInternalNotes(allocation.internalNotes || "");
    setConditionUpdate(allocation.conditionUpdate || "");

    setExternalFundingSource(allocation.externalFundingSource || "");
    setExternalFundingNotes(allocation.externalFundingNotes || "");

    // Evidence: Keep existing URLs but reset 'new' flags
    setReceiptImage(allocation.receiptImage ? getImageUrl(allocation.receiptImage) : null);
    setTreatmentPhoto(allocation.treatmentPhoto ? getImageUrl(allocation.treatmentPhoto) : null);
    setNewReceiptPicked(false);
    setNewTreatmentPicked(false);

    const hasExternal = (allocation.externalCoveredAmount || 0) > 0;
    setExternalFundingConfirmed(hasExternal);

    setIsEditing(true);
    setLoading(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  // Image Pickers
  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Need library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
      setNewReceiptPicked(true);
      setErrors((prev) => ({ ...prev, receipt: "" }));
    }
  };

  const pickTreatmentPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Need library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setTreatmentPhoto(result.assets[0].uri);
      setNewTreatmentPicked(true);
    }
  };

  // --- Real-time Calculations ---
  // Max Donation Available = (Current Unallocated DB Remaining) + (Amount allocated by THIS record)
  // We approximate this dynamically
  const totalCostVal = parseFloat(amount) || 0;

  // existing.amount is the donation-covered portion of the current record
  const currentAllocationUsage = allocation?.amount || 0;
  const maxDonationFunds = currentRemaining + currentAllocationUsage;

  const coveredByDonations = Math.min(totalCostVal, Math.max(0, maxDonationFunds));
  const outstandingAmount = Math.max(0, totalCostVal - coveredByDonations);
  const fundingStatus = outstandingAmount > 0 ? "Partially Funded" : "Fully Funded";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (isNaN(totalCostVal) || totalCostVal <= 0) newErrors.amount = "Amount > 0 required";

    if (outstandingAmount > 0) {
      if (!externalFundingSource) newErrors.externalFunding = "External source required";
      if (!externalFundingConfirmed) newErrors.externalFundingConfirmed = "Please confirm external funding coverage.";
    }

    // Evidence check: Only if new image required or removed?
    // If we have an existing or new image, we are good.
    if ((category === "Vet" || category === "Medication") && !receiptImage) {
      newErrors.receipt = "Receipt required for Vet/Medication categories.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("category", category);
      payload.append("allocationType", allocationType);
      payload.append("allocationDate", allocationDate);
      payload.append("status", status);
      payload.append("totalCost", totalCostVal.toString());

      // These will be recalculated by backend but good to send preference
      payload.append("donationCoveredAmount", coveredByDonations.toString());
      payload.append("externalCoveredAmount", outstandingAmount.toString());
      payload.append("amount", totalCostVal.toString()); // Legacy field support

      if (serviceProvider) payload.append("serviceProvider", serviceProvider);
      if (publicDescription) payload.append("publicDescription", publicDescription);
      if (internalNotes) payload.append("internalNotes", internalNotes);
      if (conditionUpdate) payload.append("conditionUpdate", conditionUpdate);

      if (outstandingAmount > 0) {
        payload.append("externalFundingSource", externalFundingSource);
        payload.append("externalFundingNotes", externalFundingNotes);
        payload.append("fundingStatus", fundingStatus);
      } else {
        // Clear external fields if no longer needed
        payload.append("externalFundingSource", "");
        payload.append("externalFundingNotes", "");
        payload.append("fundingStatus", "Fully Funded");
      }

      // Images: Only append if NEW image picked
      if (newReceiptPicked && receiptImage) {
        const filename = receiptImage.split('/').pop() || "receipt.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        payload.append("receipt_image", { uri: receiptImage, name: filename, type });
      }
      if (newTreatmentPicked && treatmentPhoto) {
        const filename = treatmentPhoto.split('/').pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        payload.append("treatment_photo", { uri: treatmentPhoto, name: filename, type });
      }

      await updateAllocation(allocation!.allocationID, payload);

      Alert.alert("Success", "Allocation updated successfully.", [
        {
          text: "OK", onPress: () => {
            setIsEditing(false);
            loadAllocation(); // Reload view
          }
        }
      ]);

    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to update allocation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!allocation) return;

    Alert.alert(
      "Delete Allocation",
      `Are you sure you want to delete this allocation of RM${allocation.amount.toFixed(2)}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllocation(allocation.allocationID);
              Alert.alert("Success", "Allocation deleted successfully.", [
                {
                  text: "OK",
                  onPress: () =>
                    router.replace({
                      pathname: "/admin/fund-allocation/[animalID]",
                      params: { animalID: animalID || "" },
                    }),
                },
              ]);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Failed to delete allocation"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading allocation details...</Text>
      </View>
    );
  }

  if (!allocation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || "Allocation not found."}
        </Text>
      </View>
    );
  }

  // --- RENDER VIEW MODE ---
  if (!isEditing) {
    const statusColor = allocation.status === "Published" ? colors.primary : allocation.status === "Verified" ? colors.success : colors.neutralDark;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ title: "Allocation Details" }} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Allocation Details</Text>
            {allocation.status && (
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>{allocation.status}</Text>
              </View>
            )}
          </View>
          {allocation.animal && (
            <Text style={styles.subtitle}>
              {allocation.animal.name} ({allocation.animal.type})
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allocation Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{allocation.category}</Text>
          </View>

          {allocation.allocationType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{allocation.allocationType}</Text>
            </View>
          )}

          {allocation.serviceProvider && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Provider</Text>
              <Text style={styles.infoValue}>{allocation.serviceProvider}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Cost</Text>
            <Text style={styles.amountValue}>
              RM{(allocation.totalCost || allocation.amount).toFixed(2)}
            </Text>
          </View>

          {/* Funding Breakdown Section */}
          {allocation.totalCost !== undefined && (
            <>
              <View style={styles.fundingBreakdownSection}>
                <Text style={styles.fundingBreakdownTitle}>Funding Breakdown</Text>

                <View style={styles.fundingBreakdownRow}>
                  <Text style={styles.fundingBreakdownLabel}>
                    Covered by Donations:
                  </Text>
                  <Text style={styles.fundingBreakdownValue}>
                    RM{(allocation.donationCoveredAmount || 0).toFixed(2)}
                  </Text>
                </View>

                {/* FIX: Ensure we do not render '0' */}
                {(allocation.externalCoveredAmount || 0) > 0 && (
                  <>
                    <View style={styles.fundingBreakdownRow}>
                      <Text style={styles.fundingBreakdownLabel}>
                        Covered by External Source:
                      </Text>
                      <Text
                        style={[
                          styles.fundingBreakdownValue,
                          styles.externalCoveredValue,
                        ]}
                      >
                        RM{allocation.externalCoveredAmount!.toFixed(2)}
                      </Text>
                    </View>
                    {allocation.externalFundingSource && (
                      <View style={styles.externalSourceInfo}>
                        <Text style={styles.externalSourceLabel}>
                          External Funding Source:
                        </Text>
                        <Text style={styles.externalSourceValue}>
                          {allocation.externalFundingSource}
                        </Text>
                        {allocation.externalFundingNotes && (
                          <Text style={styles.externalSourceNotes}>
                            {allocation.externalFundingNotes}
                          </Text>
                        )}
                      </View>
                    )}
                  </>
                )}

                <View style={styles.fundingStatusRow}>
                  <Text style={styles.fundingStatusLabel}>Funding Status:</Text>
                  <View
                    style={[
                      styles.fundingStatusBadge,
                      {
                        backgroundColor:
                          allocation.fundingStatus === "Fully Funded"
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    <Text style={styles.fundingStatusText}>
                      {allocation.fundingStatus || "Fully Funded"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* FIX: Ensure we do not render '0' */}
              {(allocation.externalCoveredAmount || 0) > 0 && (
                <View style={styles.gapExplanation}>
                  <Text style={styles.gapExplanationText}>
                    💡 The total treatment cost exceeded available donations.
                    The outstanding amount was covered by external funding to
                    ensure timely treatment.
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Allocation Date</Text>
            <Text style={styles.infoValue}>
              {new Date(allocation.allocationDate).toLocaleDateString()}
            </Text>
          </View>

          {allocation.lastUpdatedBy && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated By</Text>
              <Text style={styles.infoValue}>{allocation.lastUpdatedBy}</Text>
            </View>
          )}
        </View>

        {/* Public Description (Visible to Donors) */}
        {allocation.publicDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Public Description{" "}
              <Text style={styles.publicBadge}>(Visible to Donors)</Text>
            </Text>
            <Text style={styles.descriptionText}>
              {allocation.publicDescription}
            </Text>
          </View>
        )}

        {/* Internal Notes (Admin Only) */}
        {allocation.internalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Internal Notes{" "}
              <Text style={styles.adminBadge}>(Admin Only)</Text>
            </Text>
            <Text style={styles.descriptionText}>
              {allocation.internalNotes}
            </Text>
          </View>
        )}

        {/* Condition Update */}
        {allocation.conditionUpdate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animal Condition Update</Text>
            <Text style={styles.descriptionText}>
              {allocation.conditionUpdate}
            </Text>
          </View>
        )}

        {/* Evidence Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supporting Evidence</Text>

          {allocation.receiptImage ? (
            <View style={styles.evidenceItem}>
              <Text style={styles.evidenceLabel}>Receipt / Invoice</Text>
              <Image
                source={{ uri: getImageUrl(allocation.receiptImage) }}
                style={styles.evidenceImage}
              />
            </View>
          ) : (
            <Text style={styles.noEvidence}>No receipt uploaded</Text>
          )}

          {allocation.treatmentPhoto ? (
            <View style={styles.evidenceItem}>
              <Text style={styles.evidenceLabel}>Treatment Photo</Text>
              <Image
                source={{ uri: getImageUrl(allocation.treatmentPhoto) }}
                style={styles.evidenceImage}
              />
            </View>
          ) : (
            <Text style={styles.noEvidence}>No treatment photo uploaded</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {allocation.animal?.status === "Archived" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={enterEditMode}
            >
              <Text style={styles.actionButtonText}>Edit Allocation</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.disabledBanner}>
              <Text style={styles.disabledText}>
                Editing disabled (Animal not archived)
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.actionButtonText}>Delete Allocation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // --- RENDER EDIT MODE ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Edit Allocation" }} />

      {/* Animal Context Banner */}
      {allocation?.animal && (
        <View style={styles.contextBanner}>
          <Text style={styles.contextLabel}>Allocating funds for:</Text>
          <Text style={styles.contextAnimalName}>{allocation.animal.name}</Text>
          <Text style={styles.contextAnimalType}>{allocation.animal.type}</Text>
        </View>
      )}

      <Text style={styles.title}>Edit Allocation</Text>

      {/* SECTION: Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Details</Text>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, c === category && styles.chipActive]}
                onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, c === category && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.chipRow}>
            {allocationTypes.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, t === allocationType && styles.chipActive]}
                onPress={() => setAllocationType(t)}>
                <Text style={[styles.chipText, t === allocationType && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Total Cost (RM)</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

          {/* Breakdown */}
          <View style={styles.fundingBreakdownSection}>
            <Text style={styles.fundingBreakdownTitle}>Updated Breakdown</Text>
            <View style={styles.fundingBreakdownRow}>
              <Text style={styles.fundingBreakdownLabel}>Total Cost:</Text>
              <Text style={styles.fundingBreakdownValue}>RM{totalCostVal.toFixed(2)}</Text>
            </View>
            <View style={styles.fundingBreakdownRow}>
              <Text style={styles.fundingBreakdownLabel}>Covered by Donations:</Text>
              <Text style={[styles.fundingBreakdownValue, { color: colors.primary }]}>RM{coveredByDonations.toFixed(2)}</Text>
            </View>
            {outstandingAmount > 0 ? (
              <View style={styles.fundingBreakdownRow}>
                <Text style={styles.fundingBreakdownLabel}>Outstanding (External):</Text>
                <Text style={[styles.fundingBreakdownValue, { color: colors.warning }]}>RM{outstandingAmount.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={[styles.fundingStatusText, { color: colors.success, marginTop: 4 }]}>Fully Covered by Donations</Text>
            )}
            <Text style={styles.hint}>Available Donation Balance: RM{maxDonationFunds.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Provider</Text>
          <TextInput value={serviceProvider} onChangeText={setServiceProvider} style={styles.input} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TextInput value={allocationDate} onChangeText={setAllocationDate} placeholder="YYYY-MM-DD" style={styles.input} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.chipRow}>
            {statusOptions.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, s === status && styles.chipActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.chipText, s === status && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* SECTION: External Funding */}
      {outstandingAmount > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>External Funding</Text>
          <View style={styles.section}>
            <Text style={styles.label}>Source</Text>
            <View style={styles.chipRow}>
              {externalFundingSources.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, s === externalFundingSource && styles.chipActive]} onPress={() => setExternalFundingSource(s)}>
                  <Text style={[styles.chipText, s === externalFundingSource && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.externalFunding && <Text style={styles.errorText}>{errors.externalFunding}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput value={externalFundingNotes} onChangeText={setExternalFundingNotes} style={styles.input} />
          </View>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setExternalFundingConfirmed(!externalFundingConfirmed)}>
            <View style={[styles.checkbox, externalFundingConfirmed && styles.checkboxChecked]}>
              {externalFundingConfirmed && <Text style={styles.checkboxCheckmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Confirm external coverage</Text>
          </TouchableOpacity>
          {errors.externalFundingConfirmed && <Text style={styles.errorText}>{errors.externalFundingConfirmed}</Text>}
        </View>
      )}

      {/* SECTION: Evidence - Conditional Upload */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Evidence</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Receipt</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickReceipt}>
            {receiptImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                <Text style={styles.imageLabel}>{newReceiptPicked ? "New image selected" : "Existing image"}</Text>
              </View>
            ) : <Text style={styles.uploadText}>+ Upload Receipt</Text>}
          </TouchableOpacity>
          {errors.receipt && <Text style={styles.errorText}>{errors.receipt}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickTreatmentPhoto}>
            {treatmentPhoto ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: treatmentPhoto }} style={styles.previewImage} />
                <Text style={styles.imageLabel}>{newTreatmentPicked ? "New image selected" : "Existing image"}</Text>
              </View>
            ) : <Text style={styles.uploadText}>+ Upload Photo</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Description Fields */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Public Description</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={publicDescription} onChangeText={setPublicDescription} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Internal Notes</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={internalNotes} onChangeText={setInternalNotes} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Condition Update</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={conditionUpdate} onChangeText={setConditionUpdate} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.actionButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={cancelEdit} disabled={saving}>
          <Text style={styles.actionButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  muted: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
  },
  publicBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  adminBadge: {
    fontSize: 12,
    color: colors.neutralDark,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 18,
    color: colors.primaryDark,
    fontWeight: "800",
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  evidenceItem: {
    marginBottom: 16,
  },
  evidenceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  evidenceImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    backgroundColor: colors.muted,
    marginBottom: 8,
  },
  noEvidence: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: colors.primaryDark,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 15,
  },
  fundingBreakdownSection: {
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fundingBreakdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  fundingBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fundingBreakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  fundingBreakdownValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  externalCoveredValue: {
    color: colors.warning,
  },
  externalSourceInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  externalSourceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  externalSourceValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  externalSourceNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
  },
  fundingStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fundingStatusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  fundingStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fundingStatusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  gapExplanation: {
    backgroundColor: "#FFF9E6",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  gapExplanationText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  // Context Banner Styles
  contextBanner: {
    backgroundColor: colors.primary + "15", // Light opacity
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  contextLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  contextAnimalName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  contextAnimalType: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  // Form Styles for Edit Mode
  label: {
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.muted,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.surface,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  sectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxCheckmark: {
    color: colors.surface,
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  uploadText: {
    color: colors.primary,
    fontWeight: "600",
  },
  imagePreview: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontStyle: "italic",
  },
  disabledBanner: {
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledText: {
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
});