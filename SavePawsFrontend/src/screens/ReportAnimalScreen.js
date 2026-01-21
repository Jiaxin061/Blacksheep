import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

// Teal Color Theme
const COLORS = {
  primary: '#14b8a6',
  secondary: '#0f766e',
  background: '#f0fdfa',
  white: '#ffffff',
  text: '#111827',
  textLight: '#5b6b7c',
  border: '#e2e8ef',
  danger: '#ef4444',
};

const ReportAnimalScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    animalType: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    reporterName: '',
    reporterContact: '',
    imageUri: null,
  });
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, imageUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.animalType) {
      Alert.alert('Error', 'Please select animal type');
      return;
    }
    if (!formData.description) {
      Alert.alert('Error', 'Please enter description');
      return;
    }
    if (!formData.location) {
      Alert.alert('Error', 'Please enter location');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Please enter latitude and longitude');
      return;
    }
    if (!formData.reporterName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.reporterContact) {
      Alert.alert('Error', 'Please enter your contact');
      return;
    }

    // Validate lat/long format
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert('Error', 'Invalid latitude (must be between -90 and 90)');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Invalid longitude (must be between -180 and 180)');
      return;
    }

    setLoading(true);

    try {
      // Upload image first if present
      let imageUrl = null;
      if (formData.imageUri) {
        const uploadResponse = await ApiService.uploadImage(formData.imageUri);
        if (uploadResponse.success) {
          imageUrl = uploadResponse.imageUrl;
        }
      }

      // Retrieve userID from storage
      const userID = await AsyncStorage.getItem('userId');

      // Prepare report data
      const reportData = {
        userID: userID,
        animal_type: formData.animalType,
        description: formData.description,
        location: formData.location,
        latitude: lat,
        longitude: lng,
        reporter_name: formData.reporterName,
        reporter_contact: formData.reporterContact,
        photo_url: imageUrl,
      };

      console.log('Submitting report:', reportData);

      // Call API using the correct function name: submitReport
      const response = await ApiService.submitReport(reportData);

      console.log('API Response:', response);

      if (response.success) {
        Alert.alert(
          '✅ Success',
          `Report submitted successfully!\n\nReport ID: #${response.report?.id || 'N/A'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  animalType: '',
                  description: '',
                  location: '',
                  latitude: '',
                  longitude: '',
                  reporterName: '',
                  reporterContact: '',
                  imageUri: null,
                });
                // Navigate back
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Animal</Text>
        <View style={{ width: 44 }} />
      </View> */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animal Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Animal Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.animalType}
              onValueChange={(value) =>
                setFormData({ ...formData, animalType: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select animal type..." value="" />
              <Picker.Item label="Dog" value="dog" />
              <Picker.Item label="Cat" value="cat" />
              <Picker.Item label="Bird" value="bird" />
              <Picker.Item label="Rabbit" value="rabbit" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the animal's condition and situation..."
            placeholderTextColor={COLORS.textLight}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Photo</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {formData.imageUri ? (
              <Image source={{ uri: formData.imageUri }} style={styles.imagePreview} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Tap to upload a photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Near UTM Main Gate, Johor"
            placeholderTextColor={COLORS.textLight}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
          />
        </View>

        {/* Latitude */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1.5535"
            placeholderTextColor={COLORS.textLight}
            value={formData.latitude}
            onChangeText={(text) =>
              setFormData({ ...formData, latitude: text })
            }
            keyboardType="decimal-pad"
          />
          <Text style={styles.helperText}>Range: -90 to 90</Text>
        </View>

        {/* Longitude */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 103.6380"
            placeholderTextColor={COLORS.textLight}
            value={formData.longitude}
            onChangeText={(text) =>
              setFormData({ ...formData, longitude: text })
            }
            keyboardType="decimal-pad"
          />
          <Text style={styles.helperText}>Range: -180 to 180</Text>
        </View>

        {/* Reporter Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textLight}
            value={formData.reporterName}
            onChangeText={(text) =>
              setFormData({ ...formData, reporterName: text })
            }
          />
        </View>

        {/* Reporter Contact */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Information *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={COLORS.textLight}
            value={formData.reporterContact}
            onChangeText={(text) =>
              setFormData({ ...formData, reporterContact: text })
            }
            keyboardType="email-address"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 15,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  imageUpload: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  submitButton: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  requiredNote: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default ReportAnimalScreen;