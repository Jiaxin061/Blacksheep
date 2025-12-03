import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
        options={{ title: "Admin Dashboard" }}
      />
      <Stack.Screen
        name="admin/add-animal"
        options={{ title: "Add Animal Profile" }}
      />
      <Stack.Screen
        name="admin/edit-animal"
        options={{ title: "Edit Animal Profile" }}
      />
    </Stack>
  );
}
