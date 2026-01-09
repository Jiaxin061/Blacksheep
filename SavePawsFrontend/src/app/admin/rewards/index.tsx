import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { deleteAdminReward, fetchAdminRewards } from "../../../services/api";
import { colors } from "../../../theme/colors";

export default function AdminRewardListScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [rewards, setRewards] = useState<any[]>([]);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            setLoading(true);
            const response = await fetchAdminRewards();
            if (response.success) {
                setRewards(response.data);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load rewards");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (rewardID: string) => {
        Alert.alert(
            "Delete Reward",
            "Are you sure you want to delete this reward? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteAdminReward(rewardID);
                            Alert.alert("Success", "Reward deleted");
                            loadRewards();
                        } catch (error: any) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to delete");
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.badge, item.status === 'Active' ? styles.activeBadge : styles.archivedBadge]}>
                    <Text style={[styles.badgeText, item.status === 'Active' ? styles.activeText : styles.archivedText]}>
                        {item.status}
                    </Text>
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.partnerName} • {item.category}</Text>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Points</Text>
                    <Text style={styles.statValue}>{item.pointsRequired}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Stock</Text>
                    <Text style={[styles.statValue, item.quantity === 0 && { color: 'red' }]}>
                        {item.quantity === null ? '∞' : item.quantity}
                    </Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Validity</Text>
                    <Text style={styles.statValue}>{item.validityMonths} mth</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({ pathname: "/admin/rewards/edit/[rewardID]", params: { rewardID: item.rewardID } })}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.rewardID)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Manage Rewards",
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push("/admin/rewards/add")}>
                            <Text style={styles.addButton}>+ Add</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={rewards}
                    renderItem={renderItem}
                    keyExtractor={item => item.rewardID}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No rewards found.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addButton: { fontSize: 18, color: colors.primary, fontWeight: "bold", marginRight: 10 },
    list: { padding: 16 },
    empty: { textAlign: "center", marginTop: 40, color: colors.textSecondary },

    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    activeBadge: { backgroundColor: "#E8F5E9" },
    archivedBadge: { backgroundColor: "#ECEFF1" },
    badgeText: { fontSize: 12, fontWeight: "600" },
    activeText: { color: "#2E7D32" },
    archivedText: { color: "#546E7A" },
    date: { fontSize: 12, color: colors.textSecondary },

    title: { fontSize: 18, fontWeight: "bold", color: colors.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },

    statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, backgroundColor: colors.background, padding: 10, borderRadius: 8 },
    stat: { alignItems: "center", flex: 1 },
    statLabel: { fontSize: 12, color: colors.textSecondary },
    statValue: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },

    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    editButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 6 },
    editButtonText: { color: "white", fontWeight: "600" },
    deleteButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#FFEBEE", borderRadius: 6 },
    deleteButtonText: { color: "#D32F2F", fontWeight: "600" },
});
