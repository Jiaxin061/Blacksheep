import axios from "axios";
<<<<<<< HEAD
import { useLocalSearchParams, useRouter } from "expo-router";
=======
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
import { useEffect, useState } from "react";
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
import { getAuthHeaders } from "../utils/auth";  
import { getUserProfile } from "../services/api"; 

<<<<<<< HEAD
export default function DonationScreen() {
  const router = useRouter();
  const { animalID, animalName } = useLocalSearchParams<{
    animalID: string;
    animalName: string;
  }>();

  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("Loading..."); // Default state
  const [donorEmail, setDonorEmail] = useState("Loading..."); // Default state
  const [donationType, setDonationType] = useState<"One-time" | "Monthly">("One-time");
  
  const [processing, setProcessing] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // New loading state for user data
  
  const [errors, setErrors] = useState<{
    amount?: string;
  }>({});

  // 1. Fetch User Data on Mount
=======
// Define navigation param types to match AppNavigator
type RootStackParamList = {
  Donation: { animalID: string; animalName: string };
};

export default function DonationScreen() {
  // Use React Navigation hooks instead of expo-router
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Donation'>>();
  
  // Extract parameters passed from AnimalDetailsScreen
  const { animalID, animalName } = route.params || {};

  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("Loading...");
  const [donorEmail, setDonorEmail] = useState("Loading...");
  const [donationType, setDonationType] = useState<"One-time" | "Monthly">("One-time");
  
  const [processing, setProcessing] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [errors, setErrors] = useState<{ amount?: string }>({});

  // Fetch User Data on Mount to ensure logged-in context
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await getUserProfile();
<<<<<<< HEAD
        setDonorName(user.name);
        setDonorEmail(user.email);
      } catch (error) {
        console.error("Failed to load user profile", error);
        Alert.alert("Error", "Could not verify your identity. Please login again.");
        router.back();
=======
        setDonorName(user.name || "Valued Donor");
        setDonorEmail(user.email || "");
      } catch (error) {
        console.error("Failed to load user profile", error);
        Alert.alert("Error", "Could not verify your identity. Please login again.");
        navigation.goBack(); // Use React Navigation goBack
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      } finally {
        setLoadingUser(false);
      }
    }
    loadUserData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
<<<<<<< HEAD

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    }

    // Name and Email validation removed because they are now pre-filled/read-only

=======
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    }
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
<<<<<<< HEAD
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

=======
    if (!validateForm()) return;

    setProcessing(true);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    try {
      const donationData = {
        animalID: parseInt(animalID || "0"),
        donation_amount: parseFloat(donationAmount),
        type: donationType,
<<<<<<< HEAD
        donor_name: donorName, // Uses the fetched state
        donor_email: donorEmail, // Uses the fetched state
      };

      // Get auth headers
      const headers = await getAuthHeaders();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/donate`,
=======
        donor_name: donorName,
        donor_email: donorEmail,
      };

      // Get JWT headers from auth.ts
      const headers = await getAuthHeaders();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/donations`, 
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        donationData,
        { headers }
      );

      if (response.data.success) {
<<<<<<< HEAD
        const acceptedAmount = response.data.donationAmount || parseFloat(donationAmount);
        const amountAdjusted = response.data.amountAdjusted || false;
        const fundingGoalReached = response.data.fundingGoalReached || false;
        
        let message = `Thank you for your donation of $${acceptedAmount.toFixed(2)}!`;
        
        if (amountAdjusted) {
          const requestedAmount = response.data.requestedAmount || parseFloat(donationAmount);
          message += `\n\nNote: Your requested amount of $${requestedAmount.toFixed(2)} was adjusted to $${acceptedAmount.toFixed(2)} to match the remaining funding needed.`;
        }
        
        if (fundingGoalReached) {
          message += `\n\n🎉 The funding goal has been reached!`;
        }
        
        message += `\n\nTransaction ID: ${response.data.transactionID}`;
        
        Alert.alert(
          "Donation Successful!",
          message,
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
                router.back();
              },
=======
        Alert.alert(
          "Donation Successful!",
          `Thank you for your donation of $${parseFloat(donationAmount).toFixed(2)}!`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(), 
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            },
          ]
        );
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
<<<<<<< HEAD
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment processing failed. Please try again.";
      Alert.alert("Payment Failed", errorMessage, [{ text: "OK" }]);
=======
      Alert.alert("Payment Failed", error.response?.data?.message || "Processing failed.");
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    } finally {
      setProcessing(false);
    }
  };

  if (loadingUser) {
    return (
<<<<<<< HEAD
      <View style={[styles.container, styles.loadingContainer]}>
=======
      <View style={[styles.container, styles.centerContainer]}>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Make a Donation</Text>

<<<<<<< HEAD
        {/* Animal Name (Read-Only) */}
        <View style={styles.section}>
          <Text style={styles.label}>Animal</Text>
=======
        <View style={styles.section}>
          <Text style={styles.label}>Beneficiary Animal</Text>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{animalName}</Text>
          </View>
        </View>

<<<<<<< HEAD
        {/* Donation Amount (Editable) */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Donation Amount <Text style={styles.required}>*</Text>
=======
        <View style={styles.section}>
          <Text style={styles.label}>
            Donation Amount ($) <Text style={styles.required}>*</Text>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={donationAmount}
<<<<<<< HEAD
              onChangeText={(text) => {
                setDonationAmount(text.replace(/[^0-9.]/g, ""));
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
=======
              onChangeText={(text) => setDonationAmount(text.replace(/[^0-9.]/g, ""))}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!processing}
            />
          </View>
<<<<<<< HEAD
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        {/* Donor Name (Read-Only) */}
        <View style={styles.section}>
          <Text style={styles.label}>Donor Name</Text>
          {/* CHANGED: Using View/Text instead of TextInput */}
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{donorName}</Text>
          </View>
        </View>

        {/* Donor Email (Read-Only) */}
        <View style={styles.section}>
          <Text style={styles.label}>Donor Email</Text>
          {/* CHANGED: Using View/Text instead of TextInput */}
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{donorEmail}</Text>
          </View>
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
=======
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Donor Information</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{donorName} ({donorEmail})</Text>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, processing && styles.submitButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
<<<<<<< HEAD
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>Process Payment</Text>
=======
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Process Donation</Text>
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
<<<<<<< HEAD
          onPress={() => router.back()}
=======
          onPress={() => navigation.goBack()}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
=======
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { justifyContent: "center", alignItems: "center" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.textPrimary, marginBottom: 30 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 },
  required: { color: colors.danger },
  input: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingLeft: 12 },
  currencySymbol: { fontSize: 18, fontWeight: "bold", color: colors.textSecondary, marginRight: 5 },
  amountInput: { flex: 1, borderWidth: 0, paddingLeft: 0 },
  readOnlyField: { backgroundColor: colors.muted, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  readOnlyText: { fontSize: 16, color: colors.textSecondary },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 5 },
  submitButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 20 },
  submitButtonDisabled: { backgroundColor: colors.border },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelButton: { paddingVertical: 12, alignItems: "center", marginTop: 10 },
  cancelButtonText: { color: colors.textSecondary, fontSize: 16 },
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
});