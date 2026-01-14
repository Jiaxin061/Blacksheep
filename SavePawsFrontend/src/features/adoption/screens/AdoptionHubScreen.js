
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import animalService from '../../animals/services/animalService';
import adoptionService from '../services/adoptionService';

const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function AdoptionHubScreen({ navigation }) {
  const [animals, setAnimals] = useState([]);
  const [userRequests, setUserRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAvailableAnimals(), loadUserRequests()]);
    setLoading(false);
  };

  const loadUserRequests = async () => {
    try {
      const response = await adoptionService.getMyRequests();
      if (response.success) {
        const requestedAnimalIds = new Set(response.data.map(req => req.animal_id));
        setUserRequests(requestedAnimalIds);
      }
    } catch (err) {
      console.error('Error loading user requests:', err);
    }
  };

  const loadAvailableAnimals = async () => {
    try {
      setError(null);
      const response = await animalService.searchAnimals({ status: 'available' });

      if (response.success) {
        setAnimals(response.data || []);
      } else {
        setError(response.message || 'Failed to load available animals');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error retrieving animals';
      setError(errorMessage);
      console.error('Error loading animals:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAvailableAnimals(), loadUserRequests()]);
    setRefreshing(false);
  };

  const handleAnimalPress = (animal) => {
    navigation.navigate('AnimalDetailView', {
      animalId: animal.id,
      isAdmin: false
    });
  };

  const getStatusStyle = (status) => {
    const statusColors = {
      available: { backgroundColor: '#4CAF50' },
      adopted: { backgroundColor: '#2196F3' },
      fostered: { backgroundColor: '#FF9800' },
      medical: { backgroundColor: '#F44336' },
      pending: { backgroundColor: '#9E9E9E' }
    };
    return statusColors[status] || statusColors.available;
  };

  // Animation Interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderAnimalItem = ({ item }) => {
    const isRequested = userRequests.has(item.id);

    return (
      <TouchableOpacity
        style={styles.animalCard}
        onPress={() => handleAnimalPress(item)}
        activeOpacity={0.8}
      >
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.animalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.animalImagePlaceholder}>
            <Text style={styles.animalImagePlaceholderText}>🐾</Text>
          </View>
        )}

        <View style={styles.animalInfo}>
          <View style={styles.animalHeader}>
            <Text style={styles.animalName}>{item.name}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.animalDetails}>
            {item.species} {item.breed ? `\u2022 ${item.breed} ` : ''}
          </Text>

          {item.age != null && (
            <Text style={styles.animalMeta}>Age: {item.age} years</Text>
          )}

          {item.description && (
            <Text style={styles.animalDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.adoptButton, isRequested && styles.requestedButton]}
            onPress={() => handleAnimalPress(item)}
            disabled={isRequested}
          >
            <Text style={styles.adoptButtonText}>
              {isRequested ? 'Requested' : 'View Details & Adopt'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      <LinearGradient
        colors={['#E91E63', '#C2185B', '#880E4F']}
        style={styles.headerGradient}
      >
        <Animated.Text
          style={[
            styles.headerIcon,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslate }]
            }
          ]}
        >
          ❤️
        </Animated.Text>

        <Animated.Text style={[styles.headerTitle, { transform: [{ scale: titleScale }] }]}>
          Adoption Hub
        </Animated.Text>

        <Animated.View style={{ opacity: imageOpacity }}>
          <Text style={styles.headerSubtitle}>
            Find your perfect companion and give them a loving home
          </Text>
          <Text style={styles.headerCount}>
            {animals.length} {animals.length === 1 ? 'Animal' : 'Animals'} Available
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Loading available animals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAvailableAnimals}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />

      {renderHeader()}

      {animals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No animals available for adoption at the moment</Text>
          <Text style={styles.emptySubtext}>
            Check back soon for new arrivals!
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={animals}
          renderItem={renderAnimalItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false } // layout properties like height don't support native driver
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E91E63"
              progressViewOffset={HEADER_MAX_HEIGHT} // start spinner below transparent header if needed
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    elevation: 4,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Adjust for status bar
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: HEADER_MAX_HEIGHT + 16, // Push list down by max header height
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  animalImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalImagePlaceholderText: {
    fontSize: 64,
  },
  animalInfo: {
    padding: 16,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  animalDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  animalMeta: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  animalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  adoptButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestedButton: {
    backgroundColor: '#9E9E9E',
  },

  adoptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: HEADER_MAX_HEIGHT, // Ensure loading overlaps properly
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

