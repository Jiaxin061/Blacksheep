import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "@savepaws:userID";
const AUTH_TOKEN_KEY = "@savepaws:authToken";
const USER_TYPE_KEY = "@savepaws:userType"; // 'user' or 'admin'

/**
 * Get current user ID from storage
 */
export const getCurrentUserID = async (): Promise<number | null> => {
  try {
    const userID = await AsyncStorage.getItem(USER_ID_KEY);
    return userID ? parseInt(userID) : null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Set current user ID in storage
 */
export const setCurrentUserID = async (userID: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userID.toString());
  } catch (error) {
    console.error("Error setting user ID:", error);
  }
};

/**
 * Clear current user ID
 */
export const clearUserID = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_TYPE_KEY);
  } catch (error) {
    console.error("Error clearing user ID:", error);
  }
};

/**
 * Get auth token from storage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Set auth token in storage
 */
export const setAuthToken = async (token: string, userType: 'user' | 'admin'): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_TYPE_KEY, userType);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

/**
 * Get auth headers for API requests
 * Uses JWT token if available, falls back to x-user-id header
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  const userID = await getCurrentUserID();
  
  const headers: Record<string, string> = {};
  
  // Prefer JWT token (Bearer token) for authentication
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("🔐 Auth token found:", token.substring(0, 20) + "...");
  } else {
    console.warn("⚠️ No auth token found in storage");
  }
  
  // Fallback: Include x-user-id header for backward compatibility
  if (userID) {
    headers["x-user-id"] = userID.toString();
    console.log("👤 User ID found:", userID);
  } else {
    console.warn("⚠️ No user ID found in storage");
  }
  
  console.log("📤 Auth headers being sent:", {
    hasAuthorization: !!headers["Authorization"],
    hasUserId: !!headers["x-user-id"],
    userId: userID
  });
  
  return headers;
};

