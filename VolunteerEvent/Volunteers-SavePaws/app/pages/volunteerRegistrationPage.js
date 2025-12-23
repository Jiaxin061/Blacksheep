// File: volunteerRegistrationPage.js (Route: /volunteer/registration)
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Embedded Constants (Teal Theme) ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#ccfbf1',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', success: '#10b981',
};
const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 4, m: 8, l: 12, xl: 16 };
// ---------------------------------------

// --- EMBEDDED MOCK REGISTRATION STATUS LOGIC (MUST MATCH homepage.js) ---
let isUserRegisteredMock = false;

const useRegistrationStatus = () => ({
  // MOCK: Function to update the mock state upon successful registration
  setRegistered: () => {
    isUserRegisteredMock = true;
  }
});
// ------------------------------------------------------------------------

// --- Embedded Mock Controller Logic (Simulates calling Java RegistrationController) ---
const mockController = () => ({
    // Simulates calling RegistrationController.submitRegistration(application)
    submitRegistration: async (application) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Simulates InputValidationService check
        if (!application.userName || !application.address || !application.experience || !application.capability) {
            return { success: false, message: "Validation failed: Please fill in all required fields." };
        }
        
        // Simulates successful save and updates the shared mock status
        useRegistrationStatus().setRegistered(); 

        return { success: true, message: "Application submitted successfully! You are now a registered volunteer." };
    }
});
// -------------------------------------------------------------------------------------


const VolunteerRegistrationScreen = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        userName: '',
        address: '',
        experience: '',
        capability: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const { success, message } = await mockController().submitRegistration(formData);
        setIsSubmitting(false);

        if (success) {
            Alert.alert("Success", message, [
                // Navigates back to HomePage, which will now redirect to the Contribution Page
                { text: "OK", onPress: () => navigation.navigate('HomePage') } 
            ]);
        } else {
            Alert.alert("Error", message);
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.header}>Volunteer Registration</Text>
                <Text style={styles.subheader}>Fill in your details to apply as a volunteer.</Text>
                
                {/* Form Inputs (truncated for brevity) */}
                <Text style={styles.label}>Full Name*</Text>
                <TextInput
                    style={styles.input}
                    value={formData.userName}
                    onChangeText={(text) => handleChange('userName', text)}
                    placeholder="Enter your full name"
                    editable={!isSubmitting}
                />
                
                <Text style={styles.label}>Address*</Text>
                <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(text) => handleChange('address', text)}
                    placeholder="Residential address"
                    editable={!isSubmitting}
                />

                <Text style={styles.label}>Past Volunteer Experience*</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.experience}
                    onChangeText={(text) => handleChange('experience', text)}
                    placeholder="Briefly describe your experience"
                    multiline
                    numberOfLines={4}
                    editable={!isSubmitting}
                />

                <Text style={styles.label}>Special Skills/Capabilities*</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.capability}
                    onChangeText={(text) => handleChange('capability', text)}
                    placeholder="e.g., First Aid, Driving, Technical skills"
                    multiline
                    numberOfLines={4}
                    editable={!isSubmitting}
                />

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[styles.button, isSubmitting && { opacity: 0.6 }]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
                </TouchableOpacity>

                {/* Cancel Button (Alternative Flow 1.1) */}
                 <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => navigation.goBack()}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white, },
    formContainer: { padding: Spacing.l, },
    header: { fontSize: 24, fontWeight: '700', color: Colors.primaryDark, marginBottom: Spacing.s, },
    subheader: { fontSize: 16, color: Colors.textSecondary, marginBottom: Spacing.xl, },
    label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: Spacing.m, marginBottom: Spacing.xs, },
    input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.m, padding: Spacing.s, fontSize: 16, color: Colors.text, },
    textArea: { height: 100, textAlignVertical: 'top', paddingVertical: Spacing.s, },
    button: { backgroundColor: Colors.primary, padding: Spacing.m, borderRadius: BorderRadius.l, alignItems: 'center', marginTop: Spacing.l, },
    buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700', },
    cancelButton: { marginTop: Spacing.m, alignItems: 'center', },
    cancelButtonText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', }
});

export default VolunteerRegistrationScreen;