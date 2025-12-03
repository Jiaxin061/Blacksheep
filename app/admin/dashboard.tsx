import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  archiveAnimal,
  deleteAnimal,
  fetchAdminAnimals,
} from "../../services/api";
import { colors } from "../../theme/colors";

type StatusFilter = "All" | "Active" | "Funded" | "Adopted" | "Archived";

interface AdminAnimal {
  animalID: number;
  name: string;
  type: string;
  story: string;
  fundingGoal: number | string;
  amountRaised: number | string;
  status: StatusFilter;
}

const statusFilters: StatusFilter[] = [
  "All",
  "Active",
  "Funded",
  "Adopted",
  "Archived",
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("All");

  const loadAnimals = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchAdminAnimals();
      setAnimals(response);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError("Failed to load animal profiles. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnimals();
    }, [loadAnimals]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimals();
  };

  const confirmDelete = (animal: AdminAnimal) => {
    const amountRaisedValue = Number(animal.amountRaised || 0);
    const hasDonations = amountRaisedValue > 0;
    const buttons = [
      { text: "Cancel", style: "cancel" as const },
    ];

    if (hasDonations) {
      buttons.push({
        text: "Archive Instead",
        onPress: () => handleArchive(animal),
      });
    }

    buttons.push({
      text: "Delete",
      style: "destructive" as const,
      onPress: () => handleDelete(animal),
    });

    Alert.alert(
      "Delete Animal Profile?",
      `Are you sure you want to delete ${animal.name}? This action cannot be undone.${
        hasDonations
          ? "\n\n⚠️ This animal has active donations. Consider archiving instead."
          : ""
      }`,
      buttons,
    );
  };

  const handleDelete = async (animal: AdminAnimal) => {
    try {
      setRefreshing(true);
      await deleteAnimal(animal.animalID);
      setAnimals((prev) =>
        prev.filter((item) => item.animalID !== animal.animalID),
      );
      Alert.alert("Profile deleted", `${animal.name} was removed.`);
    } catch (err: any) {
      console.error("Delete error:", err?.response || err);
      const message =
        err?.response?.data?.message ||
        "Unable to delete animal profile. Please try again.";
      Alert.alert("Delete failed", message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleArchive = async (animal: AdminAnimal) => {
    try {
      setRefreshing(true);
      await archiveAnimal(animal.animalID);
      setAnimals((prev) =>
        prev.map((item) =>
          item.animalID === animal.animalID
            ? { ...item, status: "Archived" }
            : item,
        ),
      );
      Alert.alert("Profile archived", `${animal.name} is now archived.`);
    } catch (err) {
      console.error("Archive error:", err);
      Alert.alert(
        "Archive failed",
        "Unable to archive animal profile. Please try again.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAnimals = useMemo(() => {
    if (filter === "All") {
      return animals;
    }
    return animals.filter((animal) => animal.status === filter);
  }, [animals, filter]);

  const renderAnimalCard = ({ item }: { item: AdminAnimal }) => {
    const fundingGoalValue = Number(item.fundingGoal || 0);
    const amountRaisedValue = Number(item.amountRaised || 0);
    const isFunded = amountRaisedValue >= fundingGoalValue;
    const isArchived = item.status === "Archived";
    const canArchive = isFunded && !isArchived;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.name} <Text style={styles.cardType}>({item.type})</Text>
          </Text>
          <Text
            style={[
              styles.statusBadge,
              item.status === "Active" && styles.activeStatus,
              item.status === "Funded" && styles.fundedStatus,
              isArchived && styles.archivedStatus,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <Text style={styles.cardStat}>
          Goal: RM{fundingGoalValue.toFixed(2)} | Raised: RM
          {amountRaisedValue.toFixed(2)}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() =>
              router.push({
                pathname: "/admin/edit-animal",
                params: { id: item.animalID.toString() },
              })
            }
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDelete(item)}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.archiveButton,
              canArchive && styles.archiveButtonEnabled,
            ]}
            disabled={!canArchive}
            onPress={() => handleArchive(item)}
          >
            <Text style={styles.actionText}>
              {isArchived ? "Archived" : "Archive"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading animal profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/admin/add-animal")}
      >
        <Text style={styles.addButtonText}>+ Add New Animal</Text>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        {statusFilters.map((status) => {
          const isActive = status === filter;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {filteredAnimals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No animal profiles found for this filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.animalID.toString()}
          renderItem={renderAnimalCard}
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
    padding: 16,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.muted,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  filterTextActive: {
    color: colors.surface,
  },
  errorContainer: {
    backgroundColor: "#FFEDED",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardType: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: colors.surface,
    fontWeight: "600",
    overflow: "hidden",
    backgroundColor: colors.neutralDark,
  },
  activeStatus: {
    backgroundColor: colors.primary,
  },
  fundedStatus: {
    backgroundColor: colors.primaryDark,
  },
  archivedStatus: {
    backgroundColor: colors.neutralDark,
  },
  cardStat: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: colors.primaryDark,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  archiveButton: {
    backgroundColor: colors.border,
  },
  archiveButtonEnabled: {
    backgroundColor: colors.primaryDark,
  },
  actionText: {
    color: colors.surface,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});


