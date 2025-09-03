import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { useTheme } from '../../context/ThemeContext';

// --- MOCK DATA FOR DEMONSTRATION ---
// In a real app, you would get the logged-in client's info from a global auth context.
const currentClient = {
  _id: '1', // Assuming the client's ID is '1' (Jane Doe from our dummy data)
  name: 'Jane Doe',
  avatar: 'https://i.pravatar.cc/150?img=25',
};

// The coach is now the recipient
const coach = {
  _id: '123',
  name: 'Leigha (Coach)',
  avatar: 'https://i.pravatar.cc/150?u=leigha',
};


const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
  });
};

export default function ClientChatScreen() {
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState('');

  // The chat ID is created by combining the client's and coach's IDs.
  // This ensures it matches the chat history from the coach's side.
  const getChatId = (uid1: string, uid2: string) => `chat_${[uid1, uid2].sort().join('_')}`;
  const chatId = getChatId(currentClient._id, coach._id);

  // Effect to load historical messages from local storage
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem(chatId);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages).map(msg => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          }));
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Failed to load messages from storage:", error);
      }
    };
    loadMessages();
  }, [chatId]);

  // Function to handle sending a new message
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Append the new message to the screen instantly
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setText(''); // Clear the input box

    // Save the updated message list to local storage
    try {
      const currentMessages = await AsyncStorage.getItem(chatId);
      const updatedMessages = GiftedChat.append(currentMessages ? JSON.parse(currentMessages) : [], newMessages);
      await AsyncStorage.setItem(chatId, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error("Failed to save message to storage:", error);
    }
  }, [chatId]);

  if (!theme) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={{ uri: coach.avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerText}>Chat with {coach.name}</Text>
      </View>
      
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentClient} // The current user is the client
        text={text}
        onInputTextChanged={setText}
        alwaysShowSend
        renderAvatarOnTop
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={{ backgroundColor: theme.surface, borderTopColor: theme.border }} />
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={{ justifyContent: 'center' }}>
            <Ionicons name="send" size={28} color={theme.primary} style={{ marginRight: 10 }} />
          </Send>
        )}
        textInputStyle={{ color: theme.textPrimary }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: theme.border },
              right: { backgroundColor: theme.primary }
            }}
            textStyle={{
              left: { color: theme.textPrimary },
              right: { color: theme.white }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}