import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import animalService from '../services/animalService';
import adoptionService from '../../adoption/services/adoptionService';

export default function AnimalDetail({ route, navigation }) {
  const { animalId, isAdmin = false } = route.params || {};
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    checkRequestStatus();
    loadAnimal();
  }, [animalId]);

  const checkRequestStatus = async () => {
    try {
      const response = await adoptionService.getMyRequests();
      if (response.success) {
        const hasRequested = response.data.some(req => req.animal_id === Number(animalId));
        setIsRequested(hasRequested);
      }
    } catch (err) {
      console.error('Error checking request status:', err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Animal',
      'Are you sure you want to delete this animal record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await animalService.deleteAnimal(animalId);
              if (response.success) {
                Alert.alert('Success', 'Animal record deleted successfully!', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Animals', {
                      initialTab: 'list',
                      refreshTimestamp: Date.now(),
                      isAdmin,
                    })
                  }
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
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const loadAnimal = async () => {
    try {
      setError(null);
      const response = await animalService.getAnimalById(animalId);

      if (response.success) {
        setAnimal(response.data);
      } else {
        setError(response.message || 'Animal record not found');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error retrieving animal record';
      setError(errorMessage);
      console.error('Error loading animal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading animal details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Animal record not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{animal.name}</Text>
        <View style={[styles.statusBadge, getStatusStyle(animal.status)]}>
          <Text style={styles.statusText}>{animal.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoRow label="Species" value={animal.species} />
        {animal.breed && <InfoRow label="Breed" value={animal.breed} />}
        {animal.age !== null && <InfoRow label="Age" value={`${animal.age} years`} />}
        {animal.gender && <InfoRow label="Gender" value={animal.gender} />}
        {animal.weight && <InfoRow label="Weight" value={`${animal.weight} kg`} />}
        {animal.color && <InfoRow label="Color" value={animal.color} />}
        {animal.location && <InfoRow label="Location" value={animal.location} />}
      </View>

      {animal.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{animal.description}</Text>
        </View>
      )}

      {animal.medical_notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Notes</Text>
          <Text style={styles.description}>{animal.medical_notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Information</Text>
        <InfoRow label="Created" value={formatDate(animal.created_at)} />
        {animal.updated_at && (
          <InfoRow label="Last Updated" value={formatDate(animal.updated_at)} />
        )}
      </View>

      {isAdmin ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('AnimalForm', { animalId: animal.id, animal, isAdmin })}
            disabled={deleting}
          >
            <Text style={styles.actionButtonText}>Edit Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Delete Record</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        animal.status === 'available' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.adoptButton, isRequested && styles.requestedButton]}
              onPress={() => navigation.navigate('AdoptionRequest', { animal })}
              disabled={isRequested}
            >
              <Text style={styles.actionButtonText}>
                {isRequested ? 'Request Submitted' : 'Request Adoption'}
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </ScrollView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  adoptButton: {
    backgroundColor: '#E91E63',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  requestedButton: {
    backgroundColor: '#9E9E9E',
  },
});



