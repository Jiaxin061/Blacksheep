// File: app/pages/communityCreatePostPage.js

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommunityController } from '../_controller/CommunityController';

// --- Theme ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef'
};
// -------------

const CommunityCreatePostPage = () => {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [statusBarTranslucent, setStatusBarTranslucent] = useState(true);

    // Mock user
    const CURRENT_USER_ID = 2;

    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    useEffect(() => {
        if (isEditMode) {
            if (params.initialText) setText(params.initialText);
            if (params.initialImage) {
                // In edit mode, if there's an image, set it
                setSelectedImage(params.initialImage);
            }
        }
    }, [isEditMode, params.id]);

    const pickImage = async () => {
        // Hide status bar entirely during picking to avoid all overlaps
        if (Platform.OS === 'android') StatusBar.setHidden(true, 'fade');

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (Platform.OS === 'android') StatusBar.setHidden(false, 'fade');

        if (!result.canceled) {
            console.log('Image Source URI:', result.assets[0].uri);
            setSelectedImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'We need camera permissions to make this work!');
            return;
        }

        if (Platform.OS === 'android') StatusBar.setHidden(true, 'fade');

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (Platform.OS === 'android') StatusBar.setHidden(false, 'fade');

        if (!result.canceled) {
            console.log('Image Source URI:', result.assets[0].uri);
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleAddPhoto = () => {
        Alert.alert(
            "Add Photo",
            "Choose a source",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Camera", onPress: takePhoto },
                { text: "Gallery", onPress: pickImage },
            ]
        );
    };

    const handlePost = async () => {
        if (!text.trim()) {
            Alert.alert("Validation", "Please enter some text.");
            return;
        }

        setSubmitting(true);

        let result;
        if (isEditMode) {
            result = await CommunityController.updatePost(params.id, CURRENT_USER_ID, text, selectedImage);
        } else {
            result = await CommunityController.shareExperience(CURRENT_USER_ID, text, selectedImage);
        }

        setSubmitting(false);

        if (result.success || result.message === 'Post updated successfully') {
            Alert.alert("Success", isEditMode ? "Post updated!" : "Post created!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } else {
            Alert.alert("Error", result.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} translucent={statusBarTranslucent} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Post' : 'Create Post'}</Text>
                <TouchableOpacity onPress={handlePost} disabled={submitting || !text.trim()}>
                    {submitting ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={[styles.postButtonText, !text.trim() && styles.disabledText]}>{isEditMode ? 'Save' : 'Post'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>Y</Text></View>
                    <Text style={styles.userName}>You</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Share your experience..."
                    multiline
                    value={text}
                    onChangeText={setText}
                    textAlignVertical="top"
                />

                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                            onLoad={() => console.log('Image loaded successfully')}
                            onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
                        />
                        <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
                            <Ionicons name="close-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Toolbar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <View style={styles.toolbar}>
                    <TouchableOpacity style={styles.toolButton} onPress={handleAddPhoto}>
                        <Ionicons name="image-outline" size={24} color={Colors.primary} />
                        <Text style={styles.toolText}>Add Photo</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.white },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: Colors.primary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.white },
    cancelText: { fontSize: 16, color: Colors.white },
    postButtonText: { fontSize: 16, color: Colors.white, fontWeight: '700' },
    disabledText: { color: '#ffffffff' },
    content: { padding: 16 },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#ccfbf1',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    avatarText: { color: '#0f766e', fontWeight: 'bold' },
    userName: { fontWeight: '600', fontSize: 16 },
    input: { fontSize: 18, color: Colors.text, minHeight: 150 },
    toolbar: {
        flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border,
        alignItems: 'center'
    },
    toolButton: { flexDirection: 'row', alignItems: 'center' },
    toolText: { marginLeft: 8, color: Colors.primary, fontWeight: '600' },
    imagePreviewContainer: { marginTop: 16, position: 'relative' },
    imagePreview: { width: '100%', height: 220, borderRadius: 12 },
    removeImage: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
    nextImage: {
        position: 'absolute', bottom: 12, right: 12,
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
        flexDirection: 'row', alignItems: 'center'
    },
    nextImageText: { color: Colors.white, fontWeight: '600', marginLeft: 4, fontSize: 12 }
});

export default CommunityCreatePostPage;
