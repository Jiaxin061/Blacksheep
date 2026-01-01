import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createAllocationForAnimal,
  fetchAllocationByAnimal,
} from "../../../../services/api";
import { colors } from "../../../../theme/colors";

// Allocation categories
const categories = ["Vet", "Medication", "Food", "Shelter", "Other"];

// Allocation types (more specific than categories)
const allocationTypes = [
  "Vet Visit",
  "Vaccination",
  "Surgery",
  "Emergency Transport",
  "Daily Feeding",
];

// Allocation status options
const statusOptions = ["Draft", "Verified", "Published"] as const;
type AllocationStatus = typeof statusOptions[number];

// External funding sources
const externalFundingSources = [
  "Shelter Emergency Fund",
  "Corporate Sponsor",
  "Partner Vet Clinic",
  "Volunteer Contribution",
  "Other",
] as const;
type ExternalFundingSource = typeof externalFundingSources[number];

export default function AddAllocationScreen() {
  const router = useRouter();
  const { animalID } = useLocalSearchParams<{ animalID: string }>();

  // Form state
  const [category, setCategory] = useState("Vet");
  const [allocationType, setAllocationType] = useState("Vet Visit");
  const [serviceProvider, setServiceProvider] = useState("");
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<AllocationStatus>("Draft");
  const [amount, setAmount] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [conditionUpdate, setConditionUpdate] = useState("");

  // Evidence uploads
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [treatmentPhoto, setTreatmentPhoto] = useState<string | null>(null);

  // External funding fields (shown when outstandingAmount > 0)
  const [externalFundingSource, setExternalFundingSource] = useState<
    ExternalFundingSource | ""
  >("");
  const [externalFundingNotes, setExternalFundingNotes] = useState("");
  const [externalFundingConfirmed, setExternalFundingConfirmed] = useState(false);

  // Validation & loading
  const [remaining, setRemaining] = useState<number | null>(null);
  const [amountRaised, setAmountRaised] = useState<number | null>(null);
  const [totalAllocated, setTotalAllocated] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadFundingData = async () => {
      if (!animalID) {
        Alert.alert("Error", "Animal ID not found.");
        return;
      }

      try {
        const data = await fetchAllocationByAnimal(animalID);

        // Enforce Business Rule: Only Archived animals can have funds allocated
        if (data?.animal?.status !== "Archived") {
          Alert.alert(
            "Access Denied",
            "Fund allocation is only allowed for archived animals.",
            [
              {
                text: "Go Back",
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }

        // Load funding summary for real-time calculations
        setAmountRaised(data?.summary?.amountRaised ?? 0);
        setTotalAllocated(data?.summary?.totalAllocated ?? 0);
        setRemaining(data?.summary?.remaining ?? 0);
      } catch (err) {
        console.error("Failed to load funding data", err);
      }
    };
    loadFundingData();
  }, [animalID]);

  // Image picker for receipt/invoice
  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to upload evidence."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
        setErrors((prev) => ({ ...prev, receipt: "" }));
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Image picker for treatment photo
  const pickTreatmentPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to upload evidence."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTreatmentPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  /**
   * OVER-ALLOCATION LOGIC
   */
  const amountValue = parseFloat(amount) || 0;
  const totalCost = amountValue;

  // Calculate how much is covered by donations based on available remaining funds
  const availableFunds = (amountRaised || 0) - (totalAllocated || 0);
  const coveredByDonations = Math.min(totalCost, Math.max(0, availableFunds));

  // Outstanding amount (needs external funding)
  const outstandingAmount = Math.max(0, totalCost - coveredByDonations);

  // Funding status
  const fundingStatus =
    outstandingAmount > 0 ? "Partially Funded" : "Fully Funded";

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // External funding validation
    if (outstandingAmount > 0) {
      if (!externalFundingSource) {
        newErrors.externalFunding = "External funding source is required.";
      }
      if (!externalFundingConfirmed) {
        newErrors.externalFundingConfirmed =
          "Please confirm that external funding covers the outstanding amount";
      }
    }

    // Evidence required for Vet and Medication categories
    if ((category === "Vet" || category === "Medication") && !receiptImage) {
      newErrors.receipt = "Receipt/Invoice is required for Vet and Medication allocations";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!animalID) {
      Alert.alert("Error", "Animal ID is missing.");
      return;
    }

    // Validate form before proceeding
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before submitting.");
      return;
    }

    const amountValue = parseFloat(amount);

    // Double-check amount is valid
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    // Double-check category is set
    if (!category || category.trim() === "") {
      Alert.alert("Invalid Category", "Please select a category.");
      return;
    }

    try {
      setSaving(true);

      // ALWAYS use FormData because the backend route uses multer
      console.log("Sending as Multipart Form Data...");
      console.log("Form values:", { category, amount: amountValue, animalID });

      const payload = new FormData();

      // Required Fields - ensure they're not empty
      if (!category || category.trim() === "") {
        throw new Error("Category is required");
      }
      if (!amountValue || amountValue <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      payload.append("category", category.trim());
      payload.append("allocation_type", allocationType || "");
      payload.append("amount", amountValue.toString());
      payload.append("total_cost", amountValue.toString());

      console.log("FormData fields - category:", category, "amount:", amountValue.toString());
      payload.append("allocation_date", allocationDate);
      payload.append("status", status);

      // Optional text fields - check for empty strings before appending
      if (serviceProvider.trim()) payload.append("service_provider", serviceProvider.trim());

      payload.append("donation_covered_amount", coveredByDonations.toString());
      payload.append("external_covered_amount", (outstandingAmount > 0 ? outstandingAmount : 0).toString());

      if (outstandingAmount > 0 && externalFundingSource) {
        payload.append("external_funding_source", externalFundingSource);
      }
      if (outstandingAmount > 0 && externalFundingNotes.trim()) {
        payload.append("external_funding_notes", externalFundingNotes.trim());
      }

      payload.append("funding_status", fundingStatus);

      if (publicDescription.trim()) payload.append("public_description", publicDescription.trim());
      if (internalNotes.trim()) payload.append("internal_notes", internalNotes.trim());
      if (conditionUpdate.trim()) payload.append("condition_update", conditionUpdate.trim());

      // Images - Append only if they exist
      if (receiptImage) {
        const filename = receiptImage.split('/').pop() || "receipt.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        payload.append("receipt_image", { uri: receiptImage, name: filename, type });
      }

      if (treatmentPhoto) {
        const filename = treatmentPhoto.split('/').pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        payload.append("treatment_photo", { uri: treatmentPhoto, name: filename, type });
      }

      await createAllocationForAnimal(animalID, payload);

      Alert.alert("Success", "Allocation added successfully.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/admin/fund-allocation/[animalID]",
              params: { animalID: animalID.toString() },
            }),
        },
      ]);
    } catch (err: any) {
      console.error("Create allocation error:", err);
      // Log the full response data for debugging
      if (err.response) {
        console.log("Server Response Data:", err.response.data);
      }
      Alert.alert(
        "Failed to save",
        err?.response?.data?.message || "Unable to save allocation."
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset external funding fields when amount changes and no longer exceeds
  useEffect(() => {
    if (outstandingAmount === 0) {
      setExternalFundingSource("");
      setExternalFundingNotes("");
      setExternalFundingConfirmed(false);
    }
  }, [outstandingAmount]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Add Allocation" }} />
      <Text style={styles.title}>Add Allocation</Text>
      <Text style={styles.subtitle}>
        Allocate funds with transparency and evidence. Remaining:{" "}
        {remaining !== null ? `RM${remaining.toFixed(2)}` : "loading..."}
      </Text>

      {/* SECTION 1: Allocation Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Allocation Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {categories.map((c) => {
              const active = c === category;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setCategory(c);
                    if (c === "Vet") setAllocationType("Vet Visit");
                    else if (c === "Food") setAllocationType("Daily Feeding");
                  }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Allocation Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {allocationTypes.map((type) => {
              const active = type === allocationType;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setAllocationType(type)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service Provider Name</Text>
          <TextInput
            placeholder="e.g., PetCare Veterinary Clinic"
            value={serviceProvider}
            onChangeText={setServiceProvider}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Allocation Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={allocationDate}
            onChangeText={setAllocationDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Allocation Status <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {statusOptions.map((s) => {
              const active = s === status;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Total Cost (RM) <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>
            Enter the total treatment/service cost. This can exceed donations raised.
          </Text>
          <TextInput
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setErrors((prev) => ({ ...prev, amount: "" }));
            }}
            style={[styles.input, errors.amount && styles.inputError]}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}

          {/* Real-time Funding Calculation Display */}
          {amountValue > 0 && amountRaised !== null && (
            <View style={styles.calculationBox}>
              <Text style={styles.calculationTitle}>Funding Breakdown</Text>

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Donations Raised:</Text>
                <Text style={styles.calculationValue}>
                  RM{amountRaised.toFixed(2)}
                </Text>
              </View>

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Total Cost:</Text>
                <Text style={styles.calculationValue}>
                  RM{totalCost.toFixed(2)}
                </Text>
              </View>

              <View style={styles.calculationDivider} />

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Covered by Donations:</Text>
                <Text style={[styles.calculationValue, styles.coveredAmount]}>
                  RM{coveredByDonations.toFixed(2)}
                </Text>
              </View>

              {outstandingAmount > 0 && (
                <>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Outstanding Amount:</Text>
                    <Text style={[styles.calculationValue, styles.outstandingAmount]}>
                      RM{outstandingAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.fundingStatusBadge}>
                    <Text style={styles.fundingStatusText}>
                      {fundingStatus}
                    </Text>
                  </View>
                </>
              )}

              {outstandingAmount === 0 && (
                <View style={styles.fundingStatusBadge}>
                  <Text style={[styles.fundingStatusText, styles.fullyFunded]}>
                    Fully Funded
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* External Funding Section - Only shown when outstandingAmount > 0 */}
      {outstandingAmount > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>External Funding Source</Text>
          <Text style={styles.hint}>
            The total cost exceeds available donations. Please specify how the
            outstanding amount will be covered.
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>
              External Funding Source <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {externalFundingSources.map((source) => {
                const active = source === externalFundingSource;
                return (
                  <TouchableOpacity
                    key={source}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setExternalFundingSource(source);
                      setErrors((prev) => ({ ...prev, externalFunding: "" }));
                    }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {source}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.externalFunding && (
              <Text style={styles.errorText}>{errors.externalFunding}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>External Funding Notes</Text>
            <Text style={styles.hint}>
              Optional: Add details about the external funding source.
            </Text>
            <TextInput
              placeholder="e.g., Covered by shelter emergency fund, Sponsor: ABC Corp..."
              value={externalFundingNotes}
              onChangeText={setExternalFundingNotes}
              multiline
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setExternalFundingConfirmed(!externalFundingConfirmed);
                setErrors((prev) => ({
                  ...prev,
                  externalFundingConfirmed: "",
                }));
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  externalFundingConfirmed && styles.checkboxChecked,
                ]}
              >
                {externalFundingConfirmed && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I confirm the remaining cost (RM{outstandingAmount.toFixed(2)}) is
                covered by external funding
              </Text>
            </TouchableOpacity>
            {errors.externalFundingConfirmed && (
              <Text style={styles.errorText}>
                {errors.externalFundingConfirmed}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* SECTION 2: Evidence Upload */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Evidence Upload</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Receipt / Invoice{" "}
            {(category === "Vet" || category === "Medication") && (
              <Text style={styles.required}>*</Text>
            )}
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickReceipt}>
            {receiptImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                <Text style={styles.imageLabel}>Receipt uploaded ✓</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>+ Upload Receipt/Invoice</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.receipt && (
            <Text style={styles.errorText}>{errors.receipt}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Treatment Photo (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickTreatmentPhoto}>
            {treatmentPhoto ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: treatmentPhoto }} style={styles.previewImage} />
                <Text style={styles.imageLabel}>Photo uploaded ✓</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>+ Upload Treatment Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION 3: Animal Condition Update */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Animal Condition Update</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Public Description</Text>
          <Text style={styles.hint}>
            This will be visible to donors. Describe how funds are being used.
          </Text>
          <TextInput
            placeholder="e.g., Luna received emergency surgery for a broken leg..."
            value={publicDescription}
            onChangeText={setPublicDescription}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Internal Notes (Admin Only)</Text>
          <Text style={styles.hint}>
            Private notes not visible to donors.
          </Text>
          <TextInput
            placeholder="Internal tracking notes..."
            value={internalNotes}
            onChangeText={setInternalNotes}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition Update</Text>
          <TextInput
            placeholder="e.g., Recovering well, stitches removed..."
            value={conditionUpdate}
            onChangeText={setConditionUpdate}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Allocation"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    fontSize: 15,
  },
  required: {
    color: colors.danger,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontStyle: "italic",
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
  inputError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  remainingText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  uploadButton: {
    marginTop: 8,
  },
  uploadPlaceholder: {
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  uploadText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  imagePreview: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageLabel: {
    backgroundColor: colors.primary,
    color: colors.surface,
    padding: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  calculationBox: {
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  coveredAmount: {
    color: colors.primary,
  },
  outstandingAmount: {
    color: colors.warning,
  },
  calculationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  fundingStatusBadge: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
  },
  fundingStatusText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 13,
  },
  fullyFunded: {
    backgroundColor: colors.success,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheckmark: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});