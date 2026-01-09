import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import adoptionService from '../services/adoptionService';

export default function AdoptionRequestScreen({ route, navigation }) {
  const { animal } = route.params || {};
  const [reason, setReason] = useState('');
  const [housingType, setHousingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkExistingRequest();
  }, [animal]);

  const checkExistingRequest = async () => {
    if (!animal) return;
    try {
      const response = await adoptionService.getMyRequests();
      if (response.success) {
        const hasPendingRequest = response.data.some(
          req => req.animal_id === animal.id && req.status === 'pending'
        );

        if (hasPendingRequest) {
          Alert.alert(
            'Request Already Exists',
            'You have already submitted an adoption request for this animal.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking existing requests:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!reason.trim()) {
      errors.reason = 'Adoption reason is required';
    } else if (reason.trim().length < 10) {
      errors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    }

    if (!housingType.trim()) {
      errors.housingType = 'Housing type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors in the form before submitting.'
      );
      return;
    }

    Alert.alert(
      'Confirm Adoption Request',
      'Are you sure you want to submit this adoption request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await adoptionService.submitAdoption(animal.id, {
                reason: reason.trim(),
                housingType: housingType.trim(),
              });

              if (response.success) {
                Alert.alert(
                  'Success',
                  'Your adoption request has been submitted successfully! We will review it and get back to you soon.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                throw new Error(response.message || 'Failed to submit request');
              }
            } catch (error) {
              console.error('Error submitting adoption request:', error);
              Alert.alert(
                'Error',
                error.message || 'An error occurred while submitting your adoption request. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!animal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Animal information not available</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Request Adoption</Text>
          <Text style={styles.subtitle}>
            Submit an adoption request for {animal.name}
          </Text>
        </View>

        <View style={styles.animalInfo}>
          <Text style={styles.animalInfoTitle}>Animal Information</Text>
          <Text style={styles.animalInfoText}>
            {animal.species} {animal.breed ? `• ${animal.breed}` : ''}
          </Text>
          {animal.age && (
            <Text style={styles.animalInfoText}>Age: {animal.age} years</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Adoption Reason <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                validationErrors.reason && styles.inputError
              ]}
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                if (validationErrors.reason) {
                  setValidationErrors({ ...validationErrors, reason: undefined });
                }
              }}
              placeholder="Please explain why you want to adopt this animal..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel="Adoption reason"
              maxLength={500}
            />
            {validationErrors.reason && (
              <Text style={styles.errorText}>{validationErrors.reason}</Text>
            )}
            <Text style={styles.helperText}>
              {reason.length}/500 characters
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Housing Type <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.housingType && styles.inputError
              ]}
              value={housingType}
              onChangeText={(text) => {
                setHousingType(text);
                if (validationErrors.housingType) {
                  setValidationErrors({ ...validationErrors, housingType: undefined });
                }
              }}
              placeholder="e.g., House with yard, Apartment, Farm, etc."
              accessibilityLabel="Housing type"
              maxLength={100}
            />
            {validationErrors.housingType && (
              <Text style={styles.errorText}>{validationErrors.housingType}</Text>
            )}
            <Text style={styles.helperText}>
              Describe where the animal will live
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Submit adoption request"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Request</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton, loading && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Cancel and go back"
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  animalInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  animalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  animalInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

