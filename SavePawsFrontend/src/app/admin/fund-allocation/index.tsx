import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchAllocationAnimals } from "../../../services/api";
import { colors } from "../../../theme/colors";
// 1. IMPORT THE HELPER
import { getImageUrl } from "../../../utils/imageHelper";

interface AllocationAnimal {
  animalID: number;
  name: string;
  type: string;
  photoURL?: string;
  fundingGoal: number;
  amountRaised: number;
  totalAllocated: number;
  remaining: number;
}

export default function FundAllocationIndex() {
  const router = useRouter();
  const [animals, setAnimals] = useState<AllocationAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnimals = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAllocationAnimals();
      setAnimals(data || []);
    } catch (err: any) {
      console.error("Allocation animals fetch error:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to load animals with active donations."
      );
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading animals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Fund Allocation" }} />
      <View style={styles.header}>
        <Text style={styles.title}>Fund Allocation</Text>
        <Text style={styles.subtitle}>
          Choose an archived animal to manage allocations.
        </Text>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={animals}
        keyExtractor={(item) => item.animalID.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadAnimals();
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No active donations yet</Text>
            <Text style={styles.muted}>
              Once animals receive donations, you can manage allocations here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              {item.photoURL ? (
                // 2. USE THE HELPER HERE
                <Image
                  source={{ uri: getImageUrl(item.photoURL) }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarLetter}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {item.remaining <= 0.01 ? (
                      <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.statusText}>Fully Allocated</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: '#FFC107' }]}>
                        <Text style={[styles.statusText, { color: '#000' }]}>Partially Allocated</Text>
                      </View>
                    )}
                    <Text style={styles.chip}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.muted}>
                  Goal RM{item.fundingGoal.toFixed(2)} · Raised RM{item.amountRaised.toFixed(2)}
                </Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>
                    Allocated RM{item.totalAllocated.toFixed(2)}
                  </Text>
                  <Text style={styles.remainingText}>
                    Remaining RM{item.remaining.toFixed(2)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.manageButton}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/admin/fund-allocation/[animalID]",
                    params: { animalID: item.animalID.toString() },
                  })
                }
              >
                <Text style={styles.manageButtonText}>Manage Allocation</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: {
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  errorCard: {
    backgroundColor: "#FFEDED",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  errorText: {
    color: colors.danger,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "column",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  cardBody: {
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  chip: {
    backgroundColor: colors.muted,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  remainingText: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  manageButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  manageButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
});