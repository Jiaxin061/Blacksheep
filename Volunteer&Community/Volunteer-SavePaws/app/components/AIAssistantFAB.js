import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

const Colors = {
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    white: '#FFFFFF',
};

const AIAssistantFAB = ({ bottom = 24, right = 24 }) => {
    const handlePress = () => {
        router.push('/pages/aiAssistantPage');
    };

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom, right }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Ionicons name="chatbubbles" size={28} color={Colors.white} />
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
