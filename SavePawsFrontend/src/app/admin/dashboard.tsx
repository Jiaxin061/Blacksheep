import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";

export default function DonationDashboardScreen() {
  const router = useRouter();

  const cards = [
    {
      title: "Animal Profiles",
      description: "Create, edit, delete, and archive animal donation profiles.",
      icon: "🐾",
      path: "/admin/animals",
    },
    {
      title: "Fund Allocation",
      description: "Track donated amounts and allocate funds to animal needs.",
      icon: "💚",
      path: "/admin/fund-allocation",
    },
    {
      title: "Reward Catalogue",
      description: "Manage reward items, stock, and archive status.",
      icon: "🎁",
      path: "/admin/rewards",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage animal profiles and track fund allocation.
        </Text>
      </View>

      <View style={styles.cards}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.title}
            style={[styles.card, index % 2 === 1 && styles.secondaryCard]}
            activeOpacity={0.9}
            onPress={() => {
              if (card.path) {
                router.push(card.path);
              } else {
                Alert.alert("Coming soon", "This section will be added shortly.");
              }
            }}
          >
            <View
              style={[
                styles.cardIcon,
                index % 2 === 1 && styles.secondaryIcon,
              ]}
            >
              <Text style={styles.iconText}>{card.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  secondaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  secondaryIcon: {
    backgroundColor: colors.muted,
  },
  iconText: {
    fontSize: 26,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 28,
    color: colors.primaryDark,
    marginLeft: 8,
  },
});


