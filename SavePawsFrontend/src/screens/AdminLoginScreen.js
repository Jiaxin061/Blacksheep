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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants';
import ApiService from '../services/api';
import { setAuthToken, setCurrentUserID } from '../utils/auth';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.adminLogin({
        email: email,
        password: password,
      });

      if (response.success) {
        // Save admin data using auth utilities
        await setCurrentUserID(response.admin.id);
        await setAuthToken(response.token || 'admin-token', 'admin');
        // Also save legacy keys for backward compatibility
        await AsyncStorage.setItem('adminId', response.admin.id.toString());
        await AsyncStorage.setItem('adminEmail', response.admin.email);
        await AsyncStorage.setItem('adminRole', response.admin.role);
        await AsyncStorage.setItem('authToken', response.token || 'admin-token');

        const adminName = response.admin.first_name || response.admin.full_name || response.admin.email?.split('@')[0] || 'Admin';
        Alert.alert('Success', `Welcome, ${adminName}!`);
        navigation.replace('AdminHome');
      } else {
        Alert.alert('Error', response.message || 'Invalid admin credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Admin login error:', error);
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
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>🔒 ADMIN ACCESS</Text>
            </View>
            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.subtitle}>Authorized personnel only</Text>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Secure Access Required</Text>
              <Text style={styles.noticeText}>
                This area is restricted to authorized administrators only.
                All access attempts are logged.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Admin Email</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@savepaws.com"
                placeholderTextColor={Colors.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter admin password"
                  placeholderTextColor={Colors.gray400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleAdminLogin}
              disabled={loading}
            >
              <Text style={styles.lockIcon}>🔐</Text>
              <Text style={styles.loginButtonText}>
                {loading ? 'Authenticating...' : 'Secure Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to User Login */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back to User Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary600,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 48,
  },
  adminBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  adminBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary700,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.primary100,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  warningIcon: {
    fontSize: 20,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: FontSizes.sm,
    color: '#92400e',
    lineHeight: 18,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
  loginButton: {
    height: 48,
    backgroundColor: Colors.primary700,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    shadowColor: Colors.primary700,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 18,
  },
  loginButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  backArrow: {
    fontSize: 18,
    color: Colors.primary100,
  },
  backText: {
    fontSize: FontSizes.md,
    color: Colors.primary100,
  },
});

export default AdminLoginScreen;