import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import animalService from '../../services/animalService';
import AnimalList from './AnimalAdminList';

export default function AnimalSearch({ navigation, isAdmin = false }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({
    species: '',
    status: '',
    gender: '',
    minAge: '',
    maxAge: ''
  });
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSearch = async () => {
    if (!searchKeyword && !filters.species && !filters.status && !filters.gender && !filters.minAge && !filters.maxAge) {
      Alert.alert('Search Required', 'Please enter a search keyword or select at least one filter.');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchFilters = {
        ...(searchKeyword && { keyword: searchKeyword }),
        ...(filters.species && { species: filters.species }),
        ...(filters.status && { status: filters.status }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.minAge && { minAge: parseInt(filters.minAge) }),
        ...(filters.maxAge && { maxAge: parseInt(filters.maxAge) })
      };

      const response = await animalService.searchAnimals(searchFilters);

      if (response.success) {
        setAnimals(response.data || []);
        setIsCollapsed(true); // Collapse search form after successful search
        if (response.data.length === 0) {
          Alert.alert('No Results', 'No matching animal records found.');
        }
      } else {
        Alert.alert('Search Error', response.message || 'Error searching animal records');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', error.message || 'Error searching animal records');
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchKeyword('');
    setFilters({
      species: '',
      status: '',
      gender: '',
      minAge: '',
      maxAge: ''
    });
    setAnimals([]);
    setHasSearched(false);
    setIsCollapsed(false); // Expand search form when clearing
  };

  const getSearchSummary = () => {
    const parts = [];
    if (searchKeyword) parts.push(`Keyword: "${searchKeyword}"`);
    if (filters.species) parts.push(`Species: ${filters.species}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.gender) parts.push(`Gender: ${filters.gender}`);
    if (filters.minAge) parts.push(`Min Age: ${filters.minAge}`);
    if (filters.maxAge) parts.push(`Max Age: ${filters.maxAge}`);
    return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
  };

  const renderResults = () => {
    if (!hasSearched) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Enter search criteria and click "Search" to find animals
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (animals.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No matching animal records found</Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>{animals.length} result(s) found</Text>
        <ScrollView>
          {animals.map((animal) => (
            <TouchableOpacity
              key={animal.id}
              style={styles.resultCard}
              onPress={() => navigation.navigate('AnimalDetailView', { animalId: animal.id, isAdmin })}
            >
              <Text style={styles.resultName}>{animal.name}</Text>
              <Text style={styles.resultDetails}>
                {animal.species} {animal.breed ? `• ${animal.breed}` : ''}
              </Text>
              <View style={styles.resultMeta}>
                <Text style={styles.resultMetaText}>
                  Age: {animal.age ? `${animal.age} years` : 'Unknown'} • Status: {animal.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {isCollapsed && hasSearched ? (
          <TouchableOpacity
            style={styles.collapsedHeader}
            onPress={() => setIsCollapsed(false)}
            activeOpacity={0.7}
          >
            <View style={styles.collapsedHeaderContent}>
              <Text style={styles.collapsedTitle}>Search Criteria</Text>
              <Text style={styles.collapsedSummary} numberOfLines={1}>
                {getSearchSummary()}
              </Text>
            </View>
            <Text style={styles.expandIcon}>▼</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.searchHeader}>
              <Text style={styles.sectionTitle}>Search Animals</Text>
              {hasSearched && (
                <TouchableOpacity
                  onPress={() => setIsCollapsed(true)}
                  style={styles.collapseButton}
                >
                  <Text style={styles.collapseButtonText}>▲ Collapse</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.label}>Search Keyword</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by name, breed, or description..."
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
            </View>

            <View style={styles.filtersSection}>
              <Text style={styles.sectionTitle}>Filters</Text>

              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Text style={styles.label}>Species</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Dog, Cat"
                    value={filters.species}
                    onChangeText={(text) => setFilters({ ...filters, species: text })}
                  />
                </View>

                <View style={styles.filterItem}>
                  <Text style={styles.label}>Status</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="available, adopted, etc."
                    value={filters.status}
                    onChangeText={(text) => setFilters({ ...filters, status: text })}
                  />
                </View>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Text style={styles.label}>Gender</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="male, female"
                    value={filters.gender}
                    onChangeText={(text) => setFilters({ ...filters, gender: text })}
                  />
                </View>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Text style={styles.label}>Min Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={filters.minAge}
                    onChangeText={(text) => setFilters({ ...filters, minAge: text })}
                  />
                </View>

                <View style={styles.filterItem}>
                  <Text style={styles.label}>Max Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="20"
                    keyboardType="numeric"
                    value={filters.maxAge}
                    onChangeText={(text) => setFilters({ ...filters, maxAge: text })}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.searchButton]}
                onPress={handleSearch}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClear}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  collapsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  collapsedHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  collapsedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  collapsedSummary: {
    fontSize: 12,
    color: '#666',
  },
  expandIcon: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  collapseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  collapseButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filtersSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  searchButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
  },
  resultMetaText: {
    fontSize: 12,
    color: '#999',
  },
});



