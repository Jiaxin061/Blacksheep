// File: app/pages/CommunityPage.js

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCommunityFeed, deleteCommunityPost } from '../services/api';

// --- Theme Constants (Matching Project Theme) ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#ccfbf1',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', success: '#10b981', background: '#F9FAFB'
};
const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
const BorderRadius = { s: 4, m: 8, l: 12, xl: 16 };
// ------------------------------------------------

const PostCard = ({ item, onPress, onEdit, onDelete, currentUserId }) => {
    const isOwnPost = item.userId === currentUserId;

    // Construct Image URL
    // If it starts with http/file, use it. Else, assume it's a filename from backend uploads.
    // For emulator (10.0.2.2), backend usually returns filename.
    // We need to construct the full URL if it's just a filename.
    // Assuming API is at localhost:3000 or 10.0.2.2:3000
    // But since we can't easily get the base URL here without importing config,
    // let's assume the component will handle full URLs or we construct it.
    // Ideally, getCommunityFeed should return full URLs or we use a helper.
    // For now, let's try to construct it if it's a simple filename.

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('file://')) return imagePath;
        // Basic assumption for emulator/device testing:
        return `http://10.0.2.2:3000/uploads/${imagePath}`;
    };

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.userName ? item.userName.charAt(0) : 'U'}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{isOwnPost ? 'You' : item.userName}</Text>
                        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>

                {isOwnPost && (
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

            {/* Post image */}
            {item.contentImage && (
                <Image
                    source={{ uri: getImageUrl(item.contentImage) }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            )}

            <View style={styles.cardFooter}>
                <Text style={styles.readMore}>Read more...</Text>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );
};

const CommunityPage = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [activeTab, setActiveTab] = useState('Public'); // 'Public' or 'Mine'

    // Load Data
    const loadData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) setCurrentUserId(Number(userId));

            const data = await getCommunityFeed();
            setPosts(data || []);
        } catch (error) {
            console.log('Error loading posts:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Derived filtered posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = (post.contentText && post.contentText.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (post.userName && post.userName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (activeTab === 'Mine') {
            return matchesSearch && post.userId === currentUserId;
        }
        return matchesSearch;
    });

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    const handlePostClick = (post) => {
        navigation.navigate('CommunityPostDetails', { id: post.id });
    };

    const handleCreatePost = () => {
        navigation.navigate('CommunityCreatePost');
    };

    const handleEditPost = (post) => {
        navigation.navigate('CommunityCreatePost', {
            id: post.id,
            initialText: post.contentText,
            initialImage: post.contentImage
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
                        const result = await deleteCommunityPost(post.id);
                        if (result.success) {
                            loadData(); // Refresh list
                        } else {
                            Alert.alert("Error", result.message || 'Failed to delete');
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
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
                            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                            renderItem={({ item }) => (
                                <PostCard
                                    item={item}
                                    onPress={handlePostClick}
                                    onEdit={handleEditPost}
                                    onDelete={handleDeletePost}
                                    currentUserId={currentUserId}
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
        flex: 1, // Ensure content takes up space
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
    listContent: { padding: Spacing.m, paddingBottom: 180 },
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
        borderColor: Colors.border,
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.s },
    readMore: { color: Colors.primary, fontWeight: '600' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.textSecondary, fontSize: 16 },
});

export default CommunityPage;
