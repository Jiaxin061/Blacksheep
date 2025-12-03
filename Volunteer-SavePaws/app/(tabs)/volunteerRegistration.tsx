import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VolunteerRegistration() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [capability, setCapability] = useState('');
  
  // Focus states for interactive feedback
  const [focusedField, setFocusedField] = useState('');

  const handleSubmit = () => {
    if (!name || !address || !experience || !capability) {
      alert('Please fill in all required fields!');
      return;
    }

    console.log('Submitted Data:', {
      name,
      address,
      experience,
      capability,
    });
    
    Alert.alert('Success', 'Success! Registration submitted successfully!!', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/contribution')
      },
    ]);
  };

  const isFormValid = name && address && experience && capability;

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        {/* Back Button Header */}
        <View style={styles.unregisteredHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.backButton} /> 
        </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerImageContainer}>
          <Image
            source={require('@/assets/images/volunteer1.png')} // Change to your image filename
            style={styles.headerImage}
            contentFit="cover"
          />
        </View>

        {/* Content Section with adjusted gap */}
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome To Registration 👋</Text>
            <Text style={styles.subtitle}>Join as volunteer to help more animals</Text>
          </View>

          {/* Step 1 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>1. Name *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'name' && styles.inputFocused,
                name && styles.inputFilled
              ]}
              placeholder="Type your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
            />
            {name && (
              <Text style={styles.validationCheck}>✓ Looks good!</Text>
            )}
          </View>

          {/* Step 2 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. Location *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'address' && styles.inputFocused,
                address && styles.inputFilled
              ]}
              placeholder="Type your location"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField('')}
            />
            {address && (
              <Text style={styles.validationCheck}>✓ Looks good!</Text>
            )}
          </View>

          {/* Step 3 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>3. Describe Your Experience *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === 'experience' && styles.inputFocused,
                experience && styles.inputFilled
              ]}
              placeholder="e.g. I have joined a rescue event in 2018."
              placeholderTextColor="#999"
              value={experience}
              onChangeText={setExperience}
              onFocus={() => setFocusedField('experience')}
              onBlur={() => setFocusedField('')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {experience && (
              <Text style={styles.validationCheck}>✓ Looks good!</Text>
            )}
          </View>

          {/* Step 4 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>4. What are your capabilities?</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === 'capability' && styles.inputFocused,
                capability && styles.inputFilled
              ]}
              placeholder="e.g. Help to feed animals, transport rescued animals, etc."
              placeholderTextColor="#999"
              value={capability}
              onChangeText={setCapability}
              onFocus={() => setFocusedField('capability')}
              onBlur={() => setFocusedField('')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {capability && (
              <Text style={styles.validationCheck}>✓ Great!</Text>
            )}
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {[name, address, experience, capability].filter(Boolean).length}/4 required fields completed
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${([name, address, experience, capability].filter(Boolean).length / 4) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isFormValid ? 'Submit Registration' : 'Please complete required fields'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25
  },
  unregisteredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unregisteredHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 36,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerImageContainer: {
    height: 200, 
    width: '100%',
    backgroundColor: '#A1CEDC',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '90%',
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
    marginTop: 0, 
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#333',
  },
  inputFocused: {
    borderColor: '#2196f3',
    backgroundColor: '#fff',
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputFilled: {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  validationCheck: {
    fontSize: 13,
    color: '#4caf50',
    marginTop: 6,
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: 3,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});