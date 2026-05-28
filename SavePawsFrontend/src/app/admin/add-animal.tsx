// app/admin/add-animal.tsx

import axios from "axios"; // ADD THIS LINE
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { API_BASE_URL } from "../../config/api"; // ADD THIS LINE
import { AnimalFormData, createAnimal } from "../../services/api";
import { colors } from "../../theme/colors";

const animalTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const statusOptions: AnimalFormData["status"][] = [
  "Active",
  "Funded",
  "Adopted",
  "Archived",
];

interface FormErrors {
  name?: string;
  type?: string;
  story?: string;
  fundingGoal?: string;
  photo?: string;
  status?: string;
}

export default function AddAnimalScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: animalTypes[0],
    story: "",
    fundingGoal: "",
    status: "Active" as AnimalFormData["status"],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        setErrors((prev) => ({ ...prev, photo: undefined }));
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const validate = (): boolean => {
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

    if (!selectedImage) {
      newErrors.photo = "Please select an image";
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

  const testConnection = async () => {
    const url = `${API_BASE_URL}/health`; // Define URL here to be sure
    try {
      console.log('🔍 Testing connection to:', url); // Log the EXACT URL
      const response = await axios.get(url);
      console.log('✅ Connection test success:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Connection test failed for URL:', url); // Log URL again on error
      console.error('❌ Status Code:', error.response?.status); // Log status code
      
      Alert.alert(
        'Connection Error', 
        `Failed to reach: ${url}\nStatus: ${error.response?.status}\n\nMake sure your server.js has the /health route!`
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Test connection first
    const connected = await testConnection();
    if (!connected) return;

    setSubmitting(true);
    try {
      console.log('📝 Form data:', {
        name: form.name,
        type: form.type,
        fundingGoal: form.fundingGoal,
        status: form.status,
        hasImage: !!selectedImage,
      });

      const formData: AnimalFormData = {
        name: form.name.trim(),
        type: form.type,
        story: form.story.trim(),
        fundingGoal: Number(form.fundingGoal),
        status: form.status,
        photo: selectedImage
          ? {
              uri: selectedImage,
              type: "image/jpeg",
              name: "photo.jpg",
            }
          : null,
      };

      console.log('🚀 Calling createAnimal API...');
      await createAnimal(formData);
      
      console.log('✅ Animal created successfully');
      Alert.alert("Success", "Animal profile created successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/admin/dashboard"),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Create animal error:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create animal profile. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

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
            placeholder="Enter animal name"
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
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
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
            placeholder="Share the animal's rescue story"
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
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {errors.fundingGoal && (
            <Text style={styles.errorText}>{errors.fundingGoal}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Photo *</Text>
          <TouchableOpacity
            style={[
              styles.imagePickerButton,
              errors.photo && styles.inputError,
            ]}
            onPress={pickImage}
          >
            <Text style={styles.imagePickerText}>
              {selectedImage ? "Change Photo" : "Select Photo"}
            </Text>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </View>
          )}
          {errors.photo && (
            <Text style={styles.errorText}>{errors.photo}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status *</Text>
          <View style={styles.optionRow}>
            {statusOptions.map((status) => {
              const selected = form.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    selected && styles.chipSelectedAlt,
                  ]}
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
              {submitting ? "Saving..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    marginTop: 12,
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
