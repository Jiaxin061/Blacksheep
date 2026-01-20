import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { createAdminReward } from "../../../services/api";
import { colors } from "../../../theme/colors";

export default function AddRewardScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<any>({
        title: "",
        partnerName: "",
        category: "Medical",
        description: "",
        pointsRequired: "",
        validityMonths: "12",
        terms: "",
        quantity: "",
        image: null,
    });

    const categories = ["Medical", "Food", "Grooming", "Utility"];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, image: result.assets[0] });
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.partnerName || !form.description || !form.pointsRequired) {
            Alert.alert("Validation Error", "Please fill in all required fields.");
            return;
        }

        try {
            setLoading(true);

            // Create FormData
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("partnerName", form.partnerName);
            formData.append("category", form.category);
            formData.append("description", form.description);
            formData.append("pointsRequired", form.pointsRequired);
            formData.append("validityMonths", form.validityMonths);
            if (form.terms) formData.append("terms", form.terms);
            if (form.quantity) formData.append("quantity", form.quantity);

            if (form.image) {
                const uriParts = form.image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append("image", {
                    uri: form.image.uri,
                    name: `reward_${Date.now()}.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            }

            // Log FormData contents
            console.log("📦 FormData contents:");
            console.log("  title:", form.title);
            console.log("  partnerName:", form.partnerName);
            console.log("  category:", form.category);
            console.log("  description:", form.description);
            console.log("  pointsRequired:", form.pointsRequired);
            console.log("  validityMonths:", form.validityMonths);
            console.log("  terms:", form.terms);
            console.log("  quantity:", form.quantity);
            console.log("  image:", form.image ? "present" : "not present");

            console.log("📤 Submitting reward creation...");
            const response = await createAdminReward(formData);
            console.log("✅ Response received:", response);

            if (response.success) {
                Alert.alert("Success", "Reward created successfully", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            }
        } catch (error: any) {
            console.error("❌ Create reward error:", error);
            const errorMessage = error.response?.data?.message
                || error.message
                || "Network error. Please check your connection and try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: "Add New Reward" }} />

            <View style={styles.formGroup}>
                <Text style={styles.label}>Reward Title *</Text>
                <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={(t) => setForm({ ...form, title: t })}
                    placeholder="e.g. Free Grooming Session"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Partner Name *</Text>
                <TextInput
                    style={styles.input}
                    value={form.partnerName}
                    onChangeText={(t) => setForm({ ...form, partnerName: t })}
                    placeholder="e.g. Happy Tails Grooming"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipContainer}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, form.category === cat && styles.activeChip]}
                            onPress={() => setForm({ ...form, category: cat })}
                        >
                            <Text style={[styles.chipText, form.category === cat && styles.activeChipText]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    multiline
                    placeholder="Describe the reward..."
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Reward Image</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {form.image ? (
                        <Image source={{ uri: form.image.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderText}>Tap to select image</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Points Cost *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.pointsRequired}
                        onChangeText={(t) => setForm({ ...form, pointsRequired: t })}
                        keyboardType="numeric"
                        placeholder="100"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Validity (Months) *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.validityMonths}
                        onChangeText={(t) => setForm({ ...form, validityMonths: t })}
                        keyboardType="numeric"
                        placeholder="12"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Quantity (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={form.quantity}
                    onChangeText={(t) => setForm({ ...form, quantity: t })}
                    keyboardType="numeric"
                    placeholder="Leave empty for unlimited"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Terms & Conditions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.terms}
                    onChangeText={(t) => setForm({ ...form, terms: t })}
                    multiline
                    placeholder="Usage details..."
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Create Reward</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20 },
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

    chipContainer: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border
    },
    activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary },
    activeChipText: { color: "white", fontWeight: "bold" },

    imagePicker: { alignItems: "center", marginBottom: 10 },
    previewImage: { width: "100%", height: 200, borderRadius: 12, resizeMode: "cover" },
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
});
