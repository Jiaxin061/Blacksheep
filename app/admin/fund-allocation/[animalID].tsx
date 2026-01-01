import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { fetchAllocationByAnimal } from "../../../services/api";
import { colors } from "../../../theme/colors";
import { getImageUrl } from "../../../utils/imageHelper";

interface AllocationEntry {
  allocationID: number;
  category: string;
  allocationType?: string;
  amount: number;
  // Enhanced funding fields
  totalCost?: number;
  donationCoveredAmount?: number;
  externalCoveredAmount?: number;
  externalFundingSource?: string;
  fundingStatus?: "Fully Funded" | "Partially Funded";
  // Existing fields
  description?: string;
  publicDescription?: string;
  allocationDate: string;
  status?: "Draft" | "Verified" | "Published";
  hasEvidence?: boolean;
  receiptImage?: string;
  treatmentPhoto?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  donorName?: string;
  transactionID?: number;
}

interface AllocationDetails {
  animal: {
    animalID: number;
    name: string;
    type: string;
    photoURL?: string;
    fundingGoal: number;
    amountRaised: number;
    status: string;
  };
  summary: {
    totalAllocated: number;
    remaining: number;
    fundingGoal: number;
    amountRaised: number;
  };
  allocations: AllocationEntry[];
}

export default function FundAllocationDetail() {
  const router = useRouter();
  const { animalID } = useLocalSearchParams<{ animalID: string }>();
  const [details, setDetails] = useState<AllocationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!animalID) return;
    try {
      setError(null);
      const data = await fetchAllocationByAnimal(animalID);
      setDetails(data);
    } catch (err: any) {
      console.error("Allocation detail fetch error:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to load allocation details for this animal."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [animalID]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading allocation details...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || "Allocation details unavailable."}
        </Text>
      </View>
    );
  }

  const { animal, summary, allocations } = details;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Allocation Details" }} />
      <View style={styles.hero}>
        {animal.photoURL ? (
          <Image
            source={{ uri: getImageUrl(animal.photoURL) }}
            style={styles.heroImage}
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={styles.heroLetter}>{animal.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.heroMeta}>
          <Text style={styles.heroTitle}>{animal.name}</Text>
          <Text style={styles.muted}>{animal.type}</Text>
          <Text style={styles.metaRow}>
            Goal RM{animal.fundingGoal.toFixed(2)} · Raised RM
            {animal.amountRaised.toFixed(2)}
          </Text>
          <View style={styles.summaryPills}>
            <Text style={styles.pillPrimary}>
              Allocated RM{summary.totalAllocated.toFixed(2)}
            </Text>
            <Text style={styles.pillSecondary}>
              Remaining RM{summary.remaining.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {animal.status === "Archived" ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/admin/fund-allocation/[animalID]/add",
                params: { animalID: animal.animalID.toString() },
              })
            }
          >
            <Text style={styles.addButtonText}>+ Add Allocation</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledBanner}>
            <Text style={styles.disabledText}>
              Fund allocation is only available after the animal is archived.
            </Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={allocations}
        keyExtractor={(item) => item.allocationID.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No allocations yet</Text>
            <Text style={styles.muted}>
              Add an allocation to start tracking spend.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadDetails} />
        }
        renderItem={({ item }) => {
          const statusColor =
            item.status === "Published"
              ? colors.primary
              : item.status === "Verified"
                ? colors.success
                : colors.neutralDark;

          const displayAmount = item.totalCost || item.amount;
          const fundingStatusColor =
            item.fundingStatus === "Fully Funded"
              ? colors.success
              : colors.warning;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/admin/fund-allocation/[animalID]/[allocationID]",
                  params: {
                    animalID: animal.animalID.toString(),
                    allocationID: item.allocationID.toString(),
                  },
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.category}</Text>
                  {item.allocationType && (
                    <Text style={styles.allocationType}>
                      · {item.allocationType}
                    </Text>
                  )}
                </View>
                <View style={styles.amountColumn}>
                  <Text style={styles.amount}>RM{displayAmount.toFixed(2)}</Text>
                  {item.fundingStatus && (
                    <View
                      style={[
                        styles.fundingStatusBadge,
                        { backgroundColor: fundingStatusColor },
                      ]}
                    >
                      <Text style={styles.fundingStatusText}>
                        {item.fundingStatus}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Funding Breakdown - Show if external funding exists */}
              {(item.externalCoveredAmount || 0) > 0 && (
                <View style={styles.fundingBreakdown}>
                  <View style={styles.fundingRow}>
                    <Text style={styles.fundingLabel}>Donations:</Text>
                    <Text style={styles.fundingValue}>
                      RM{(item.donationCoveredAmount || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.fundingRow}>
                    <Text style={styles.fundingLabel}>External:</Text>
                    <Text style={[styles.fundingValue, styles.externalAmount]}>
                      RM{(item.externalCoveredAmount || 0).toFixed(2)}
                    </Text>
                  </View>
                  {item.externalFundingSource && (
                    <View style={styles.externalSourceBadge}>
                      <Text style={styles.externalSourceText}>
                        {item.externalFundingSource}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.cardMetaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Date:</Text>
                  <Text style={styles.metaValue}>
                    {new Date(item.allocationDate).toLocaleDateString()}
                  </Text>
                </View>
                {item.status && (
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusColor }]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                )}
              </View>

              {item.publicDescription ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.publicDescription}
                </Text>
              ) : item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  {item.hasEvidence && (
                    <View style={styles.evidenceIndicator}>
                      <Text style={styles.evidenceText}>✓ Evidence</Text>
                    </View>
                  )}
                  {item.lastUpdatedBy && (
                    <Text style={styles.muted}>
                      Updated by {item.lastUpdatedBy}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: "/admin/fund-allocation/[animalID]/[allocationID]",
                      params: {
                        animalID: animal.animalID.toString(),
                        allocationID: item.allocationID.toString(),
                      },
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: "/admin/fund-allocation/[animalID]/[allocationID]",
                      params: {
                        animalID: animal.animalID.toString(),
                        allocationID: item.allocationID.toString(),
                        // Add a mode param if you want to reuse the same screen for editing
                        // mode: "edit" 
                      },
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      "Delete Allocation",
                      `Are you sure you want to delete this allocation of RM${item.amount.toFixed(2)}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            Alert.alert("Delete", "Delete functionality to be implemented");
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  muted: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  hero: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroImage: {
    width: "100%",
    height: 200,
    backgroundColor: colors.muted,
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroLetter: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  heroMeta: {
    padding: 14,
    gap: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  metaRow: {
    color: colors.textPrimary,
  },
  summaryPills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  pillPrimary: {
    backgroundColor: colors.primary,
    color: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "700",
  },
  pillSecondary: {
    backgroundColor: colors.muted,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "700",
  },
  actionsRow: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
  disabledBanner: {
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledText: {
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: "#FFEDED",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  allocationType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  amountColumn: {
    alignItems: "flex-end",
  },
  amount: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 4,
  },
  fundingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  fundingStatusText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  fundingBreakdown: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  fundingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fundingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fundingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  externalAmount: {
    color: colors.warning,
  },
  externalSourceBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primaryDark,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  externalSourceText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "600",
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  description: {
    color: colors.textSecondary,
    marginVertical: 8,
    lineHeight: 20,
    fontSize: 14,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  evidenceIndicator: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evidenceText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.muted,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: colors.primaryDark,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});