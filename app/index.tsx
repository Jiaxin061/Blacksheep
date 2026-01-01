import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../config/api";
import { colors } from "../theme/colors";
import { setCurrentUserID } from "../utils/auth";

interface User {
  userID: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export default function LoginScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  // 1. Fetch Users from Database on Load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      Alert.alert("Connection Error", "Could not load demo users from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelecting(true);
    try {
      // 2. Save Session
      await setCurrentUserID(user.userID);

      // 3. Navigate based on Role
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        // Navigate to the User Home (Main Page)
        router.replace("/user-home");
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    } finally {
      setSelecting(false);
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleSelectUser(item)}
      disabled={selecting}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, item.role === "admin" && styles.roleBadgeAdmin]}>
          <Text style={[styles.roleText, item.role === "admin" && styles.roleTextAdmin]}>
            {item.role.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Connecting to SavePaws...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SavePaws Login</Text>
        <Text style={styles.subtitle}>Select a profile to continue:</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.userID.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found in database.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 28, fontWeight: "bold", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  listContent: { padding: 16 },
  userCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 16, elevation: 2 },
  userInfo: { gap: 8 },
  userName: { fontSize: 20, fontWeight: "600", color: colors.textPrimary },
  userEmail: { fontSize: 14, color: colors.textSecondary },
  roleBadge: { alignSelf: "flex-start", backgroundColor: colors.muted, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleBadgeAdmin: { backgroundColor: colors.primary },
  roleText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  roleTextAdmin: { color: colors.surface },
  emptyText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary }
});