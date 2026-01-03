// File: app/pages/communityPostDetailsPage.js (Route: /pages/communityPostDetailsPage)

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AIAssistantFAB from '../components/AIAssistantFAB';
import { CommunityController } from '../controller/CommunityController';
import { CommunityService } from '../services/CommunityService'; // Direct service access for simple comments

// --- Theme ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef', background: '#F9FAFB'
};
// -------------

const CommunityPostDetailsPage = () => {
    const { id } = useLocalSearchParams();
    const [postData, setPostData] = useState(null); // { post, comments }
    const [isLoading, setIsLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mock User ID (In real app, get from Auth Context)
    const CURRENT_USER_ID = 2;

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        if (!id) return;
        const result = await CommunityController.getPostDetails(id);
        if (result) {
            setPostData(result);
        } else {
            Alert.alert("Error", "Could not load post details.");
            router.back();
        }
        setIsLoading(false);
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        setSubmitting(true);
        // Call Service directly for simple action
        try {
            await CommunityService.addComment(id, CURRENT_USER_ID, commentText);
            setCommentText('');
            loadDetails(); // Refresh comments
        } catch (e) {
            Alert.alert("Error", "Failed to post comment.");
        }
        setSubmitting(false);
    };

    const handleDeleteComment = (commentId) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await CommunityController.deleteComment(commentId);
                        if (result.success) {
                            loadDetails(); // Refresh
                        } else {
                            Alert.alert("Error", result.message);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!postData) return null;

    const { post, comments } = postData;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Details</Text>
                {post.id && post.userId === CURRENT_USER_ID ? (
                    <TouchableOpacity onPress={() => router.push({
                        pathname: '/pages/communityCreatePostPage',
                        params: {
                            id: post.id,
                            initialText: post.contentText,
                            initialImage: post.contentImage
                        }
                    })}>
                        <Ionicons name="pencil-outline" size={22} color={Colors.white} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Post Content */}
                <View style={styles.postContainer}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{post.userName?.charAt(0) || 'U'}</Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>{post.userName || 'Anonymous User'}</Text>
                            <Text style={styles.timestamp}>{new Date(post.createdAt).toLocaleString()}</Text>
                        </View>
                    </View>

                    <Text style={styles.postText}>{post.contentText}</Text>

                    {/* Post Image with Fallback */}
                    {(post.contentImage || true) && (
                        <Image
                            source={{
                                uri: post.contentImage
                                    ? (post.contentImage.startsWith('http') || post.contentImage.startsWith('file://') ? post.contentImage : `${CommunityController.API_URL}/${post.contentImage}`)
                                    : `https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop&sig=${post.id % 10}`
                            }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    )}
                </View>

                {/* Comments Section */}
                <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

                {comments.map((comment) => (
                    <View key={comment.commentID} style={styles.commentCard}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentUser}>
                                {comment.first_name} {comment.last_name}
                                <Text style={styles.commentTime}> • {new Date(comment.comment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </Text>
                            {(comment.userID === CURRENT_USER_ID || comment.user_id === CURRENT_USER_ID) && (
                                <TouchableOpacity onPress={() => handleDeleteComment(comment.commentID || comment.id)}>
                                    <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.commentText}>{comment.comment_text}</Text>
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Comment Input */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSendComment} disabled={submitting || !commentText.trim()}>
                        <Ionicons
                            name="send"
                            size={24}
                            color={!commentText.trim() ? Colors.textSecondary : Colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <AIAssistantFAB bottom={100} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingTop: 12, paddingBottom: 22, backgroundColor: Colors.primary
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.white },
    scrollContent: { padding: 16 },
    postContainer: { marginBottom: 24 },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    avatarText: { color: '#0f766e', fontWeight: 'bold' },
    userName: { fontWeight: '700', fontSize: 16 },
    timestamp: { color: Colors.textSecondary, fontSize: 12 },
    postText: { fontSize: 16, lineHeight: 24, color: Colors.text, marginBottom: 16 },
    postImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 16 },
    commentCard: {
        backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 12
    },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    commentUser: { fontWeight: '600', fontSize: 14 },
    commentTime: { fontWeight: '400', color: Colors.textSecondary, fontSize: 12 },
    commentText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: 'white'
    },
    input: {
        flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16,
        paddingVertical: 10, marginRight: 12, maxHeight: 100
    }
});

export default CommunityPostDetailsPage;
