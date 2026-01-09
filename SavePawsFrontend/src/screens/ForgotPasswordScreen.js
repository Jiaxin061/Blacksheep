import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants';
import ApiService from '../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Enter IC/Email, 2: Reset Password
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleVerifyUser = async () => {
    if (!icNumber && !email) {
      Alert.alert('Error', 'Please enter either IC Number or Email');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.forgotPasswordRequest({
        ic_number: icNumber || undefined,
        email: email || undefined,
      });

      if (response.success) {
        setUserInfo(response.user);
        setStep(2);
        Alert.alert('Verified', 'Please enter your new password');
      } else {
        Alert.alert('Error', response.message || 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.resetPassword({
        user_id: userInfo.id,
        new_password: newPassword,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Password reset successfully! You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('UserLogin'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Forgot Password</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Step 1: Verify User */}
            {step === 1 && (
              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Enter your IC Number or Email to reset your password
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>IC Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="990101011234"
                    placeholderTextColor={Colors.gray400}
                    value={icNumber}
                    onChangeText={setIcNumber}
                    keyboardType="number-pad"
                    maxLength={12}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor={Colors.gray400}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.buttonDisabled]}
                  onPress={handleVerifyUser}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Reset Password */}
            {step === 2 && userInfo && (
              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Reset password for:{'\n'}
                  <Text style={styles.userName}>
                    {userInfo.first_name} {userInfo.last_name}
                  </Text>
                  {'\n'}
                  <Text style={styles.userEmail}>{userInfo.email}</Text>
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.gray400}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.hint}>
                    Password must be at least 6 characters
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Re-enter new password"
                      placeholderTextColor={Colors.gray400}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Text style={styles.eyeIcon}>
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.backLinkText}>← Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  form: {
    flex: 1,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 24,
  },
  userName: {
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.base,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  submitButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;

