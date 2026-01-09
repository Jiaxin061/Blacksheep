import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="user-home" options={{ title: "SavePaws Home", headerShown: false }} />
      <Stack.Screen
        name="animal-list"
        options={{ title: "Animals Needing Donations" }}
      />
      <Stack.Screen
        name="animal-details"
        options={{ title: "Animal Profile" }}
      />
      <Stack.Screen name="donation" options={{ title: "Make a Donation" }} />

      <Stack.Screen
        name="admin/dashboard"
        options={{
          title: "Admin Dashboard",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ fontSize: 18 }}>←</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="admin/add-animal"
        options={{ title: "Add Animal Profile" }}
      />
      <Stack.Screen
        name="admin/edit-animal"
        options={{ title: "Edit Animal Profile" }}
      />
      <Stack.Screen
        name="admin/fund-allocation/index"
        options={{ title: "Fund Allocation" }}
      />

      {/* User Routes */}
      <Stack.Screen
        name="donation-impact"
        options={{ title: "Your Donation Impact" }}
      />
      <Stack.Screen
        name="donation-impact/receipt/[transactionID]"
        options={{ title: "Donation Details" }}
      />
      <Stack.Screen
        name="user-select"
        options={{ title: "Select User", headerShown: false }}
      />

      {/* Reward Routes */}
      <Stack.Screen name="rewards/catalogue" options={{ title: "Reward Catalogue" }} />
      <Stack.Screen name="rewards/[rewardID]" options={{ title: "Reward Details" }} />
      <Stack.Screen name="rewards/voucher" options={{ title: "E-Voucher", headerLeft: () => null }} />
      <Stack.Screen name="rewards/history" options={{ title: "Redemption History" }} />
    </Stack>
  );
}
