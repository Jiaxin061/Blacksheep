import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "@savepaws:userID";

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
  } catch (error) {
    console.error("Error clearing user ID:", error);
  }
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const userID = await getCurrentUserID();
  if (!userID) {
    return {};
  }
  return {
    "x-user-id": userID.toString(),
  };
};

