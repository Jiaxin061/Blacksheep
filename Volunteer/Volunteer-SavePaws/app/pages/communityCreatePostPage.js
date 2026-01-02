// File: app/pages/communityCreatePostPage.js

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CommunityController } from '../controller/CommunityController';

// --- Theme ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef'
};
// -------------

const CommunityCreatePostPage = () => {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // In a real app, use expo-image-picker. Here, using a hardcoded placeholder for demo of functionality.
    // Mock images to choose from
    const MOCK_IMAGES = [
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1444212477490-ca40a9250ef9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520038410233-7141f77e47aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ];
    const [imageIndex, setImageIndex] = useState(0);
    const [hasImage, setHasImage] = useState(false);

    // Mock user
    const CURRENT_USER_ID = 2;

    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    useEffect(() => {
        if (isEditMode) {
            if (params.initialText) setText(params.initialText);
            if (params.initialImage) {
                // Check if this image is one of our mocks or a full URL
                const idx = MOCK_IMAGES.indexOf(params.initialImage);
                if (idx !== -1) {
                    setImageIndex(idx);
                } else {
                    // It's a custom URL, just keep it as is (logic would need to handle this in a real app)
                }
                setHasImage(true);
            }
        }
    }, [isEditMode, params.id]);

    const handlePost = async () => {
        if (!text.trim()) {
            Alert.alert("Validation", "Please enter some text.");
            return;
        }

        setSubmitting(true);
        const imageUrl = hasImage ? MOCK_IMAGES[imageIndex] : null;

        let result;
        if (isEditMode) {
            result = await CommunityController.updatePost(params.id, text, imageUrl);
        } else {
            result = await CommunityController.shareExperience(CURRENT_USER_ID, text, imageUrl);
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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Post' : 'Create Post'}</Text>
                <TouchableOpacity onPress={handlePost} disabled={submitting || !text.trim()}>
                    {submitting ? (
                        <ActivityIndicator color={Colors.primary} />
                    ) : (
                        <Text style={[styles.postButtonText, !text.trim() && styles.disabledText]}>{isEditMode ? 'Save' : 'Post'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>Y</Text></View>
                    <Text style={styles.userName}>Karen (You)</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Share your experience..."
                    multiline
                    autoFocus
                    value={text}
                    onChangeText={setText}
                    textAlignVertical="top"
                />

                {hasImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: MOCK_IMAGES[imageIndex] }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImage} onPress={() => setHasImage(false)}>
                            <Ionicons name="close-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextImage} onPress={() => setImageIndex((imageIndex + 1) % MOCK_IMAGES.length)}>
                            <Ionicons name="refresh-circle" size={32} color={Colors.white} />
                            <Text style={styles.nextImageText}>Try another</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Toolbar */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
                <View style={styles.toolbar}>
                    <TouchableOpacity style={styles.toolButton} onPress={() => setHasImage(!hasImage)}>
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
    disabledText: { color: '#ccc' },
    content: { padding: 16, flex: 1 },
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
