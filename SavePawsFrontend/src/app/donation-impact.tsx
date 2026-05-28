import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDonationImpact } from "../services/api";
import { colors } from "../theme/colors";
import { getImageUrl } from "../utils/imageHelper";

// Raw response from API
interface TransactionImpact {
  transactionID: number;
  animalID: number;
  animalName: string;
  animalType: string;
  photoURL: string;
  donationAmount: number;
  donationDate: string;
  totalAllocated: number;
  allocationStatus: string; // e.g., "FULLY_ALLOCATED", "PARTIALLY_ALLOCATED", "NOT_ALLOCATED"
}

// Grouped for display
interface AnimalImpactSummary {
  animalID: number;
  animalName: string;
  animalType: string;
  photoURL: string;
  totalUserDonated: number;
  donationCount: number;
  lastDonationDate: string;
  hasAllocation: boolean;
}

export default function DonationImpactScreen() {
  const router = useRouter();
  const [impactList, setImpactList] = useState<AnimalImpactSummary[]>([]);
  const [totalDonatedAll, setTotalDonatedAll] = useState(0);
  const [totalAnimals, setTotalAnimals] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const loadImpact = async () => {
    try {
      setError(null);
      const data = await getDonationImpact();
      
      setTotalDonatedAll(data.totalDonated || 0);

      // The 'donations' array from backend is ALREADY grouped by animal
      const animalsList = data.donations || [];

      // Map backend structure to frontend interface
      const formattedList: AnimalImpactSummary[] = animalsList.map((animal: any) => ({
        animalID: animal.animalID,
        animalName: animal.animalName,
        animalType: animal.animalType,
        photoURL: animal.photoURL,
        // Backend provides specific totals for this animal
        totalUserDonated: animal.donationAmount, 
        // FIX: Use the count from the nested history or the grouped count provided by backend
        donationCount: animal.donationHistory ? animal.donationHistory.length : 1,
        lastDonationDate: animal.donationDate,
        // Check allocation status from backend response
        hasAllocation: animal.allocationStatus !== "NOT_ALLOCATED" && animal.allocationStatus !== undefined
      }));

      setImpactList(formattedList);
      setTotalAnimals(formattedList.length);

    } catch (err: any) {
      console.error("Error loading donation impact:", err);
      setError("Failed to load donation impact. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadImpact();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadImpact();
  };

  const renderAnimalCard = ({ item }: { item: AnimalImpactSummary }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          // Link to Animal Impact View
          router.push(`/donation-impact/${item.animalID}`)
        }
      >
        <Image
          source={{ uri: getImageUrl(item.photoURL) }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.cardAnimalName}>{item.animalName}</Text>
              <Text style={styles.cardAnimalType}>{item.animalType}</Text>
            </View>
            {item.hasAllocation && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Allocated</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.cardLabel}>Your Contribution</Text>
              <Text style={styles.cardAmount}>
                ${item.totalUserDonated.toFixed(2)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>Donations</Text>
              <Text style={styles.cardValue}>{item.donationCount}x</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your impact...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (impactList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Donations Yet</Text>
        <Text style={styles.emptyText}>
          Your donation impact will appear here once you make a donation.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/animal-list")}
        >
          <Text style={styles.browseButtonText}>Browse Animals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Donation Impact</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Donated</Text>
            <Text style={styles.summaryValue}>
              ${totalDonatedAll.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Animals Supported</Text>
            <Text style={styles.summaryValue}>{totalAnimals}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={impactList}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.animalID.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardAnimalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardAnimalType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.primary + '20', // Opacity
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  }
});
