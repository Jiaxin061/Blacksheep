import { Platform } from "react-native";

const getBaseUrl = () => {
  // 1. Production Mode
  if (!__DEV__) {
    return "https://your-production-api.com";
  }

  // 2. Web Browser or iOS Simulator
  // Web browsers need 'localhost' to talk to the backend on the same computer
  if (Platform.OS === "web" || Platform.OS === "ios") {
    return "http://localhost:3000";
  }

  // 3. Android Emulator
  // Android emulators cannot see 'localhost'. They must use '10.0.2.2'
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
};

export const API_BASE_URL = getBaseUrl();