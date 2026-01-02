import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="pages/homepage" />
            <Stack.Screen name="pages/adminCommunityManagementPage" />
            <Stack.Screen name="pages/adminEventManagementPage" />
            <Stack.Screen name="pages/adminRegistrationManagementPage" />
        </Stack>
    );
}
