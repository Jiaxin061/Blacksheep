import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { colors } from "../theme/colors";

interface Animal {
  animalID: number;
  name: string;
  type: string;
  story: string;
  fundingGoal: number;
  amountRaised: number;
  status: string;
  photoURL: string;
  createdAt: string;
}

export default function AnimalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAnimalDetails();
    }
  }, [id]);

  const fetchAnimalDetails = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/animals/${id}`);
      setAnimal(response.data);
    } catch (err: any) {
      console.error("Error fetching animal details:", err);
      if (err.response?.status === 404) {
        setError("Animal not found");
      } else {
        setError("Failed to load animal details. Please try again.");
      }
      Alert.alert("Error", "Failed to load animal details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = () => {
    if (animal) {
      router.push({
        pathname: "/donation",
        params: {
          animalID: animal.animalID.toString(),
          animalName: animal.name,
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading animal details...</Text>
      </View>
    );
  }

  if (error || !animal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Animal not found"}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fundingGoalValue = Number(animal.fundingGoal ?? 0);
  const amountRaisedValue = Number(animal.amountRaised ?? 0);
  const progress =
    fundingGoalValue > 0
      ? (amountRaisedValue / fundingGoalValue) * 100
      : 0;
  const remaining = Math.max(0, fundingGoalValue - amountRaisedValue);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: animal.photoURL || "https://via.placeholder.com/400" }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{animal.name}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.type}>{animal.type}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  animal.status === "Active"
                    ? colors.primary
                    : animal.status === "Funded"
                    ? colors.primaryDark
                    : animal.status === "Adopted"
                    ? colors.success
                    : colors.neutralDark,
              },
            ]}
          >
            <Text style={styles.statusText}>{animal.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rescue Story</Text>
          <Text style={styles.story}>{animal.story}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funding Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Raised</Text>
                <Text style={styles.statValue}>
                  {`$${amountRaisedValue.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>
                  {`$${fundingGoalValue.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statValue}>
                  {`$${remaining.toFixed(2)}`}
                </Text>
              </View>
            </View>
            <Text style={styles.progressPercentage}>
              {progress.toFixed(1)}% Complete
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.donateButton,
            animal.status !== "Active" && styles.donateButtonDisabled,
          ]}
          onPress={handleDonate}
          disabled={animal.status !== "Active"}
        >
          <Text
            style={[
              styles.donateButtonText,
              animal.status !== "Active" && styles.donateButtonTextDisabled,
            ]}
          >
            {animal.status === "Active" ? "Donate Now" : "Donations Closed"}
          </Text>
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
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  type: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  story: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.muted,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  progressPercentage: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryDark,
    marginTop: 5,
  },
  donateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  donateButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "bold",
  },
  donateButtonDisabled: {
    backgroundColor: colors.border,
  },
  donateButtonTextDisabled: {
    color: colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});

