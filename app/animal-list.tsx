import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
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

export default function AnimalListScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/animals`);
      setAnimals(response.data);
    } catch (err: any) {
      console.error("Error fetching animals:", err);
      setError("Failed to load animals. Please try again.");
      Alert.alert(
        "Error",
        "Failed to load animals. Please check your connection.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnimals();
  };

  const renderAnimalCard = ({ item }: { item: Animal }) => {
    const fundingGoalValue = Number(item.fundingGoal ?? 0);
    const amountRaisedValue = Number(item.amountRaised ?? 0);
    const progress =
      fundingGoalValue > 0
        ? (amountRaisedValue / fundingGoalValue) * 100
        : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/animal-details?id=${item.animalID}`)}
      >
        <Image
          source={{ uri: item.photoURL || "https://via.placeholder.com/150" }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardType}>{item.type}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {`$${amountRaisedValue.toFixed(2)} / $${fundingGoalValue.toFixed(
                2,
              )}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  if (error && animals.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchAnimals();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animals Needing Donations</Text>
      {animals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No animals available</Text>
        </View>
      ) : (
        <FlatList
          data={animals}
          renderItem={renderAnimalCard}
          keyExtractor={(item) => item.animalID.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  listContent: {
    padding: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 15,
  },
  cardName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  cardType: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
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
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});


