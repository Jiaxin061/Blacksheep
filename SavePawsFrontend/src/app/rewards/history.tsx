import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getRewardHistory } from "../../services/api";
import { colors } from "../../theme/colors";

export default function RewardHistoryScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getRewardHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.rewardTitle}</Text>
                    <Text style={styles.partner}>{item.partnerName}</Text>
                    <Text style={styles.date}>Redeemed on {new Date(item.redeemedDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.statusCol}>
                    <View style={[styles.badge, item.status === 'Active' ? styles.badgeActive : styles.badgeUsed]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                    <Text style={styles.points}>-{item.pointsSpent} pts</Text>
                </View>
            </View>
            {item.status === 'Active' && (
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => router.push({ pathname: "/rewards/voucher", params: { data: JSON.stringify(item) } })}
                >
                    <Text style={styles.viewButtonText}>View Voucher</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "Redemption History" }} />
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.redemptionID.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No rewards redeemed yet.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    list: { padding: 16 },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    info: { flex: 1 },
    statusCol: { alignItems: "flex-end" },
    title: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
    partner: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
    date: { fontSize: 12, color: colors.textSecondary },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
    badgeActive: { backgroundColor: colors.success },
    badgeUsed: { backgroundColor: colors.textSecondary },
    badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
    points: { fontSize: 12, color: colors.danger, fontWeight: "bold" },
    viewButton: { marginTop: 12, backgroundColor: colors.muted, padding: 8, borderRadius: 8, alignItems: "center" },
    viewButtonText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
    empty: { textAlign: "center", marginTop: 40, color: colors.textSecondary },
});
