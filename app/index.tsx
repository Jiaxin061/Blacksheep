import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Animal Rescue Donation Portal</Text>
          <Text style={styles.subtitle}>
            Support rescues or manage campaigns from one place.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.userCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/animal-list")}
          >
            <Ionicons name="paw" size={42} color={colors.success} />
            <Text style={styles.cardTitle}>Continue as User</Text>
            <Text style={styles.cardDescription}>
              Browse animals seeking support and make donations.
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.adminCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/admin/dashboard")}
          >
            <Ionicons name="settings" size={42} color={colors.primaryDark} />
            <Text style={styles.cardTitle}>Admin Portal</Text>
            <Text style={styles.cardDescription}>
              Manage animal profiles, funding goals, and statuses.
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Choose your role to get started</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  hero: {
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.surface,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#DDF7F4",
    lineHeight: 26,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  userCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.primaryLight,
  },
  adminCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.primaryDark,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    textAlign: "center",
    color: "#E9FFFC",
    fontSize: 16,
    marginBottom: 16,
  },
});
