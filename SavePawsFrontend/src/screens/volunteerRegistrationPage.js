// File: volunteerRegistrationPage.js (Route: /volunteer/registration)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import * as Maps from 'react-native-maps';
const MapView = Maps.MapView || Maps.default;
const Marker = Maps.Marker;

import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Colors = {
    primary: '#14b8a6', // Teal to match Community Page
    primaryDark: '#0f766e',
    primaryLight: '#ccfbf1', // Pearl green
    secondary: '#10b981',
    text: '#1f2937',
    textSecondary: '#6b7280',
    background: '#ffffff',
    inputBorder: '#e5e7eb',
    inputBg: '#f9fafb',
    successBorder: '#4ade80',
    successText: '#16a34a',
};



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

    const [locationPermission, setLocationPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status === 'granted');
        })();
    }, []);

    // Map State (KL Sentral as default)
    const [mapRegion, setMapRegion] = useState({
        latitude: 3.1344,
        longitude: 101.6865,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const handleAddressGeocode = async (address) => {
        if (!address || address.trim().length < 5) return;
        try {
            const geocodedLocation = await Location.geocodeAsync(address);
            if (geocodedLocation && geocodedLocation.length > 0) {
                const { latitude, longitude } = geocodedLocation[0];
                setMapRegion({
                    ...mapRegion,
                    latitude,
                    longitude,
                });
            }
        } catch (error) {
            console.log('Geocoding error:', error);
        }
    };

    const handleMapPress = async (event) => {
        if (locationPermission === false) {
            Alert.alert("Permission Denied", "Please enable location permissions to use map pinning.");
            return;
        }

        const { latitude, longitude } = event.nativeEvent.coordinate;
        if (!latitude || !longitude) return;

        setMapRegion({
            ...mapRegion,
            latitude,
            longitude,
        });

        try {
            const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode && reverseGeocode.length > 0) {
                const loc = reverseGeocode[0];
                // Construct address string: "Name/Street, City, Postcode, Region, Country"
                const parts = [
                    loc.name || loc.street,
                    loc.district,
                    loc.city,
                    loc.postalCode,
                    loc.region,
                ].filter(Boolean);
                const addressStr = parts.join(', ');
                setFormData(prev => ({ ...prev, address: addressStr }));
            }
        } catch (error) {
            console.log('Reverse geocoding error:', error);
            Alert.alert("Error", "Could not fetch address for this location.");
        }
    };

    const handleZoom = (type) => {
        setMapRegion(prev => ({
            ...prev,
            latitudeDelta: type === 'in' ? prev.latitudeDelta / 2 : prev.latitudeDelta * 2,
            longitudeDelta: type === 'in' ? prev.longitudeDelta / 2 : prev.longitudeDelta * 2,
        }));
    };

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
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert("Error", "User ID not found. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const submissionData = {
                userID: userId,
                ...formData
            };

            const response = await ApiService.submitVolunteerRegistration(submissionData);

            if (response.success) {
                Alert.alert("Success", "Registration submitted successfully!", [
                    { text: "OK", onPress: () => navigation.navigate('UserHome') }
                ]);
            } else {
                Alert.alert("Error", response.message || "Submission failed");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />

            {/* Header: Back Button */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Header Image */}
                {/* 1. Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/cat_registration_header.png')}
                        style={styles.headerImage}
                        resizeMode="cover"
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
                                    onBlur={() => {
                                        handleBlur(field.id);
                                        if (field.id === 'address') {
                                            handleAddressGeocode(formData.address);
                                        }
                                    }}
                                    multiline={isMultiline}
                                    numberOfLines={isMultiline ? 3 : 1}
                                    editable={!isSubmitting}
                                />

                                {/* Map visualization for address field */}
                                {field.id === 'address' && (
                                    <View style={styles.mapWrapper}>
                                        {MapView ? (
                                            <MapView
                                                style={styles.map}
                                                region={mapRegion}
                                                onPress={handleMapPress}
                                                onLongPress={handleMapPress}
                                            >
                                                <Marker
                                                    coordinate={{
                                                        latitude: mapRegion.latitude,
                                                        longitude: mapRegion.longitude,
                                                    }}
                                                    draggable
                                                    onDragEnd={(e) => handleMapPress(e)}
                                                    title="Location"
                                                    description={formData.address}
                                                />
                                            </MapView>
                                        ) : (
                                            <View style={styles.mapError}>
                                                <Text>Map module not found</Text>
                                            </View>
                                        )}

                                        {/* Zoom Controls Overlay */}
                                        <View style={styles.zoomControls}>
                                            <TouchableOpacity
                                                style={styles.zoomButton}
                                                onPress={() => handleZoom('in')}
                                            >
                                                <Ionicons name="add" size={24} color={Colors.text} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.zoomButton}
                                                onPress={() => handleZoom('out')}
                                            >
                                                <Ionicons name="remove" size={24} color={Colors.text} />
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.mapHint}>Tap map, long press, or drag pin to adjust location</Text>
                                    </View>
                                )}

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
        backgroundColor: Colors.primary,
        color: Colors.background,
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 160,
    },
    imageContainer: {
        height: 180,
        backgroundColor: Colors.primaryLight,
        marginBottom: 16,
    },
    headerImage: {
        width: '100%',
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
    mapWrapper: {
        height: 250,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapHint: {
        fontSize: 10,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 2,
    },
    mapError: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    zoomControls: {
        position: 'absolute',
        right: 12,
        bottom: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 4,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    zoomButton: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
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