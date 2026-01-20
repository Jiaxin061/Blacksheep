import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import animalService from '../../services/animalService';

export default function AnimalAdminList({
  navigation,
  isAdmin = false,
  refreshTrigger = null,
  ListHeaderComponent = null,
  variant = 'virtual',
}) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAnimals = async () => {
    try {
      setError(null);
      const response = await animalService.getAllAnimals();

      if (response.success) {
        setAnimals(response.data || []);
      } else {
        setError(response.message || 'Failed to load animals');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error retrieving animal records';
      setError(errorMessage);
      console.error('Error loading animals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, [refreshTrigger]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimals();
  };

  const handleAnimalPress = (animal) => {
    navigation.navigate('AnimalDetailView', { animalId: animal.id, isAdmin });
  };

  const handleEditPress = (animal) => {
    if (isAdmin) {
      navigation.navigate('AnimalForm', { animalId: animal.id, animal, isAdmin });
    }
  };

  const renderHeader = () => {
    if (!ListHeaderComponent) return null;
    return typeof ListHeaderComponent === 'function'
      ? <ListHeaderComponent />
      : ListHeaderComponent;
  };

  const renderAnimalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.animalCard}
      onPress={() => handleAnimalPress(item)}
    >
      <View style={styles.animalInfo}>
        <Text style={styles.animalName}>{item.name}</Text>
        <Text style={styles.animalDetails}>
          {item.species} {item.breed ? `• ${item.breed}` : ''}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Age: {item.age ? `${item.age} years` : 'Unknown'}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      {isAdmin && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPress(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnimals}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (animals.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No animal records found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (variant === 'static') {
    return (
      <View style={styles.listContainer}>
        {renderHeader()}
        {animals.map((animal) => (
          <View key={animal.id}>{renderAnimalItem({ item: animal })}</View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={animals}
      renderItem={renderAnimalItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={renderHeader}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  animalDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});



