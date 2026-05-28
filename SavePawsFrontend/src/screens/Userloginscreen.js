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

const UserLoginScreen = ({ navigation }) => {
  const [icNo, setIcNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!icNo || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Call backend API
      const response = await ApiService.login({
        ic_number: icNo,
        password: password,
      });

      if (response.success) {
        // Save user data to AsyncStorage using auth utilities
        await setCurrentUserID(response.user.id);
        await setAuthToken(response.token || 'demo-token', 'user');
        // Also save legacy keys for backward compatibility
        await AsyncStorage.setItem('userId', response.user.id.toString());
        await AsyncStorage.setItem('icNumber', response.user.ic_number);
        await AsyncStorage.setItem('userName', `${response.user.first_name} ${response.user.last_name}`);
        await AsyncStorage.setItem('authToken', response.token || 'demo-token');

        Alert.alert('Success', `Welcome back, ${response.user.first_name}!`);
<<<<<<< HEAD
        navigation.replace('UserHome', { 
=======
        navigation.replace('UserHome', {
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          userId: response.user.id,
          icNo: response.user.ic_number,
          name: `${response.user.first_name} ${response.user.last_name}`
        });
      } else {
        Alert.alert('Error', response.message || 'Invalid IC number or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // MyDigitalID Login - Auto login as User 1
  const handleMyDigitalIDLogin = async () => {
    setLoading(true);

    try {
      // First test connection
      console.log('🔌 Testing server connection...');
      const connectionTest = await ApiService.testConnection();
      
      if (!connectionTest.success) {
        Alert.alert(
          'Connection Error', 
          connectionTest.message || 'Cannot connect to server. Please check:\n\n1. Backend server is running\n2. Server is accessible\n3. Check network settings'
        );
        setLoading(false);
        return;
      }

      // Simulate MyDigitalID login - get User 1's data from database
      console.log('🔍 Fetching user data...');
      const response = await ApiService.getUserById(1);

      if (response.success && response.user) {
        // Save user data to AsyncStorage using auth utilities
        await setCurrentUserID(1);
        await setAuthToken('mydigitalid-token', 'user');
        // Also save legacy keys for backward compatibility
        await AsyncStorage.setItem('userId', '1');
        await AsyncStorage.setItem('icNumber', response.user.ic_number);
        await AsyncStorage.setItem('userName', `${response.user.first_name} ${response.user.last_name}`);
        await AsyncStorage.setItem('authToken', 'mydigitalid-token');

        Alert.alert(
          '✅ MyDigitalID Login Success', 
          `Welcome, ${response.user.first_name} ${response.user.last_name}!\n\nIC: ${response.user.ic_number}`
        );
        
        navigation.replace('UserHome', { 
          userId: 1,
          icNo: response.user.ic_number,
          name: `${response.user.first_name} ${response.user.last_name}`
        });
      } else {
        Alert.alert('Error', response.message || 'MyDigitalID authentication failed');
      }
    } catch (error) {
      console.error('MyDigitalID login error:', error);
      Alert.alert(
        'Error', 
        `MyDigitalID login failed: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. Database connection is working\n3. User ID 1 exists in database`
      );
    } finally {
      setLoading(false);
    }
  };
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

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
              <Text style={styles.logoIcon}>🐾</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue rescuing animals</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* IC Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>IC Number</Text>
              <TextInput
                style={styles.input}
                placeholder="990101011234"
                placeholderTextColor={Colors.gray400}
                value={icNo}
                onChangeText={setIcNo}
                keyboardType="number-pad"
                maxLength={12}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>Enter your 12-digit Malaysian IC number</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
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
<<<<<<< HEAD
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]} 
=======
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

<<<<<<< HEAD
          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* MyDigitalID Login Button */}
          <TouchableOpacity 
            style={[styles.myDigitalIDButton, loading && styles.buttonDisabled]}
            onPress={handleMyDigitalIDLogin}
            disabled={loading}
          >
            <Text style={styles.myDigitalIDIcon}>🇲🇾</Text>
            <Text style={styles.myDigitalIDButtonText}>Login with MyDigitalID</Text>
          </TouchableOpacity>

=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New to SavePaws?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
<<<<<<< HEAD
          <TouchableOpacity 
=======
          <TouchableOpacity
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>✨ Create an account</Text>
          </TouchableOpacity>

          {/* Admin Login Link */}
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.adminLinkIcon}>🔒</Text>
            <Text style={styles.adminLinkText}>Admin Login</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: Spacing.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  form: {
    marginBottom: Spacing.xl,
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
  loginButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
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
<<<<<<< HEAD
  myDigitalIDButton: {
    height: 48,
    backgroundColor: '#003366',
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  myDigitalIDIcon: {
    fontSize: 20,
  },
  myDigitalIDButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  signupLink: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  signupText: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  adminLinkIcon: {
    fontSize: 16,
  },
  adminLinkText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  forgotPasswordLink: {
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default UserLoginScreen;