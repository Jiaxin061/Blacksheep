import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import AdminAdoptionListScreen from './AdminAdoptionListScreen';
import AdminAdoptionUpdatesScreen from './AdminAdoptionUpdatesScreen';

const AdminAdoptionManagerScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'updates'

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* Helper Header to go back if needed, though usually admin workflow is different. 
            AppNavigator probably provides a header, so we might not need this if headerShown: true */}
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'requests' && styles.segmentBtnActive]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>
                        Adoption Requests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'updates' && styles.segmentBtnActive]}
                    onPress={() => setActiveTab('updates')}
                >
                    <Text style={[styles.segmentText, activeTab === 'updates' && styles.segmentTextActive]}>
                        Adoption Updates
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {activeTab === 'requests' ? (
                    <AdminAdoptionListScreen navigation={navigation} />
                ) : (
                    <AdminAdoptionUpdatesScreen navigation={navigation} />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    segmentContainer: {
        flexDirection: 'row',
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    segmentBtnActive: {
        backgroundColor: '#14b8a6',
        shadowColor: '#14b8a6',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#14b8a6',
    },
    segmentTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
});

export default AdminAdoptionManagerScreen;
