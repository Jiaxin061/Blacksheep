// File: volunteerRegistrationPage.js (Route: /volunteer/registration)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AIAssistantFAB from '../components/AIAssistantFAB';
import { VolunteerController } from '../controller/VolunteerController';

// Using the generated image path directly as a source requires it to be a remote URL or a local require.
// Since the environment treats the artifact path as local file system, we assume we can require it
// or use a placeholder if the local file system access is restricted in the react-native bundler.
// For this demo, we will use a URI that points to the artifact or a placeholder if that fails.
// NOTE: In a real Expo app, allow-listing local files is needed. We will use a network placeholder for safety if needed,
// but let's try to use the artifact path logic or a similar reliable source.
// Ideally, we upload this asset to the assets folder. For now, I will use a high-quality placeholder that matches the description
// to ensure it renders for the user without complex asset linking steps mid-session.
const HEADER_IMAGE_URI = 'https://img.freepik.com/free-vector/cat-lover-concept-illustration_114360-3184.jpg'; // Similar vibes placeholder

const Colors = {
    primary: '#3b82f6', // Bright Blue
    secondary: '#10b981', // Green for success
    text: '#1f2937',
    textSecondary: '#6b7280',
    background: '#ffffff',
    inputBorder: '#e5e7eb',
    inputBg: '#f9fafb',
    successBorder: '#4ade80',
    successText: '#16a34a',
};

const MOCK_USER_ID = 2;

const VolunteerRegistrationScreen = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        userName: '',
        address: '',
        experience: '',
        capability: '',
    });
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fields definition for cleaner rendering loop
    const fields = [
        { id: 'userName', label: 'Name', placeholder: 'Enter your full name', type: 'text' },
        { id: 'address', label: 'Location', placeholder: 'e.g. No. 123, Jalan Skudai...', type: 'text' },
        { id: 'experience', label: 'Describe Your Experience', placeholder: 'Briefly describe (e.g. I volunteered at the local animal shelter...) ', type: 'multiline' },
        { id: 'capability', label: 'What are your capabilities?', placeholder: 'e.g., Driving, First Aid', type: 'multiline' },
    ];

    // Computed progress
    const completedCount = useMemo(() => {
        return Object.values(formData).filter(val => val && val.trim().length > 0).length;
    }, [formData]);

    const progress = completedCount / fields.length;

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async () => {
        // Final validation check
        if (completedCount < fields.length) {
            Alert.alert("Incomplete", "Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { success, message } = await VolunteerController.submitRegistration(MOCK_USER_ID, formData);
            if (success) {
                Alert.alert("Success", "Registration submitted successfully!", [
                    { text: "OK", onPress: () => router.replace('/pages/homepage') }
                ]);
            } else {
                Alert.alert("Error", message, [
                    { text: "OK", onPress: () => router.replace('/pages/homepage') }
                ]);
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header: Back Button */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/images/cat_registration_header.png')}
                        style={styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                {/* 2. Welcome Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Welcome To Registration 👋</Text>
                    <Text style={styles.subtitle}>Join as volunteer to help more animals</Text>
                </View>

                {/* 3. Form Fields */}
                <View style={styles.formContainer}>
                    {fields.map((field, index) => {
                        const isFilled = formData[field.id] && formData[field.id].trim().length > 0;
                        const isMultiline = field.type === 'multiline';

                        return (
                            <View key={field.id} style={styles.fieldGroup}>
                                {/* Label with Number */}
                                <Text style={styles.label}>{index + 1}. {field.label} *</Text>

                                <TextInput
                                    style={[
                                        styles.input,
                                        isMultiline && styles.textArea,
                                        isFilled && styles.inputSuccess // Green border if filled
                                    ]}
                                    placeholder={field.placeholder}
                                    value={formData[field.id]}
                                    onChangeText={(text) => handleChange(field.id, text)}
                                    onBlur={() => handleBlur(field.id)}
                                    multiline={isMultiline}
                                    numberOfLines={isMultiline ? 3 : 1}
                                    editable={!isSubmitting}
                                />

                                {/* Validation Message */}
                                {isFilled ? (
                                    <View style={styles.validationRow}>
                                        <Ionicons name="checkmark-sharp" size={16} color={Colors.successText} />
                                        <Text style={styles.validationText}>
                                            {field.id === 'userName' || field.id === 'address' ? 'Looks good!' : 'Great!'}
                                        </Text>
                                    </View>
                                ) : (
                                    // Spacer to prevent layout jump logic if needed, or just standard margin
                                    <View style={{ height: 4 }} />
                                )}
                            </View>
                        );
                    })}
                </View>

            </ScrollView>

            {/* 4. Footer: Progress & Button */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
                style={styles.footer}
            >
                {/* Progress Info */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{completedCount}/{fields.length} required fields completed</Text>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (completedCount < fields.length || isSubmitting) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={completedCount < fields.length || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Registration</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <AIAssistantFAB bottom={130} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    navHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 160, // Space for footer
    },
    imageContainer: {
        height: 200,
        backgroundColor: '#d6fffafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerImage: {
        height: '100%',
    },
    titleContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.inputBg,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    inputSuccess: {
        borderColor: Colors.successBorder,
        backgroundColor: '#f0fdf4', // Very light green
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    validationText: {
        color: Colors.successText,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30, // Safe area
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        marginBottom: 8,
        fontSize: 13,
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#14b8a6', // Lighter blue
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default VolunteerRegistrationScreen;