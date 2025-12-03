import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimalPayload, createAnimal } from "../../services/api";
import { colors } from "../../theme/colors";

const animalTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const statusOptions: AnimalPayload["status"][] = [
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
  photoURL?: string;
  status?: string;
}

export default function AddAnimalScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: animalTypes[0],
    story: "",
    fundingGoal: "",
    photoURL: "",
    status: "Active" as AnimalPayload["status"],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
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

    try {
      const url = new URL(form.photoURL);
      if (!["http:", "https:"].includes(url.protocol)) {
        newErrors.photoURL = "Photo URL must start with http or https";
      }
    } catch {
      newErrors.photoURL = "A valid photo URL is required";
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
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: AnimalPayload = {
        name: form.name.trim(),
        type: form.type as AnimalPayload["type"],
        story: form.story.trim(),
        fundingGoal: Number(form.fundingGoal),
        photoURL: form.photoURL.trim(),
        status: form.status,
      };

      await createAnimal(payload);
      Alert.alert("Success", "Animal profile created successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/admin/dashboard"),
        },
      ]);
    } catch (error: any) {
      console.error("Create animal error:", error?.response || error);
      const message =
        error?.response?.data?.message ||
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
          <Text style={styles.label}>Photo URL *</Text>
          <TextInput
            style={[styles.input, errors.photoURL && styles.inputError]}
            value={form.photoURL}
            onChangeText={(text) => updateField("photoURL", text)}
            placeholder="https://example.com/photo.jpg"
            autoCapitalize="none"
          />
          {errors.photoURL && (
            <Text style={styles.errorText}>{errors.photoURL}</Text>
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


