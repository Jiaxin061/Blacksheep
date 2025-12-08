import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import animalService from '../services/animalService';

export default function AnimalForm({ route, navigation }) {
  const { animalId, animal: initialAnimal, isAdmin: initialIsAdmin } = route.params || {};
  const isEditMode = !!animalId;
  const isAdmin = typeof initialIsAdmin === 'boolean' ? initialIsAdmin : true;

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: 'male',
    status: 'available',
    description: '',
    image_url: '',
    weight: '',
    color: '',
    location: '',
    medical_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [imageError, setImageError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isEditMode && initialAnimal) {
      const initialData = {
        name: initialAnimal.name || '',
        species: initialAnimal.species || '',
        breed: initialAnimal.breed || '',
        age: initialAnimal.age?.toString() || '',
        gender: initialAnimal.gender || 'male',
        status: initialAnimal.status || 'available',
        description: initialAnimal.description || '',
        image_url: initialAnimal.image_url || '',
        weight: initialAnimal.weight?.toString() || '',
        color: initialAnimal.color || '',
        location: initialAnimal.location || '',
        medical_notes: initialAnimal.medical_notes || ''
      };
      setFormData(initialData);
      setLoadingInitial(false);
    } else if (isEditMode) {
      loadAnimal();
    }
  }, [animalId]);

  // Track unsaved changes
  useEffect(() => {
    if (!loadingInitial && isEditMode && initialAnimal) {
      setHasUnsavedChanges(true);
    } else if (!isEditMode && Object.values(formData).some(val => val !== '' && val !== 'male' && val !== 'available')) {
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  const loadAnimal = async () => {
    try {
      const response = await animalService.getAnimalById(animalId);
      if (response.success) {
        const animal = response.data;
        setFormData({
          name: animal.name || '',
          species: animal.species || '',
          breed: animal.breed || '',
          age: animal.age?.toString() || '',
          gender: animal.gender || 'male',
          status: animal.status || 'available',
          description: animal.description || '',
          image_url: animal.image_url || '',
          weight: animal.weight?.toString() || '',
          color: animal.color || '',
          location: animal.location || '',
          medical_notes: animal.medical_notes || ''
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load animal data');
      navigation.goBack();
    } finally {
      setLoadingInitial(false);
    }
  };

  const redirectToAnimalList = useCallback(() => {
    navigation.navigate('Animals', {
      initialTab: 'list',
      refreshTimestamp: Date.now(),
      isAdmin,
    });
  }, [navigation, isAdmin]);

  // Enhanced number parsing with validation
  const parseNumber = (value, parser) => {
    if (!value || value.trim() === '') return null;
    const parsed = parser(value);
    return isNaN(parsed) || parsed < 0 ? null : parsed;
  };

  // Comprehensive form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!formData.species.trim()) {
      errors.species = 'Species is required';
    } else if (formData.species.length > 50) {
      errors.species = 'Species must be less than 50 characters';
    }

    if (formData.age && parseNumber(formData.age, parseInt) === null) {
      errors.age = 'Age must be a valid positive number';
    }

    if (formData.weight && parseNumber(formData.weight, parseFloat) === null) {
      errors.weight = 'Weight must be a valid positive number';
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
      'Confirm',
      isEditMode
        ? 'Are you sure you want to update this animal record?'
        : 'Are you sure you want to create this animal record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const submitData = {
                ...formData,
                age: parseNumber(formData.age, parseInt),
                weight: parseNumber(formData.weight, parseFloat),
              };

              let response;
              if (isEditMode) {
                response = await animalService.updateAnimal(animalId, submitData);
              } else {
                response = await animalService.createAnimal(submitData);
              }

              if (response.success) {
                setHasUnsavedChanges(false);
                Alert.alert(
                  'Success',
                  isEditMode
                    ? 'Animal record updated successfully!'
                    : 'Animal record created successfully!',
                  [
                    { text: 'OK', onPress: redirectToAnimalList }
                  ]
                );
              } else {
                throw new Error(response.message || 'Operation failed');
              }
            } catch (error) {
              console.error('Error saving animal:', error);
              Alert.alert(
                'Error',
                error.message || 'An error occurred while saving the animal record. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    if (!isEditMode) return;

    Alert.alert(
      'Delete Animal',
      'Are you sure you want to delete this animal record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await animalService.deleteAnimal(animalId);
              if (response.success) {
                setHasUnsavedChanges(false);
                Alert.alert('Success', 'Animal record deleted successfully!', [
                  { text: 'OK', onPress: redirectToAnimalList }
                ]);
              } else {
                throw new Error(response.message || 'Delete failed');
              }
            } catch (error) {
              console.error('Error deleting animal:', error);
              Alert.alert(
                'Error',
                error.message || 'An error occurred while deleting the animal record.'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: undefined });
    }
    if (field === 'image_url') {
      setImageError(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading animal data...</Text>
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
        <Text style={styles.title}>
          {isEditMode ? 'Edit Animal Record' : 'Add New Animal Record'}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter animal name"
              accessibilityLabel="Animal name"
              accessibilityHint="Required field"
              maxLength={100}
            />
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Species *</Text>
            <TextInput
              style={[styles.input, validationErrors.species && styles.inputError]}
              value={formData.species}
              onChangeText={(text) => updateField('species', text)}
              placeholder="e.g., Dog, Cat, Bird"
              accessibilityLabel="Animal species"
              accessibilityHint="Required field"
              maxLength={50}
            />
            {validationErrors.species && (
              <Text style={styles.errorText}>{validationErrors.species}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={formData.breed}
              onChangeText={(text) => updateField('breed', text)}
              placeholder="Enter breed"
              accessibilityLabel="Animal breed"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Age (years)</Text>
              <TextInput
                style={[styles.input, validationErrors.age && styles.inputError]}
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
                placeholder="Years"
                keyboardType="numeric"
                accessibilityLabel="Animal age in years"
              />
              {validationErrors.age && (
                <Text style={styles.errorText}>{validationErrors.age}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, validationErrors.weight && styles.inputError]}
                value={formData.weight}
                onChangeText={(text) => updateField('weight', text)}
                placeholder="kg"
                keyboardType="decimal-pad"
                accessibilityLabel="Animal weight in kilograms"
              />
              {validationErrors.weight && (
                <Text style={styles.errorText}>{validationErrors.weight}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroup}>
                {['male', 'female'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioOption}
                    onPress={() => updateField('gender', option)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: formData.gender === option }}
                    accessibilityLabel={`Gender: ${option}`}
                  >
                    <View style={styles.radio}>
                      {formData.gender === option && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioLabel}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.selectContainer}>
                {['available', 'adopted', 'fostered', 'medical', 'pending'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.selectOption,
                      formData.status === option && styles.selectOptionActive
                    ]}
                    onPress={() => updateField('status', option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: formData.status === option }}
                    accessibilityLabel={`Status: ${option}`}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.status === option && styles.selectOptionTextActive
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={formData.color}
              onChangeText={(text) => updateField('color', text)}
              placeholder="Enter color"
              accessibilityLabel="Animal color"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => updateField('location', text)}
              placeholder="Enter location"
              accessibilityLabel="Animal location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Animal description"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={[styles.input, validationErrors.image_url && styles.inputError]}
              value={formData.image_url}
              onChangeText={(text) => updateField('image_url', text)}
              placeholder="Enter image URL"
              autoCapitalize="none"
              keyboardType="url"
              accessibilityLabel="Animal image URL"
            />
            {validationErrors.image_url && (
              <Text style={styles.errorText}>{validationErrors.image_url}</Text>
            )}
            {formData.image_url && !imageError && isValidUrl(formData.image_url) && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: formData.image_url }}
                  style={styles.imagePreview}
                  onError={() => setImageError(true)}
                  accessibilityLabel="Preview of animal image"
                />
              </View>
            )}
            {imageError && formData.image_url && (
              <Text style={styles.warningText}>Unable to load image preview</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.medical_notes}
              onChangeText={(text) => updateField('medical_notes', text)}
              placeholder="Enter medical notes"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Medical notes"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={isEditMode ? 'Update animal record' : 'Create animal record'}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditMode ? 'Update Record' : 'Create Record'}
              </Text>
            )}
          </TouchableOpacity>

          {isEditMode && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Delete animal record"
            >
              <Text style={styles.buttonText}>Delete Record</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.cancelButton, loading && styles.buttonDisabled]}
            onPress={handleCancel}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#666',
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
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  warningText: {
    color: '#FF9800',
    fontSize: 12,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  selectOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#666',
  },
  selectOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
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
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
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
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
});