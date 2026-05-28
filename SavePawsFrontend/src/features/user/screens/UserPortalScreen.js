import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimalList from '../../animals/components/AnimalList';
import AnimalSearch from '../../animals/components/AnimalSearch';

export default function UserPortalScreen({ navigation, route }) {
  const initialSection = route?.params?.initialSection ?? 'view';
  const [activeSection, setActiveSection] = useState(initialSection);

  const sections = [
    {
      key: 'view',
      title: 'View Animals',
      description: 'Browse every rescue currently in the shelter.',
      icon: '🐾',
    },
    {
      key: 'search',
      title: 'Search Animals',
      description: 'Filter by species, status, or age to find a match.',
      icon: '🔍',
    },
  ];

  const renderTopSection = () => (
    <>
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#0D47A1']}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>💙</Text>
        <Text style={styles.heroTitle}>SavePaws Community</Text>
        <Text style={styles.heroSubtitle}>
          Explore every animal in our care or search for the perfect companion.
        </Text>
      </LinearGradient>

      <View style={styles.cardsRow}>
        {sections.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <TouchableOpacity
              key={section.key}
              style={[styles.sectionCard, isActive && styles.sectionCardActive]}
              onPress={() => setActiveSection(section.key)}
              accessibilityRole="button"
              accessibilityLabel={section.title}
            >
              <Text style={styles.cardIcon}>{section.icon}</Text>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
              <Text style={[styles.cardAction, isActive && styles.cardActionActive]}>
                {isActive ? 'Active' : 'Switch'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderTopSection()}
        <View style={styles.sectionContent}>
          {activeSection === 'search' ? (
            <AnimalSearch navigation={navigation} isAdmin={false} />
          ) : (
            <AnimalList navigation={navigation} isAdmin={false} variant="static" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f8',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    margin: 16,
    paddingVertical: Platform.OS === 'ios' ? 32 : 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionCardActive: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#556070',
    marginBottom: 12,
  },
  cardAction: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#90A4AE',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardActionActive: {
    color: '#2196F3',
  },
  sectionContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

