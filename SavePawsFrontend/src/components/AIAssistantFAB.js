import { useNavigation, useNavigationState } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    white: '#FFFFFF',
};

const AIAssistantFAB = ({ bottom = 24, right = 24 }) => {
    const navigation = useNavigation();

    // Get current route name
    const currentRoute = useNavigationState(state => {
        if (!state || !state.routes || state.routes.length === 0) return 'Landing';
        return state.routes[state.routes.length - 1].name;
    });

    if (currentRoute === 'AIAssistant') return null;

    const handlePress = () => {
        navigation.navigate('AIAssistant');
    };

    // Screens that have bottom navigation (custom nav bar)
    const screensWithBottomNav = [
        'UserHome', 'RescueTasks', 'AcceptRescueTask', 'ViewReports',
        'DonationHome', 'AdoptionHub', 'AnimalList'
    ];

    // Adjusted bottom position
    const adjustedBottom = screensWithBottomNav.includes(currentRoute) ? 90 : 24;

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom: adjustedBottom, right }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* <Ionicons name="chatbubbles" size={28} color={Colors.white} /> */}
            <Text style={{ fontSize: 28 }}>💬</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 9999, // Ensure it's on top
    }
});

export default AIAssistantFAB;
