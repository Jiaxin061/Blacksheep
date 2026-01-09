import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getRewardBalance, getRewardCatalogue } from "../../services/api";
import { colors } from "../../theme/colors";

export default function RewardCatalogueScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<any>(null);
    const [catalogue, setCatalogue] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [balanceData, catalogueData] = await Promise.all([
                getRewardBalance(),
                getRewardCatalogue()
            ]);
            setBalance(balanceData.data);
            setCatalogue(catalogueData);
        } catch (error) {
            console.error("Failed to load rewards:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderRewardItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: "/rewards/[rewardID]", params: { rewardID: item.rewardID } })}
        >
            <Image source={{ uri: item.imageURL }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={styles.badgeContainer}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPartner}>by {item.partnerName}</Text>
                <View style={styles.pointsRow}>
                    <Text style={styles.pointsValue}>{item.pointsRequired.toLocaleString()} pts</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "Reward Catalogue" }} />

            {/* Points Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerLabel}>Available Points</Text>
                    <Text style={styles.headerValue}>{balance?.balance?.toLocaleString() || 0} pts</Text>
                </View>
                <TouchableOpacity style={styles.historyButton} onPress={() => router.push("/rewards/history")}>
                    <Text style={styles.historyButtonText}>History</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={catalogue}
                renderItem={renderRewardItem}
                keyExtractor={item => item.rewardID}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                numColumns={2}
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>Redeem for your pets</Text>
                        {balance?.expiringPoints > 0 && (
                            <View style={styles.warningBanner}>
                                <Text style={styles.warningText}>
                                    ⚠️ {balance.expiringPoints} points expiring soon!
                                </Text>
                            </View>
                        )}
                    </>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.primaryDark,
        padding: 20,
        paddingTop: 10,
    },
    headerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
    headerValue: { color: "white", fontSize: 28, fontWeight: "bold" },
    historyButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    historyButtonText: { color: "white", fontWeight: "600" },
    listContent: { padding: 16 },
    columnWrapper: { justifyContent: "space-between" },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 16,
    },
    warningBanner: {
        backgroundColor: "#FFF3E0",
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    warningText: { color: colors.warning, fontWeight: "600" },

    // Card
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        width: "48%",
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardImage: { width: "100%", height: 120, resizeMode: "cover" },
    cardContent: { padding: 12 },
    badgeContainer: { flexDirection: 'row', marginBottom: 6 },
    categoryBadge: {
        backgroundColor: colors.muted,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: { fontSize: 10, color: colors.textSecondary, fontWeight: "600" },
    cardTitle: { fontSize: 14, fontWeight: "bold", color: colors.textPrimary, marginBottom: 4, height: 40 },
    cardPartner: { fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
    pointsRow: { flexDirection: "row", alignItems: "center" },
    pointsValue: { fontSize: 14, fontWeight: "bold", color: colors.primary },
});
