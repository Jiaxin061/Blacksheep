export default {
  expo: {
    name: "SavePaws",
    slug: "savepaws",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.savepaws.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.savepaws.app"
    },
    web: {
    },
    extra: {
      // API URL - change this to your backend URL
      // For Android Emulator: use "http://10.0.2.2:3000"
      // For iOS Simulator: use "http://localhost:3000"
      // For Physical Device: use your computer's IP address (e.g., "http://192.168.1.100:3000")
      // To find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
      apiUrl: process.env.API_URL || "http://10.0.2.2:3000" // Default for Android emulator
    }
  }
};

