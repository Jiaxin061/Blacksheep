import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { colors } from "../theme/colors";
import { getImageUrl } from "../utils/imageHelper";
// Note: Ensure getDonationImpact is added to your services/api.ts (see Step 3 below)
import { getDonationImpact, getRewardBalance } from "../services/api";

export default function UserHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data State
  const [previewAnimals, setPreviewAnimals] = useState<any[]>([]);
  const [impactSummary, setImpactSummary] = useState<any>(null);
  const [rewardsBalance, setRewardsBalance] = useState<any>(null);

  const fetchData = async () => {
    try {
      // 1. Fetch Animals (for preview section)
      const animalsRes = await axios.get(`${API_BASE_URL}/api/animals`);
      // Filter only Active and take top 2 for preview
      const activeAnimals = animalsRes.data
        .filter((a: any) => a.status === 'Active')
        .slice(0, 2);
      setPreviewAnimals(activeAnimals);

      // 2. Fetch Impact (for impact section)
      try {
        const impactData = await getDonationImpact();
        setImpactSummary(impactData);
      } catch (e) {
        console.log("Impact data not available yet (new user)");
        setImpactSummary(null);
      }

      // 3. Fetch Rewards Balance
      try {
        const balanceData = await getRewardBalance();
        setRewardsBalance(balanceData.data);
      } catch (e) {
        console.log("Reward balance not available yet");
      }

    } catch (error) {
      console.error("Home data fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subText}>Ready to make a difference today?</Text>
        </View> */}

        {/* SECTION 1: Animals Needing Donation (Preview) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animals Needing Help</Text>
            <TouchableOpacity onPress={() => router.push("/animal-list")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalList}>
            {previewAnimals.map((animal) => (
              <TouchableOpacity
                key={animal.animalID}
                style={styles.miniCard}
                onPress={() => router.push({ pathname: "/animal-details", params: { id: animal.animalID } })}
              >
                <Image source={{ uri: getImageUrl(animal.photoURL) }} style={styles.miniImage} />
                <View style={styles.miniContent}>
                  <Text style={styles.miniName} numberOfLines={1}>{animal.name}</Text>
                  <Text style={styles.miniGoal}>Goal: ${Number(animal.fundingGoal).toFixed(0)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 2: Track Your Donation Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Donation Impact</Text>
          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <View>
                <Text style={styles.impactLabel}>Total Donated</Text>
                <Text style={styles.impactValue}>
                  ${impactSummary?.totalDonated?.toFixed(2) || "0.00"}
                </Text>
              </View>
              <View>
                <Text style={styles.impactLabel}>Donations</Text>
                <Text style={styles.impactValue}>
                  {impactSummary?.donationCount || 0}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.impactButton}
              onPress={() => router.push("/donation-impact")}
            >
              <Text style={styles.impactButtonText}>View Full Impact Record</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3: Reward Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push("/rewards/catalogue")}
          >
            <View style={styles.rewardContent}>
              <View>
                <Text style={styles.rewardLabel}>Full-Fill Points</Text>
                <Text style={styles.rewardValue}>
                  {rewardsBalance?.balance?.toLocaleString() || 0} <Text style={styles.rewardUnit}>Pts</Text>
                </Text>
                <Text style={styles.rewardSubtext}>
                  Earn more points and enjoy exclusive benefits!
                </Text>
              </View>
              <Ionicons name="gift" size={50} color="#F9A825" style={styles.giftIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 80 },
  header: { padding: 20, paddingTop: 20, backgroundColor: colors.surface, marginBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: colors.textPrimary },
  subText: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },

  section: { padding: 20, paddingTop: 0, marginBottom: 10 },
  sectionHeader: { paddingTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary },
  seeAllText: { fontSize: 16, color: colors.primary, fontWeight: "600" },

  horizontalList: { flexDirection: "row", gap: 15 },
  miniCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden", elevation: 2 },
  miniImage: { width: "100%", height: 100, resizeMode: "cover" },
  miniContent: { padding: 10 },
  miniName: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
  miniGoal: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  impactCard: { backgroundColor: colors.primary, borderRadius: 12, padding: 20 },
  impactRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  impactLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 5 },
  impactValue: { color: "white", fontSize: 24, fontWeight: "bold" },
  impactButton: { backgroundColor: "white", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  impactButtonText: { color: colors.primary, fontWeight: "bold", fontSize: 16 },

  // New Reward Card Styles
  rewardCard: {
    backgroundColor: colors.primaryDark, // Teal theme (approx #0E7F78)
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  rewardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  rewardValue: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  rewardUnit: {
    fontSize: 20,
    fontWeight: "600",
  },
  rewardSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    maxWidth: 200, // Ensure text wraps before hitting icon
  },
  giftIcon: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    transform: [{ rotate: '-10deg' }]
  }
});