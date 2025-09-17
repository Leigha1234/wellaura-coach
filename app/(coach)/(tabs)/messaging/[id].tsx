import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext';

// --- MOCK DATA (Only for profile info, not messages) ---
// In a real app, this would come from a `profiles` table in Supabase
const mockUsers = {
  '1': { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=25' },
  '2': { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?img=60' },
  '3': { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=32' },
  '4': { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=12' },
};

export default function MessagingPage() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { planToSend, setPlanToSend } = useTrainingPlan();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState('');
  
  // Create a consistent, sorted chat ID for the database
  const getChatId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

  // --- 1. FETCH HISTORICAL MESSAGES ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !recipientId) return;

      const chatId = getChatId(currentUser.id, recipientId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      const formattedMessages = data.map(msg => ({
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.created_at),
        user: {
          _id: msg.sender_id,
          name: msg.sender_id === currentUser.id ? currentUser.name : mockUsers[recipientId]?.name,
          avatar: msg.sender_id === currentUser.id ? '' : mockUsers[recipientId]?.avatar,
        }
      }));
      setMessages(formattedMessages);
    };

    fetchMessages();
  }, [recipientId, currentUser]);


  // --- 2. LISTEN FOR NEW MESSAGES IN REAL-TIME ---
  useEffect(() => {
    if (!currentUser || !recipientId) return;

    const chatId = getChatId(currentUser.id, recipientId);
    const channel = supabase.channel(`chat_${chatId}`);
    
    const subscription = channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMessage = payload.new;
          const formattedMessage = {
            _id: newMessage.id,
            text: newMessage.content,
            createdAt: new Date(newMessage.created_at),
            user: {
              _id: newMessage.sender_id,
              name: newMessage.sender_id === currentUser.id ? currentUser.name : mockUsers[recipientId]?.name,
              avatar: newMessage.sender_id === currentUser.id ? '' : mockUsers[recipientId]?.avatar,
            }
          };
          setMessages(previousMessages => GiftedChat.append(previousMessages, [formattedMessage]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, currentUser]);
  
  // Effect to check for a plan to send when the component loads
  useEffect(() => {
    if (planToSend) {
      setText(planToSend);
      setPlanToSend(null);
    }
  }, [planToSend]);

  // --- 3. SEND NEW MESSAGES ---
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!currentUser || !recipientId) return;

    const message = newMessages[0];
    const chatId = getChatId(currentUser.id, recipientId);
    setText(''); // Clear input immediately

    const { error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: currentUser.id,
      recipient_id: recipientId,
      content: message.text,
    });

    if (error) {
      console.error('Error sending message:', error);
      // Optional: handle failed message, e.g., show an error icon
    }
  }, [recipientId, currentUser]);

  
  if (!theme || !currentUser) return null;

  const recipient = { _id: recipientId, ...mockUsers[recipientId] };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Image source={{ uri: recipient.avatar }} style={styles.headerAvatar} />
        <Text style={styles.headerText}>{recipient.name}</Text>
      </View>
      
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: currentUser.id }}
        text={text}
        onInputTextChanged={setText}
        renderAvatarOnTop
        messagesContainerStyle={{ backgroundColor: theme.background }}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={{ backgroundColor: theme.surface, borderTopColor: theme.border }} />
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={{ justifyContent: 'center' }}>
            <Ionicons name="send" size={28} color={theme.primary} style={{ marginRight: 10 }} />
          </Send>
        )}
        textInputStyle={{ color: theme.textPrimary }}
        renderBubble={(props) => (
            <Bubble {...props} wrapperStyle={{
                left: { backgroundColor: theme.surface },
                right: { backgroundColor: theme.primary }
            }} textStyle={{
                left: { color: theme.textPrimary },
                right: { color: theme.white }
            }}/>
        )}
      />
    </SafeAreaView>
  );
}

const getDynamicStyles = (theme: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Platform.OS === 'android' ? theme.surface : theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 10 },
    headerText: { color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
});