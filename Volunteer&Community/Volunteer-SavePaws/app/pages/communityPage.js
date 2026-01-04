// File: app/pages/communityPage.js (Route: /pages/communityPage)

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommunityController } from '../_controller/CommunityController';
import AIAssistantFAB from '../components/AIAssistantFAB';

// --- Theme Constants (Matching Project Theme) ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#ccfbf1',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', success: '#10b981', background: '#F9FAFB'
};
const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 4, m: 8, l: 12, xl: 16 };
// ------------------------------------------------

// MOCK_USER_ID to simulate logged-in user (User 2)
const MOCK_USER_ID = 2;

// Post Card Component
// Post Card Component
const PostCard = ({ item, onPress, onEdit, onDelete, showEdit }) => {
    const isOwnPost = item.userId === MOCK_USER_ID;

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{isOwnPost ? 'You' : item.userName}</Text>
                        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>

                {showEdit && (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => onEdit(item)} style={styles.editButton}>
                            <Ionicons name="pencil" size={16} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(item)} style={[styles.editButton, { backgroundColor: Colors.error, marginLeft: 8 }]}>
                            <Ionicons name="trash" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Text style={styles.postContent} numberOfLines={3}>{item.contentText}</Text>

            {/* Post image with fallback to beautiful pet photos */}
            <Image
                source={{
                    uri: item.contentImage
                        ? (item.contentImage.startsWith('http') || item.contentImage.startsWith('file://') ? item.contentImage : `${CommunityController.API_URL}/${item.contentImage}`)
                        : `https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop&sig=${item.id % 10}`
                }}
                style={styles.postImage}
                resizeMode="cover"
            />

            <View style={styles.cardFooter}>
                <Text style={styles.readMore}>Read more...</Text>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );
};

const CommunityPage = () => {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [activeTab, setActiveTab] = useState('Public'); // 'Public' or 'Mine'

    // Derived filtered posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.contentText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.userName.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'Mine') {
            return matchesSearch && post.userId === MOCK_USER_ID;
        }
        return matchesSearch;
    });

    // Load Data
    const loadPosts = async () => {
        const data = await CommunityController.getCommunityFeed();
        setPosts(data);
        setIsLoading(false);
        setIsRefreshing(false);
    };

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadPosts();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadPosts();
    };

    const handlePostClick = (post) => {
        router.push({
            pathname: '/pages/communityPostDetailsPage',
            params: { id: post.id }
        });
    };

    const handleCreatePost = () => {
        router.push('/pages/communityCreatePostPage');
    };

    const handleAIAssistant = () => {
        router.push('/pages/aiAssistantPage');
    };

    const handleEditPost = (post) => {
        router.push({
            pathname: '/pages/communityCreatePostPage',
            params: {
                id: post.id,
                initialText: post.contentText,
                initialImage: post.contentImage
            }
        });
    };

    const handleDeletePost = (post) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await CommunityController.deletePost(post.id);
                        if (result.success) {
                            loadPosts(); // Refresh list
                        } else {
                            Alert.alert("Error", result.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Community</Text>
                <TouchableOpacity style={styles.createButtonHeader} onPress={handleCreatePost}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Public' && styles.activeTab]}
                    onPress={() => setActiveTab('Public')}
                >
                    <Text style={[styles.tabText, activeTab === 'Public' && styles.activeTabText]}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Mine' && styles.activeTab]}
                    onPress={() => setActiveTab('Mine')}
                >
                    <Text style={[styles.tabText, activeTab === 'Mine' && styles.activeTabText]}>My Posts</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <View style={styles.searchBarContainer}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={Colors.textSecondary}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Feed */}
                    {isLoading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredPosts}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <PostCard
                                    item={item}
                                    onPress={handlePostClick}
                                    onEdit={handleEditPost}
                                    onDelete={handleDeletePost}
                                    showEdit={activeTab === 'Mine' && item.userId === MOCK_USER_ID}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                            ListEmptyComponent={
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>No Posts Here</Text>
                                </View>
                            }
                        />
                    )}

                    {/* AI Assistant Floating Button (Standardized) */}
                    <AIAssistantFAB bottom={80} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: Colors.primary,
        borderBottomWidth: 0,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        justifyContent: 'center',
    },
    tab: {
        paddingVertical: 12,
        marginHorizontal: 30,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.primary,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        backgroundColor: Colors.primary,
        borderRadius: 16,
    },
    editButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    createButtonHeader: {
        backgroundColor: Colors.white,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBarContainer: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.m,
        paddingHorizontal: Spacing.s,
        height: 40,
    },
    searchIcon: { marginRight: Spacing.xs },
    searchInput: {
        flex: 1,
        color: Colors.text,
        fontSize: 14,
    },
    listContent: { padding: Spacing.m, paddingBottom: 80 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
        marginBottom: Spacing.m,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s },
    avatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center', alignItems: 'center',
        marginRight: Spacing.s
    },
    avatarText: { color: Colors.primaryDark, fontWeight: 'bold', fontSize: 18 },
    userName: { fontWeight: '700', color: Colors.text, fontSize: 16 },
    timestamp: { color: Colors.textSecondary, fontSize: 12 },
    postContent: { color: Colors.text, lineHeight: 22, fontSize: 14, marginBottom: Spacing.s },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.m,
        marginBottom: Spacing.s,
        borderWidth: 1,
        borderColor: Colors.primary, // Debug border
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.s },
    readMore: { color: Colors.primary, fontWeight: '600' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.textSecondary, fontSize: 16 },
});

export default CommunityPage;
