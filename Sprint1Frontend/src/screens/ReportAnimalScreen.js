import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS, ANIMAL_TYPES } from '../utils/constants';
import { createReport } from '../services/api';

const ReportAnimalScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    animalType: '',
    description: '',
    location: '',
    coordinates: null,
    reporterName: '',
    reporterContact: '',
    imageUri: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Update form field
  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Request camera permissions and take photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        updateField('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error(error);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        updateField('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      updateField('coordinates', { latitude, longitude });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const { street, city, region, country } = address[0];
        const fullAddress = [street, city, region, country].filter(Boolean).join(', ');
        updateField('location', fullAddress);
      } else {
        updateField('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      console.error(error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.animalType) {
      Alert.alert('Validation Error', 'Please select an animal type');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please provide a description');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please provide a location');
      return false;
    }
    if (!formData.reporterName.trim()) {
      Alert.alert('Validation Error', 'Please provide your name');
      return false;
    }
    if (!formData.reporterContact.trim()) {
      Alert.alert('Validation Error', 'Please provide your contact information');
      return false;
    }
    return true;
  };

  // Submit report
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const reportData = {
        animal_type: formData.animalType,
        description: formData.description,
        location: formData.location,
        latitude: formData.coordinates?.latitude || null,
        longitude: formData.coordinates?.longitude || null,
        reporter_name: formData.reporterName,
        reporter_contact: formData.reporterContact,
        image_url: formData.imageUri || null, // In real app, upload to server first
        status: 'pending',
      };

      await createReport(reportData);

      Alert.alert(
        'Success',
        'Animal report submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Reset form
      setFormData({
        animalType: '',
        description: '',
        location: '',
        coordinates: null,
        reporterName: '',
        reporterContact: '',
        imageUri: null,
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Report an Animal in Need</Text>
        <Text style={styles.subtitle}>
          Help us help animals by providing detailed information
        </Text>

        {/* Animal Type Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Animal Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.animalType}
              onValueChange={(value) => updateField('animalType', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select animal type..." value="" />
              {ANIMAL_TYPES.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the animal's condition, behavior, and any immediate concerns..."
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location or address"
            value={formData.location}
            onChangeText={(text) => updateField('location', text)}
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo (Optional)</Text>
          {formData.imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => updateField('imageUri', null)}
              >
                <Text style={styles.removeImageText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>🖼️ Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Reporter Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={formData.reporterName}
            onChangeText={(text) => updateField('reporterName', text)}
          />
        </View>

        {/* Reporter Contact */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Information *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number or email"
            value={formData.reporterContact}
            onChangeText={(text) => updateField('reporterContact', text)}
            keyboardType="email-address"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.requiredNote}>* Required fields</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  locationButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  requiredNote: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default ReportAnimalScreen;