import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions, Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext'; // 1. Import the hook

// --- MOCK DATA ---
// In a real app, this user data would come from a global context or API call
const mockUsers = {
  '123': { name: 'Leigha', avatar: 'https://i.pravatar.cc/150?u=leigha' },
  '1': { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=25' },
  '2': { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?img=60' },
  '3': { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=32' },
  '4': { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=12' },
};

// --- Attachment Preview Component ---
const AttachmentPreview = ({ uri, type, onRemove, theme }) => {
  return (
    <View style={{ padding: 8, backgroundColor: theme.surface }}>
      <View style={{ position: 'relative', width: 70, height: 70 }}>
        {type === 'video' ? (
          <Video source={{ uri }} style={{ width: 70, height: 70, borderRadius: 8 }} resizeMode="cover" />
        ) : (
          <Image source={{ uri }} style={{ width: 70, height: 70, borderRadius: 8 }} />
        )}
        <TouchableOpacity
          onPress={onRemove}
          style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main Chat Component ---
export default function MessagingPage() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);
  const router = useRouter();
  const { planToSend, setPlanToSend } = useTrainingPlan(); // 2. Get context state

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [attachment, setAttachment] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [text, setText] = useState(''); // 3. Add state for the input text

  const currentUser = { _id: '123', ...mockUsers['123'] };
  const recipient = { _id: recipientId, ...mockUsers[recipientId] };
  
  const getChatId = (uid1: string, uid2: string) => `chat_${[uid1, uid2].sort().join('_')}`;

  // Effect to load historical messages from storage
  useEffect(() => {
    const loadMessages = async () => {
      if (!recipientId) return;
      const chatId = getChatId(currentUser._id, recipientId);
      try {
        const storedMessages = await AsyncStorage.getItem(chatId);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages).map(msg => ({ ...msg, createdAt: new Date(msg.createdAt) }));
          setMessages(parsedMessages);
        }
      } catch (error) { console.error("Failed to load messages:", error); }
    };
    loadMessages();
  }, [recipientId]);

  // 4. Effect to check for a plan to send when the component loads
  useEffect(() => {
    if (planToSend) {
      setText(planToSend); // Populate the input box
      setPlanToSend(null); // Clear the plan from context
    }
  }, [planToSend]);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      videoMaxDuration: 0,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, type: asset.type as 'image' | 'video' });
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const messageToSend = { ...newMessages[0] };
    if (attachment) {
      if (attachment.type === 'image') messageToSend.image = attachment.uri;
      else if (attachment.type === 'video') messageToSend.video = attachment.uri;
      setAttachment(null);
    }
    
    setMessages(previousMessages => GiftedChat.append(previousMessages, [messageToSend]));
    setText(''); // 5. Clear the input after sending

    // Save to AsyncStorage
    const chatId = getChatId(currentUser._id, recipientId);
    try {
        const currentMessages = await AsyncStorage.getItem(chatId);
        const updatedMessages = GiftedChat.append(currentMessages ? JSON.parse(currentMessages) : [], [messageToSend]);
        await AsyncStorage.setItem(chatId, JSON.stringify(updatedMessages));
    } catch (error) { console.error("Failed to save message:", error); }
  }, [attachment, recipientId]);
  
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
        user={currentUser}
        // 6. Connect GiftedChat input to the state
        text={text}
        onInputTextChanged={setText}
        alwaysShowSend
        renderAvatarOnTop
        renderActions={(props) => (
            <Actions {...props} containerStyle={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            icon={() => <Ionicons name="attach" size={28} color={theme.primary} />}
            onPressActionButton={pickMedia} />
        )}
        renderInputToolbar={(props) => (
          <>
            {attachment && <AttachmentPreview uri={attachment.uri} type={attachment.type} onRemove={() => setAttachment(null)} theme={theme} />}
            <InputToolbar {...props} containerStyle={{ backgroundColor: theme.surface, borderTopColor: theme.border }} />
          </>
        )}
        renderMessageVideo={(props) => (
          <View style={{ padding: 4, borderRadius: 15 }}>
            <Video source={{ uri: props.currentMessage.video }} useNativeControls style={{ width: 200, height: 200, borderRadius: 13 }} resizeMode="cover" />
          </View>
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={{ justifyContent: 'center' }}>
            <Ionicons name="send" size={28} color={theme.primary} style={{ marginRight: 10 }} />
          </Send>
        )}
        textInputStyle={{ color: theme.textPrimary }}
        renderBubble={props => (
          <Bubble {...props}
            wrapperStyle={{ left: { backgroundColor: theme.border }, right: { backgroundColor: theme.primary } }}
            textStyle={{ left: { color: theme.textPrimary }, right: { color: theme.white } }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const getDynamicStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 10, },
  headerText: { color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginLeft: 15, },
});