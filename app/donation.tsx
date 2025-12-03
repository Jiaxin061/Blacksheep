import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { colors } from "../theme/colors";

export default function DonationScreen() {
  const router = useRouter();
  const { animalID, animalName } = useLocalSearchParams<{
    animalID: string;
    animalName: string;
  }>();

  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState<"One-time" | "Monthly">(
    "One-time"
  );
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    name?: string;
    email?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    }

    if (!donorName.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!donorEmail.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const donationData = {
        animalID: parseInt(animalID || "0"),
        donation_amount: parseFloat(donationAmount),
        type: donationType,
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/donate`,
        donationData
      );

      if (response.data.success) {
        Alert.alert(
          "Donation Successful!",
          `Thank you for your donation of $${donationAmount}!\n\nTransaction ID: ${response.data.transactionID}`,
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
                router.back();
              },
            },
          ]
        );
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment processing failed. Please try again.";
      Alert.alert("Payment Failed", errorMessage, [{ text: "OK" }]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Make a Donation</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Animal</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{animalName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Donation Amount <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={donationAmount}
              onChangeText={(text) => {
                setDonationAmount(text.replace(/[^0-9.]/g, ""));
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!processing}
            />
          </View>
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Donor Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={donorName}
            onChangeText={(text) => {
              setDonorName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="Enter your full name"
            editable={!processing}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Donor Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={donorEmail}
            onChangeText={(text) => {
              setDonorEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!processing}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Donation Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                donationType === "One-time" && styles.typeButtonActive,
              ]}
              onPress={() => setDonationType("One-time")}
              disabled={processing}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  donationType === "One-time" && styles.typeButtonTextActive,
                ]}
              >
                One-time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                donationType === "Monthly" && styles.typeButtonActive,
              ]}
              onPress={() => setDonationType("Monthly")}
              disabled={processing}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  donationType === "Monthly" && styles.typeButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, processing && styles.submitButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
        <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>Process Payment</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  readOnlyField: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.muted,
  },
  typeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

