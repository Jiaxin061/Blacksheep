import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import AnimalAdminList from './AnimalAdminList';
import AnimalSearch from './AnimalSearch';

export default function AnimalsScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('list');
  const isAdmin = route?.params?.isAdmin ?? false;
  const refreshTrigger = route?.params?.refreshTimestamp;

  // Animation values for tab indicator
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Track tab widths for accurate animation
  const [tabWidth, setTabWidth] = useState(0);

  // Animate tab indicator when switching tabs
  useEffect(() => {
    const tabIndex = activeTab === 'list' ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [activeTab]);

  const handleTabLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width);
  };

  const handleTabPress = (tab) => {
    // Add haptic feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveTab(tab);
  };

  const handleAddNew = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('AnimalForm', { isAdmin });
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />



      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View
          style={styles.tabWrapper}
          onLayout={handleTabLayout}
        >
          {/* Animated Indicator */}
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: (tabWidth - 8) / 2, // Half width minus padding
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, tabWidth / 2], // Start at 4px (padding), move to halfway
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          {/* Tab Buttons */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && styles.activeTab]}
            onPress={() => handleTabPress('list')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'list' }}
            accessibilityLabel="All Animals tab"
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
              All Animals
            </Text>
            {activeTab === 'list' && <View style={styles.tabBadge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => handleTabPress('search')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'search' }}
            accessibilityLabel="Search tab"
          >
            <Text style={styles.tabIcon}>🔍</Text>
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search
            </Text>
            {activeTab === 'search' && <View style={styles.tabBadge} />}
          </TouchableOpacity>
        </View>

        {/* Add Button */}
        {isAdmin && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNew}
              accessibilityRole="button"
              accessibilityLabel="Add new animal"
              accessibilityHint="Opens form to add a new animal to the shelter"
            >
              <View style={styles.addButtonContent}>
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Add New</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Content Area with Fade Animation */}
      <Animated.View style={styles.contentContainer}>
        {activeTab === 'list' ? (
          <AnimalAdminList
            navigation={navigation}
            isAdmin={isAdmin}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <AnimalSearch navigation={navigation} isAdmin={isAdmin} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabWrapper: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    zIndex: 1,
  },
  activeTab: {
    // Active state handled by indicator
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '700',
  },
  tabBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  contentContainer: {
    flex: 1,
  },
});