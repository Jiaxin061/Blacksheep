// File: app/pages/aiAssistantPage.js

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIController } from '../_controller/AIController';

// --- Theme ---
const Colors = {
    primary: '#14b8a6', primaryDark: '#0f766e', primaryLight: '#e0f2f1', // Slightly deeper teal for background
    white: '#FFFFFF', text: '#374151', textSecondary: '#6b7280', border: '#e5e7eb',
    myMsg: '#14b8a6', aiMsg: '#fef2f2' // Subtler pink for AI messages
};
// -------------

const INITIAL_GREETING = { id: '0', text: "Woof! I'm Pawlo 🐶\n\nI'm here to help you with animal first aid, rescue tips, or others about animals! How can I help today?", sender: 'ai' };

const AIAssistantPage = () => {
    const [messages, setMessages] = useState([INITIAL_GREETING]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyList, setHistoryList] = useState([]);

    // Mock User ID
    const CURRENT_USER_ID = 2;

    const flatListRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsTyping(true);
        // Load only ACTIVE history for the main feed
        const history = await AIController.getAIHistory(CURRENT_USER_ID);
        if (history && history.length > 0) {
            const historyMessages = [];
            history.forEach((chat, index) => {
                historyMessages.push({
                    id: `user-${index}`,
                    text: chat.user_query,
                    sender: 'user',
                    timestamp: chat.chat_timestamp
                });
                historyMessages.push({
                    id: `ai-${index}`,
                    text: chat.ai_response,
                    sender: 'ai',
                    timestamp: chat.chat_timestamp
                });
            });
            setMessages([INITIAL_GREETING, ...historyMessages]);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        }

        // Pre-load full history for the modal
        const fullHistory = await AIController.getFullAIHistory(CURRENT_USER_ID);
        setHistoryList(fullHistory || []);

        setIsTyping(false);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

        // Call Controller
        const responseText = await AIController.askAI(CURRENT_USER_ID, userMsg.text);

        setIsTyping(false);
        const aiMsg = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai' };
        setMessages(prev => [...prev, aiMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    const handleNewChat = async () => {
        // Clear current session on server
        await AIController.clearAIHistory(CURRENT_USER_ID);
        // Reset local UI state
        setMessages([INITIAL_GREETING]);
        // Update history modal data
        const fullHistory = await AIController.getFullAIHistory(CURRENT_USER_ID);
        setHistoryList(fullHistory || []);
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.msgContainer, isUser ? styles.msgRight : styles.msgLeft]}>
                {!isUser && (
                    <View style={styles.botAvatar}>
                        {/* Cuter Icon */}
                        <Text style={{ fontSize: 18 }}>🐶</Text>
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                    <Text style={[styles.msgText, isUser ? styles.textUser : styles.textAi]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    const HistoryItem = ({ item }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const dateString = new Date(item.chat_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

        return (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.historyQuerySummary} numberOfLines={isExpanded ? undefined : 1}>
                            <Text style={{ fontWeight: 'bold' }}>Q:</Text> {item.user_query}
                        </Text>
                        <Text style={styles.historyDate}>{dateString}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
                </View>

                {isExpanded && (
                    <View style={styles.historyContent}>
                        <View style={styles.historyDivider} />
                        <Text style={styles.historyResponse}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primary }}>Pawlo:</Text> {item.ai_response}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={Colors.textSecondary} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Pawlo 🐾</Text>
                    <Text style={styles.headerSubtitle}>Your AI Companion</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleNewChat} style={[styles.newChatBtn, { marginRight: 10 }]}>
                        <Ionicons name="add" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.newChatBtn}>
                        <Ionicons name="menu-outline" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    isTyping && (
                        <View style={styles.typingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.typingText}>AI is typing...</Text>
                        </View>
                    )
                }
            />

            {/* History Modal */}
            <Modal visible={showHistoryModal} animationType="slide" transparent={false}>
                <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primaryLight }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                            <Ionicons name="close" size={28} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Chat History</Text>
                        <View style={{ width: 28 }} />
                    </View>
                    <FlatList
                        data={historyList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => <HistoryItem item={item} />}
                        contentContainerStyle={styles.listContent}
                    />
                </SafeAreaView>
            </Modal>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask for advice..."
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()} style={styles.sendButton}>
                        <Ionicons name="send" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.primaryLight },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
        backgroundColor: Colors.white
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
    headerSubtitle: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
    listContent: { padding: 16, paddingBottom: 20 },
    msgContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
    msgRight: { justifyContent: 'flex-end' },
    msgLeft: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight,
        justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4
    },
    bubble: { padding: 12, borderRadius: 16, maxWidth: '80%' },
    bubbleUser: { backgroundColor: Colors.myMsg, borderBottomRightRadius: 2 },
    bubbleAi: { backgroundColor: Colors.aiMsg, borderBottomLeftRadius: 2 },
    msgText: { fontSize: 15, lineHeight: 22 },
    textUser: { color: Colors.white },
    textAi: { color: Colors.text },
    inputBar: {
        flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border,
        alignItems: 'center', backgroundColor: Colors.primaryLight
    },
    input: {
        flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16,
        paddingVertical: 10, marginRight: 12, fontSize: 16
    },
    sendButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center'
    },
    typingContainer: { marginLeft: 40, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    typingText: { marginLeft: 8, color: Colors.textSecondary, fontSize: 12 },
    newChatBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    historyItem: {
        backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12,
        borderWidth: 1, borderColor: Colors.border,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
    },
    historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    historyQuerySummary: { fontSize: 14, color: Colors.text, flex: 1, marginRight: 8 },
    historyDate: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
    historyContent: { marginTop: 12 },
    historyDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
    historyResponse: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }
});

export default AIAssistantPage;
