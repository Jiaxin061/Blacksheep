import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VolunteerScreen() {
  // Check if user is registered as volunteer
  const [isRegistered, setIsRegistered] = useState(false);
  const [volunteerData, setVolunteerData] = useState({
    name: 'Karen',
    totalHours: 24,
    eventsJoined: 5,
    animalsHelped: 12
  });

  // Simulating checking registration status
  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = () => {
    // TODO: Replace with actual check from your storage/database
    setIsRegistered(false); // Change to true to see registered view
  };

  const handleBack = () => {
    router.back();
  };

  // If not registered, show registration prompt
  if (!isRegistered) {
    return (
      <View style={styles.container}>
        {/* Back Button Header */}
        <View style={styles.unregisteredHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.unregisteredHeaderTitle}>Volunteer</Text>
          <View style={styles.backButton} /> 
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.unregisteredContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.heroSection}>
            <Text style={styles.heroIcon}>🤝</Text>
            <Text style={styles.heroTitle}>Become a Volunteer?</Text>
            <Text style={styles.heroSubtitle}>
              Join as volunteer and make a real difference in your area
            </Text>
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Volunteer?</Text>
            
            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>❤️</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Make a Difference</Text>
                <Text style={styles.benefitDescription}>
                  Help save and care for animals in need
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>👥</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Join Together</Text>
                <Text style={styles.benefitDescription}>
                  Connect with 523+ volunteers
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>🏆</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Gain Experience</Text>
                <Text style={styles.benefitDescription}>
                  Learn animal care and rescue skills
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>⏰</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Flexible Schedule</Text>
                <Text style={styles.benefitDescription}>
                  Choose events that fit your time
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/volunteerRegistration')}
          >
            <Text style={styles.registerButtonText}>Register as Volunteer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={() => Alert.alert('Learn More', 'More information about volunteering...')}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // If registered, show volunteer dashboard
  return (
    <View style={styles.container}>
      {/* Back Button Header */}
      <View style={styles.unregisteredHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.unregisteredHeaderTitle}>Volunteer</Text>
        <View style={styles.backButton} /> 
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{volunteerData.name}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.registeredContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{volunteerData.totalHours}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{volunteerData.eventsJoined}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400' }}
                style={styles.eventImage}
              />
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Tomorrow</Text>
              </View>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Street Dog Feeding Drive</Text>
              <Text style={styles.eventDetail}>📍 Skudai Town Area</Text>
              <Text style={styles.eventDetail}>🕐 2:00 PM - 5:00 PM</Text>
              <Text style={styles.eventDetail}>👥 12 volunteers joined</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400' }}
                style={styles.eventImage}
              />
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>This Week</Text>
              </View>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Animal Shelter Cleanup</Text>
              <Text style={styles.eventDetail}>📍 SavePaws Shelter, JB</Text>
              <Text style={styles.eventDetail}>🕐 Saturday, 9:00 AM - 1:00 PM</Text>
              <Text style={styles.eventDetail}>👥 8 volunteers joined</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?q=80&w=400' }}
                style={styles.eventImage}
              />
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Next Week</Text>
              </View>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Pet Adoption Fair</Text>
              <Text style={styles.eventDetail}>📍 City Square Mall</Text>
              <Text style={styles.eventDetail}>🕐 Sunday, 10:00 AM - 6:00 PM</Text>
              <Text style={styles.eventDetail}>👥 25 volunteers needed</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Contributions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Contributions</Text>

          <View style={styles.contributionCard}>
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionIcon}>✅</Text>
              <View style={styles.contributionInfo}>
                <Text style={styles.contributionTitle}>Beach Cleanup Drive</Text>
                <Text style={styles.contributionDate}>November 10, 2025</Text>
              </View>
              <Text style={styles.contributionHours}>4h</Text>
            </View>
            <Text style={styles.contributionDescription}>
              Helped clean beach area and rescued 2 injured seabirds
            </Text>
          </View>

          <View style={styles.contributionCard}>
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionIcon}>✅</Text>
              <View style={styles.contributionInfo}>
                <Text style={styles.contributionTitle}>TNR Program</Text>
                <Text style={styles.contributionDate}>November 5, 2025</Text>
              </View>
              <Text style={styles.contributionHours}>6h</Text>
            </View>
            <Text style={styles.contributionDescription}>
              Trap-Neuter-Return program for 8 community cats
            </Text>
          </View>

          <View style={styles.contributionCard}>
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionIcon}>✅</Text>
              <View style={styles.contributionInfo}>
                <Text style={styles.contributionTitle}>Shelter Renovation</Text>
                <Text style={styles.contributionDate}>October 28, 2025</Text>
              </View>
              <Text style={styles.contributionHours}>8h</Text>
            </View>
            <Text style={styles.contributionDescription}>
              Built new dog kennels and painted shelter walls
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  unregisteredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unregisteredHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 36,
    color: '#333',
  },
  // Unregistered User Styles
  unregisteredContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40, // Added padding at bottom for better scrolling
  },
  registeredContent: {
    padding: 20,
    paddingBottom: 40, // Added padding at bottom for better scrolling
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    marginBottom: 30,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#2196f3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  learnMoreButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  learnMoreText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
  },
  // Registered User Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced padding since we have the back header
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#2196f3',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  eventBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contributionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contributionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contributionInfo: {
    flex: 1,
  },
  contributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contributionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contributionHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  contributionDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 36,
  },
});