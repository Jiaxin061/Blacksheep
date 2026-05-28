import axios from "axios";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await getUserProfile();
        setDonorName(user.name || "Valued Donor");
        setDonorEmail(user.email || "");
      } catch (error) {
        console.error("Failed to load user profile", error);
        Alert.alert("Error", "Could not verify your identity. Please login again.");
        navigation.goBack(); // Use React Navigation goBack
      } finally {
        setLoadingUser(false);
      }
    }
    loadUserData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      const donationData = {
        animalID: parseInt(animalID || "0"),
        donation_amount: parseFloat(donationAmount),
        type: donationType,
        donor_name: donorName,
        donor_email: donorEmail,
      };

      // Get JWT headers from auth.ts
      const headers = await getAuthHeaders();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/donations`, 
        donationData,
        { headers }
      );

      if (response.data.success) {
        Alert.alert(
          "Donation Successful!",
          `Thank you for your donation of $${parseFloat(donationAmount).toFixed(2)}!`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(), 
            },
          ]
        );
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert("Payment Failed", error.response?.data?.message || "Processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loadingUser) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Make a Donation</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Beneficiary Animal</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{animalName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Donation Amount ($) <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={donationAmount}
              onChangeText={(text) => setDonationAmount(text.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!processing}
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Donor Information</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{donorName} ({donorEmail})</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, processing && styles.submitButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Process Donation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});