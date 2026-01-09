// ... imports
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getRewardDetail, updateAdminReward } from "../../../../services/api";
import { colors } from "../../../../theme/colors";

export default function EditRewardScreen() {
    const { rewardID } = useLocalSearchParams<{ rewardID: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<any>({
        title: "",
        category: "",
        status: "Active",
        imageURL: "",
        newImage: null, // Stores locally picked image
    });

    useEffect(() => {
        if (rewardID) loadData();
    }, [rewardID]);

    const loadData = async () => {
        try {
            const data = await getRewardDetail(rewardID!);
            setForm({
                ...data,
                quantity: data.quantity === null ? "" : data.quantity.toString(),
                pointsRequired: data.pointsRequired.toString(),
                validityMonths: data.validityMonths.toString(),
                newImage: null
            });
        } catch (error) {
            Alert.alert("Error", "Failed to load reward details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, newImage: result.assets[0] });
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Create FormData
            const formData = new FormData();
            formData.append("description", form.description);
            formData.append("pointsRequired", form.pointsRequired);
            formData.append("validityMonths", form.validityMonths);
            formData.append("status", form.status);
            if (form.terms) formData.append("terms", form.terms);
            if (form.quantity) formData.append("quantity", form.quantity);

            // Handle Image Update
            if (form.newImage) {
                const uriParts = form.newImage.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append("image", {
                    uri: form.newImage.uri,
                    name: `reward_update_${Date.now()}.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            }

            await updateAdminReward(rewardID!, formData);

            Alert.alert("Success", "Reward updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update reward");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color={colors.primary} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: "Edit Reward" }} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{form.title}</Text>
                <Text style={styles.headerSub}>{form.partnerName}</Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Reward Image</Text>

                {/* 1. Show New Image if picked */}
                {form.newImage ? (
                    <View>
                        <Image source={{ uri: form.newImage.uri }} style={styles.previewImage} />
                        <TouchableOpacity onPress={pickImage}><Text style={styles.changeImageText}>Change Image</Text></TouchableOpacity>
                    </View>
                ) : form.imageURL ? (
                    /* 2. Else Show Existing URL */
                    <View>
                        <Image source={{ uri: form.imageURL }} style={styles.previewImage} />
                        <TouchableOpacity onPress={pickImage}><Text style={styles.changeImageText}>Replace Image</Text></TouchableOpacity>
                    </View>
                ) : (
                    /* 3. Else Show Placeholder */
                    <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
                        <Text style={styles.placeholderText}>Tap to add image</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusRow}>
                    <Text style={[styles.statusText, { color: form.status === 'Active' ? 'green' : 'grey' }]}>
                        {form.status}
                    </Text>
                    <Switch
                        value={form.status === 'Active'}
                        onValueChange={(v) => setForm({ ...form, status: v ? 'Active' : 'Archived' })}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    multiline
                />
            </View>

            {/* Removed Raw Image URL Input */}

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Points Cost</Text>
                    <TextInput
                        style={styles.input}
                        value={form.pointsRequired}
                        onChangeText={(t) => setForm({ ...form, pointsRequired: t })}
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Validity (Months)</Text>
                    <TextInput
                        style={styles.input}
                        value={form.validityMonths}
                        onChangeText={(t) => setForm({ ...form, validityMonths: t })}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Quantity (Empty = Unlimited)</Text>
                <TextInput
                    style={styles.input}
                    value={form.quantity}
                    onChangeText={(t) => setForm({ ...form, quantity: t })}
                    keyboardType="numeric"
                />
                <Text style={styles.hint}>If quantity hits 0, item will auto-archive.</Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Terms & Conditions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.terms}
                    onChangeText={(t) => setForm({ ...form, terms: t })}
                    multiline
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Save Changes</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: colors.textPrimary },
    headerSub: { fontSize: 16, color: colors.textSecondary },

    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 },
    input: {
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16
    },
    textArea: { height: 100, textAlignVertical: "top" },
    row: { flexDirection: "row" },
    hint: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

    statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, padding: 10, borderRadius: 8 },
    statusText: { fontSize: 16, fontWeight: "bold" },

    submitButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 40
    },
    disabledButton: { backgroundColor: colors.muted },
    submitText: { color: "white", fontSize: 18, fontWeight: "bold" },

    previewImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 10, resizeMode: "cover" },
    placeholder: {
        width: "100%",
        height: 150,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#DDD",
        borderStyle: "dashed"
    },
    placeholderText: { color: "#888", fontSize: 16 },
    changeImageText: { color: colors.primary, fontWeight: "600", textAlign: "center", marginTop: 4 },
});
