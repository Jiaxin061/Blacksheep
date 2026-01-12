import { Stack, router, useLocalSearchParams } from "expo-router";
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
import { getRewardBalance, getRewardDetail, redeemReward } from "../../services/api";
import { colors } from "../../theme/colors";

export default function RewardDetailScreen() {
    const { rewardID } = useLocalSearchParams<{ rewardID: string }>();
    const [loading, setLoading] = useState(true);
    const [reward, setReward] = useState<any>(null);
    const [balance, setBalance] = useState<number>(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, [rewardID]);

    const loadData = async () => {
        try {
            if (!rewardID) return;
            const [rewardData, balanceData] = await Promise.all([
                getRewardDetail(rewardID),
                getRewardBalance()
            ]);
            setReward(rewardData);
            setBalance(balanceData.data.balance);
        } catch (error) {
            Alert.alert("Error", "Failed to load reward details.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (balance < reward.pointsRequired) {
            Alert.alert("Insufficient Points", "You need more donation points to redeem this reward.");
            return;
        }

        Alert.alert(
            "Confirm Redemption",
            `Redeem "${reward.title}" for ${reward.pointsRequired} points?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Redeem Now",
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            const result = await redeemReward(reward.rewardID);
                            // Success! Navigate to Voucher
                            Alert.alert(
                                "🎉 Success!",
                                "Reward redeemed successfully. Your voucher is ready.",
                                [{ text: "View Voucher", onPress: () => router.replace({ pathname: "/rewards/voucher", params: { data: JSON.stringify(result.data) } }) }]
                            );
                        } catch (err: any) {
                            Alert.alert("Redemption Failed", err.response?.data?.message || err.message);
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading || !reward) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const canRedeem = balance >= reward.pointsRequired;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "Reward Details" }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Image source={{ uri: reward.imageURL }} style={styles.image} />

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{reward.category}</Text>
                        </View>
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsText}>{reward.pointsRequired.toLocaleString()} pts</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{reward.title}</Text>
                    <Text style={styles.partner}>Provided by {reward.partnerName}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.text}>{reward.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                        <Text style={styles.text}>• {reward.terms}</Text>
                        <Text style={styles.text}>• Valid for {reward.validityMonths} months from redemption.</Text>
                    </View>

                    {!canRedeem && (
                        <View style={styles.infoBanner}>
                            <Text style={styles.infoText}>You need {reward.pointsRequired - balance} more points to redeem this.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Your Balance</Text>
                    <Text style={[styles.footerValue, !canRedeem && { color: colors.textSecondary }]}>{balance.toLocaleString()} pts</Text>
                </View>
                <TouchableOpacity
                    style={[styles.redeemButton, (!canRedeem || processing) && styles.disabledButton]}
                    disabled={!canRedeem || processing}
                    onPress={handleRedeem}
                >
                    {processing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.redeemButtonText}>Redeem Reward</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scroll: { paddingBottom: 100 },
    image: { width: "100%", height: 250, resizeMode: "cover" },
    content: { padding: 20 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    tag: { backgroundColor: colors.muted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    tagText: { color: colors.textSecondary, fontWeight: "600", fontSize: 12 },
    pointsBadge: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    pointsText: { color: "white", fontWeight: "bold" },
    title: { fontSize: 24, fontWeight: "bold", color: colors.textPrimary, marginBottom: 4 },
    partner: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
    text: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
    infoBanner: { backgroundColor: "#ECEFF1", padding: 12, borderRadius: 8, marginTop: 10 },
    infoText: { color: colors.textSecondary, textAlign: "center" },

    footer: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: colors.surface,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 8,
    },
    footerLabel: { fontSize: 12, color: colors.textSecondary },
    footerValue: { fontSize: 18, fontWeight: "bold", color: colors.primary },
    redeemButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 140,
        alignItems: "center",
    },
    disabledButton: { backgroundColor: "#B0BEC5" },
    redeemButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
