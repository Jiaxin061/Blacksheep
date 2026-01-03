
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AdminCommunityController } from '../_controller/AdminCommunityController';

const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e',
    white: '#FFFFFF', text: '#111827', textSecondary: '#5b6b7c', border: '#e2e8ef',
    error: '#ef4444', background: '#F9FAFB'
};

const Spacing = { s: 8, m: 16 };
const BorderRadius = { l: 12 };

const PostCard = ({ item, onDelete, onRestore }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#d1fae5' : '#fee2e2' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Active' ? '#059669' : '#b91c1c' }]}>
                    {item.status}
                </Text>
            </View>
        </View>

        <Text style={styles.postContent}>{item.contentText}</Text>
        {item.contentImage && (
            <Image
                source={{
                    uri: item.contentImage.startsWith('http') ? item.contentImage : `${AdminCommunityController.API_URL}/${item.contentImage}`
                }}
                style={styles.postImage}
                resizeMode="cover"
            />
        )}

        <View style={styles.cardFooter}>
            {item.status === 'Active' ? (
                <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={18} color={Colors.white} />
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => onRestore(item)} style={styles.restoreButton}>
                    <Ionicons name="refresh-outline" size={18} color={Colors.white} />
                    <Text style={styles.buttonText}>Restore</Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
);

const AdminCommunityManagementPage = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Latest'); // 'Latest' (Active) or 'Post' (Deleted)

    const loadPosts = async () => {
        setIsLoading(true);
        // Map 'Latest' -> 'Active', 'Post' -> 'Deleted'
        const status = activeTab === 'Latest' ? 'Active' : 'Deleted';
        const data = await AdminCommunityController.getAllPosts(status);
        setPosts(data);
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadPosts();
        }, [activeTab])
    );

    const handleDelete = (post) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: "destructive",
                    onPress: async () => {
                        await AdminCommunityController.deletePost(post.id);
                        loadPosts();
                    }
                }
            ]
        );
    };

    const handleRestore = (post) => {
        Alert.alert(
            "Restore Post",
            "Are you sure you want to restore this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        await AdminCommunityController.restorePost(post.id);
                        loadPosts();
                    }
                }
            ]
        );
    };

    const filteredPosts = posts.filter(post =>
        post.contentText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.2)" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Community Management</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs - Rename Explore -> Latest, My Posts -> Post */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Latest' && styles.activeTab]}
                    onPress={() => setActiveTab('Latest')}
                >
                    <Text style={[styles.tabText, activeTab === 'Latest' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Post' && styles.activeTab]}
                    onPress={() => setActiveTab('Post')}
                >
                    <Text style={[styles.tabText, activeTab === 'Post' && styles.activeTabText]}>Deleted</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                {/* Search */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
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

                {/* List */}
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredPosts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <PostCard item={item} onDelete={handleDelete} onRestore={handleRestore} />
                        )}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadPosts} colors={[Colors.primary]} />}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Text style={styles.emptyText}>No Posts Found</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.primary, paddingTop: StatusBar.currentHeight || 0 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.m, paddingVertical: 16, backgroundColor: Colors.primary,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
    tabContainer: {
        flexDirection: 'row', backgroundColor: Colors.white,
        paddingHorizontal: Spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border,
        justifyContent: 'center',
    },
    tab: {
        paddingVertical: 12, marginHorizontal: 30,
        borderBottomWidth: 3, borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: Colors.primary },
    tabText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
    activeTabText: { color: Colors.primary },
    searchBarContainer: {
        padding: Spacing.m, backgroundColor: Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
        borderRadius: 8, paddingHorizontal: 8, height: 40,
    },
    searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
    listContent: { padding: Spacing.m },
    card: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.l, padding: Spacing.m,
        marginBottom: Spacing.m, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s },
    avatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccfbf1',
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.s
    },
    avatarText: { color: Colors.primaryDark, fontWeight: 'bold', fontSize: 18 },
    userName: { fontWeight: '700', color: Colors.text, fontSize: 16 },
    timestamp: { color: Colors.textSecondary, fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    postContent: { color: Colors.text, fontSize: 14, marginBottom: Spacing.s, lineHeight: 20 },
    postImage: {
        width: '100%', height: 200, borderRadius: 8, marginBottom: Spacing.s, backgroundColor: '#e5e7eb',
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
    deleteButton: {
        backgroundColor: Colors.error, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    },
    buttonText: { color: Colors.white, fontWeight: '600', marginLeft: 4, fontSize: 12 },
    deletedInfo: { flexDirection: 'row', alignItems: 'center' },
    deletedText: { marginLeft: 4, color: Colors.textSecondary, fontStyle: 'italic' },
    restoreButton: {
        backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.textSecondary, fontSize: 16 },
});

export default AdminCommunityManagementPage;
