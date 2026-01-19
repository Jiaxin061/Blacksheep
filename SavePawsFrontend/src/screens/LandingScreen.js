import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoIcon}>🐾</Text>
        <Text style={styles.appName}>SavePaws</Text>
      </View>

      {/* Buttons */}
      <View style={styles.content}>

        {/* User Button */}
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonEmoji}>👤</Text>
          <Text style={styles.buttonText}>User</Text>
        </TouchableOpacity>

        {/* Admin Button */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={styles.buttonEmoji}>🛡️</Text>
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14b8a6',
    marginTop: 10,
  },
  content: {
    width: '80%',
  },
  userButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#14b8a6',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
});

export default LandingScreen;
