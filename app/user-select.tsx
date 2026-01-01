import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { setCurrentUserID } from "../utils/auth";
import { colors } from "../theme/colors";

interface DemoUser {
  userID: number;
  name: string;
  email: string;
  role: string;
}

// Demo users - in production, these would come from API
const DEMO_USERS: DemoUser[] = [
  { userID: 1, name: "Demo User 1", email: "demo.user1@savepaws.com", role: "user" },
  { userID: 2, name: "Demo User 2", email: "demo.user2@savepaws.com", role: "user" },
  { userID: 3, name: "Admin User", email: "admin@savepaws.com", role: "admin" },
];

export default function UserSelectScreen() {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);

  const handleSelectUser = async (user: DemoUser) => {
    setSelecting(true);
    try {
      await setCurrentUserID(user.userID);
      // Navigate based on role
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/animal-list");
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    } finally {
      setSelecting(false);
    }
  };

  const renderUserCard = ({ item }: { item: DemoUser }) => {
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => handleSelectUser(item)}
        disabled={selecting}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View
            style={[
              styles.roleBadge,
              item.role === "admin" && styles.roleBadgeAdmin,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                item.role === "admin" && styles.roleTextAdmin,
              ]}
            >
              {item.role.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (selecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Setting up session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Demo User</Text>
        <Text style={styles.subtitle}>
          Choose a user to continue. This is a temporary authentication system
          for development.
        </Text>
      </View>

      <FlatList
        data={DEMO_USERS}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.userID.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userInfo: {
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.primary,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  roleTextAdmin: {
    color: colors.surface,
  },
});

