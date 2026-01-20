import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AnimalFormData,
  fetchAnimalDetails,
  updateAnimal,
} from "../../services/api";
import { colors } from "../../theme/colors";
import { getImageUrl } from "../../utils/imageHelper";

const animalTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const statusOptions: AnimalFormData["status"][] = [
  "Active",
  "Funded",
  "Adopted",
  "Archived",
];

interface FormState {
  name: string;
  type: string;
  story: string;
  fundingGoal: string;
  amountRaised: string;
  status: AnimalFormData["status"];
  existingPhotoUrl?: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  story?: string;
  fundingGoal?: string;
  amountRaised?: string;
  status?: string;
}

export default function EditAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<FormState | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAnimal = async () => {
      if (!id) return;
      try {
        const data = await fetchAnimalDetails(id);
        setForm({
          name: data.name,
          type: data.type,
          story: data.story,
          fundingGoal: String(data.fundingGoal),
          amountRaised: String(data.amountRaised),
          status: data.status,
          existingPhotoUrl: data.photoURL,
        });
      } catch (error) {
        console.error("Fetch animal error:", error);
        Alert.alert(
          "Error",
          "Unable to load animal profile. Returning to dashboard.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/admin/dashboard"),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    };

    if (!form) {
      loadAnimal();
    }
  }, [id]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to upload images."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const validate = (): boolean => {
    if (!form) return false;
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (!form.story.trim()) {
      newErrors.story = "Rescue story is required";
    }

    const fundingGoalValue = Number(form.fundingGoal);
    if (Number.isNaN(fundingGoalValue) || fundingGoalValue <= 0) {
      newErrors.fundingGoal = "Funding goal must be greater than 0";
    }

    const amountRaisedValue = Number(form.amountRaised);
    if (Number.isNaN(amountRaisedValue) || amountRaisedValue < 0) {
      newErrors.amountRaised = "Amount raised must be 0 or greater";
    }

    if (!form.type) {
      newErrors.type = "Type is required";
    }

    if (!form.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!form || !id) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData: AnimalFormData = {
        name: form.name.trim(),
        type: form.type,
        story: form.story.trim(),
        fundingGoal: Number(form.fundingGoal),
        amountRaised: Number(form.amountRaised),
        status: form.status,
        // Only include photo if a new one was selected
        photo: selectedImage
          ? {
            uri: selectedImage,
            type: "image/jpeg",
            name: "photo.jpg",
          }
          : undefined,
      };

      await updateAnimal(Number(id), formData);

      Alert.alert("Success", "Animal profile updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Update animal error:", error?.response || error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update animal profile. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const displayImage = selectedImage || getImageUrl(form.existingPhotoUrl);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            maxLength={100}
            onChangeText={(text) => updateField("name", text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Type *</Text>
          <View style={styles.optionRow}>
            {animalTypes.map((type) => {
              const selected = form.type === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => updateField("type", type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Rescue Story *</Text>
          <TextInput
            style={[styles.textArea, errors.story && styles.inputError]}
            value={form.story}
            onChangeText={(text) => updateField("story", text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.story && <Text style={styles.errorText}>{errors.story}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Funding Goal (RM) *</Text>
          <TextInput
            style={[styles.input, errors.fundingGoal && styles.inputError]}
            value={form.fundingGoal}
            onChangeText={(text) =>
              updateField("fundingGoal", text.replace(/[^0-9.]/g, ""))
            }
            keyboardType="decimal-pad"
          />
          {errors.fundingGoal && (
            <Text style={styles.errorText}>{errors.fundingGoal}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amount Raised (RM)</Text>
          <TextInput
            style={[styles.input, errors.amountRaised && styles.inputError]}
            value={form.amountRaised}
            onChangeText={(text) =>
              updateField("amountRaised", text.replace(/[^0-9.]/g, ""))
            }
            keyboardType="decimal-pad"
            editable={false}
          />
          {errors.amountRaised && (
            <Text style={styles.errorText}>{errors.amountRaised}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            <Text style={styles.imagePickerText}>
              {selectedImage ? "Change Photo" : "Update Photo"}
            </Text>
          </TouchableOpacity>
          <View style={styles.imagePreview}>
            <Image source={{ uri: displayImage }} style={styles.previewImage} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status *</Text>
          <View style={styles.optionRow}>
            {statusOptions.map((status) => {
              const selected = form.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.chip, selected && styles.chipSelectedAlt]}
                  onPress={() => updateField("status", status)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextAltSelected,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.status && (
            <Text style={styles.errorText}>{errors.status}</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Updating..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.muted,
  },
  chipSelected: {
    backgroundColor: colors.success,
  },
  chipSelectedAlt: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.surface,
  },
  chipTextAltSelected: {
    color: colors.surface,
  },
  errorText: {
    color: colors.danger,
    marginTop: 6,
  },
  imagePickerButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: 12,
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
