import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Adjust path if needed

// --- DUMMY DATA ---
const dummyClients = [
    { id: '1', name: 'Jane Doe' },
    { id: '2', name: 'John Smith' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Alice Johnson' },
];

// A more realistic message structure, keyed by client ID
const dummyMessages = {
  '1': [ // Messages for Jane Doe
    { id: 'msg1-1', text: 'Hi Jane, just checking in on your progress with the sleep quality goal. How did last night go?', sender: 'user', timestamp: '10:30 AM' },
    { id: 'msg1-2', text: 'Hey! It was better, I tried the breathing exercise you suggested and I think it helped. Slept for 7 hours straight!', sender: 'client', timestamp: '10:32 AM' },
    { id: 'msg1-3', text: 'That is fantastic news! Consistency is key. Let\'s see how the rest of the week goes.', sender: 'user', timestamp: '10:33 AM' },
  ],
  '2': [ // Messages for John Smith
    { id: 'msg2-1', text: 'Hi John, how is the plan to increase your daily step count going this week?', sender: 'user', timestamp: 'Yesterday' },
  ],
  '3': [ // Messages for Michael Brown
     { id: 'msg3-1', text: 'Hey Michael, loved our session on mindfulness today. Remember to try the 5-minute breathing exercise before bed.', sender: 'user', timestamp: '2:15 PM' },
     { id: 'msg3-2', text: 'Will do! Thanks again, it was really helpful.', sender: 'client', timestamp: '2:16 PM' },
  ],
  // Client '4' (Alice) has no messages yet.
};


const getDynamicStyles = (theme: any) => StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.surface },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, marginLeft: 16 },
    messageList: { flex: 1, paddingHorizontal: 12 },
    messageContainer: { flexDirection: 'row', marginVertical: 5 },
    userMessageContainer: { justifyContent: 'flex-end' },
    clientMessageContainer: { justifyContent: 'flex-start' },
    messageBubble: { maxWidth: '75%', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
    userMessageBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 5 },
    clientMessageBubble: { backgroundColor: theme.surface, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: theme.border },
    messageText: { fontSize: 16, lineHeight: 22 },
    userMessageText: { color: theme.white },
    clientMessageText: { color: theme.textPrimary },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface },
    textInput: { flex: 1, minHeight: 44, backgroundColor: theme.background, borderRadius: 22, paddingHorizontal: 18, fontSize: 16, color: theme.textPrimary, borderWidth: 1, borderColor: theme.border, paddingTop: 12, paddingBottom: 12 },
    sendButton: { marginLeft: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
    emptyChatContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyChatText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center' },
});

export default function MessagingPage() {
    const router = useRouter();
    const { id, prefilledMessage } = useLocalSearchParams();
    const { theme } = useTheme();
    const styles = getDynamicStyles(theme);
    const flatListRef = useRef<FlatList>(null);

    const client = dummyClients.find(c => c.id === id);
    // State is now initialized with messages for the specific client, or an empty array
    const [messages, setMessages] = useState(dummyMessages[id as keyof typeof dummyMessages] || []);
    // Initialize the text input with the prefilled message if it exists
    const [newMessage, setNewMessage] = useState(typeof prefilledMessage === 'string' ? prefilledMessage : '');

    useEffect(() => {
        // This ensures the list scrolls to the end when you open the chat
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }, [id]);

    if (!client) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyChatContainer}>
                    <Text style={styles.emptyChatText}>Client not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleSend = () => {
        if (newMessage.trim().length === 0) return;

        const messageToSend = {
            id: String(Date.now()),
            text: newMessage.trim(),
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, messageToSend]);
        setNewMessage('');
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{client.name}</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjusted offset for better appearance
            >
                {messages.length > 0 ? (
                    <FlatList
                        ref={flatListRef}
                        style={styles.messageList}
                        data={messages}
                        keyExtractor={item => item.id}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        renderItem={({ item }) => {
                            const isUser = item.sender === 'user';
                            return (
                                <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.clientMessageContainer]}>
                                    <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.clientMessageBubble]}>
                                        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.clientMessageText]}>{item.text}</Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                ) : (
                    <View style={styles.emptyChatContainer}>
                        <Text style={styles.emptyChatText}>
                            This is the beginning of your conversation with {client.name}.
                        </Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder={`Message ${client.name}...`}
                        placeholderTextColor={theme.textSecondary}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="arrow-up" size={24} color={theme.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

