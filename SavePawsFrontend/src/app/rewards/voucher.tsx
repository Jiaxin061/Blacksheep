import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../theme/colors";

export default function VoucherScreen() {
    const router = useRouter();
    const { data } = useLocalSearchParams<{ data: string }>();

    // Parse the redemption data passed from previous screen
    const redemption = data ? JSON.parse(data) : null;

    if (!redemption) {
        return (
            <View style={styles.center}>
                <Text>Error loading voucher.</Text>
            </View>
        );
    }

    // QR Code URL (using a public API for generation)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redemption.qrCodeData)}`;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "E-Voucher", headerLeft: () => null }} />

            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.successText}>Redemption Successful!</Text>
                </View>

                <View style={styles.qrContainer}>
                    <Image source={{ uri: qrUrl }} style={styles.qrCode} />
                    <Text style={styles.codeText}>{redemption.qrCodeData}</Text>
                </View>

                <View style={styles.details}>
                    <Text style={styles.label}>Reward</Text>
                    <Text style={styles.value}>{redemption.rewardTitle}</Text>

                    <Text style={styles.label}>Valid Until</Text>
                    <Text style={styles.value}>{new Date(redemption.expiryDate).toLocaleDateString()}</Text>

                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACTIVE</Text>
                    </View>
                </View>

                <View style={styles.instruction}>
                    <Text style={styles.instructionText}>Show this QR code at the partner location to claim your reward.</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => router.replace("/rewards/catalogue")}>
                <Text style={styles.buttonText}>Back to Catalogue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary, padding: 20, justifyContent: 'center' },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: { backgroundColor: "white", borderRadius: 20, padding: 0, overflow: "hidden", marginBottom: 20 },
    header: { backgroundColor: colors.success, padding: 16, alignItems: "center" },
    successText: { color: "white", fontWeight: "bold", fontSize: 18 },
    qrContainer: { alignItems: "center", padding: 30, borderBottomWidth: 1, borderBottomColor: colors.muted },
    qrCode: { width: 200, height: 200 },
    codeText: { marginTop: 10, color: colors.textSecondary, fontSize: 12, letterSpacing: 1 },
    details: { padding: 20 },
    label: { fontSize: 12, color: colors.textSecondary, marginTop: 10 },
    value: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
    statusBadge: { alignSelf: 'flex-start', backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginTop: 4 },
    statusText: { color: "white", fontSize: 12, fontWeight: "bold" },
    instruction: { backgroundColor: colors.background, padding: 15 },
    instructionText: { textAlign: "center", color: colors.textSecondary, fontSize: 12 },
    button: { backgroundColor: "rgba(255,255,255,0.2)", padding: 15, borderRadius: 10, alignItems: "center" },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
