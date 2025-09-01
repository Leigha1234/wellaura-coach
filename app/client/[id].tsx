import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// --- DUMMY DATA ---
const dummyClients = [
  { id: '1', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?img=25', status: 'Active', lastCheckIn: '2024-08-14T10:00:00Z', email: 'jane.doe@example.com', goals: ['Improve sleep quality', 'Run a 5k in under 30 minutes', 'Incorporate more plant-based meals'], notes: [{ date: '2024-08-10', text: 'Discussed initial goals and sleep patterns. Jane is motivated and ready to start.' }, { date: '2024-08-01', text: 'Onboarding session completed.' }] },
  { id: '2', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?img=60', status: 'Active', lastCheckIn: '2024-08-12T14:30:00Z', email: 'john.smith@example.com', goals: ['Increase daily step count to 10,000', 'Reduce caffeine intake'], notes: [{ date: '2024-08-05', text: 'Follow-up on step count progress. John is finding it challenging in the afternoons.' }] },
  { id: '3', name: 'Michael Brown', avatarUrl: 'https://i.pravatar.cc/150?img=12', status: 'Active', lastCheckIn: '2024-08-15T09:00:00Z', email: 'michael.brown@example.com', goals: ['Build a consistent morning routine', 'Learn mindfulness techniques'], notes: [{ date: '2024-08-15', text: 'Productive session on mindfulness. Michael enjoyed the breathing exercises.' }] },
  { id: '4', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=32', status: 'Inactive', lastCheckIn: '2024-07-10T11:00:00Z', email: 'alice.j@example.com', goals: ['Complete coaching program'], notes: [{ date: '2024-07-10', text: 'Final session. Alice achieved her primary goals. Program complete.' }] },
];

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.background },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, marginLeft: 16 },
        container: { padding: 20 },
        profileHeader: { alignItems: 'center', marginBottom: 24 },
        avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: theme.primary },
        clientName: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary, marginTop: 16 },
        clientEmail: { fontSize: 16, color: theme.textSecondary, marginTop: 4 },
        statusBadge: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
        statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
        statusText: { fontSize: 14, fontWeight: '600' },
        card: { backgroundColor: theme.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
        cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 12 },
        goalItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        goalText: { fontSize: 16, color: theme.textPrimary, marginLeft: 12, flex: 1 },
        noteItem: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
        noteDate: { fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 4 },
        noteText: { fontSize: 15, color: theme.textPrimary, lineHeight: 22 },
        actionButtonsContainer: { flexDirection: 'row', gap: 12 },
        actionButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flex: 1 },
        secondaryActionButton: { backgroundColor: theme.surface, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.primary, flex: 1 },
        actionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.white },
        secondaryActionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
        notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        // --- MODAL STYLES ---
        modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
        modalContainer: { width: '100%', backgroundColor: theme.surface, borderRadius: 20, padding: 24, alignItems: 'center' },
        modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 16 },
        modalInput: { backgroundColor: theme.background, width: '100%', height: 150, borderRadius: 12, padding: 16, fontSize: 16, color: theme.textPrimary, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.border, marginBottom: 20 },
        modalButtonContainer: { flexDirection: 'row', width: '100%', gap: 12 },
        modalButton: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
        modalButtonText: { fontSize: 16, fontWeight: 'bold' },
    });
};

export default function ClientDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const styles = getDynamicStyles(theme);

    const [isCheckInModalVisible, setCheckInModalVisible] = useState(false);
    
    const client = dummyClients.find(c => c.id === id);
    
    // Default message now depends on client name, so it's defined inside the component
    const defaultCheckInMessage = `Hi ${client?.name}, it's time for our weekly check-in! Please could you share:\n\n- A progress picture\n- Your current weight\n- How you're feeling this week (energy, mood, etc.)\n\nThanks!`;
    const [checkInMessage, setCheckInMessage] = useState(defaultCheckInMessage);

    if (!client) {
        return (
            <SafeAreaView style={styles.screen}><View style={styles.notFoundContainer}><Text style={styles.headerTitle}>Client not found</Text></View></SafeAreaView>
        );
    }
    
    const handleSendCheckIn = () => {
        setCheckInModalVisible(false);
        router.push({
            pathname: `/messaging/${client.id}`,
            params: { prefilledMessage: checkInMessage },
        });
    };

    const statusStyles = {
        backgroundColor: client.status === 'Active' ? '#D1FAE5' : '#F3F4F6',
        indicator: client.status === 'Active' ? '#10B981' : '#6B7280',
        text: client.status === 'Active' ? '#065F46' : '#374151',
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.textPrimary} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Client Profile</Text>
            </View>
            <ScrollView>
                <View style={styles.container}>
                    {/* Profile Header, Goals, Notes... */}
                    <View style={styles.profileHeader}><Image source={{ uri: client.avatarUrl }} style={styles.avatar} /><Text style={styles.clientName}>{client.name}</Text><Text style={styles.clientEmail}>{client.email}</Text><View style={[styles.statusBadge, { backgroundColor: statusStyles.backgroundColor }]}><View style={[styles.statusIndicator, { backgroundColor: statusStyles.indicator }]} /><Text style={[styles.statusText, { color: statusStyles.text }]}>{client.status}</Text></View></View>
                    <View style={styles.card}><Text style={styles.cardTitle}>Current Goals</Text>{client.goals.map((goal, index) => (<View key={index} style={styles.goalItem}><Ionicons name="flag-outline" size={20} color={theme.primary} /><Text style={styles.goalText}>{goal}</Text></View>))}</View>
                    <View style={styles.card}><Text style={styles.cardTitle}>Session Notes</Text>{client.notes.map((note, index) => (<View key={index} style={[styles.noteItem, index === client.notes.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}><Text style={styles.noteDate}>{new Date(note.date).toLocaleDateString()}</Text><Text style={styles.noteText}>{note.text}</Text></View>))}</View>
                    
                    {/* --- BUTTONS SECTION --- */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => router.push(`/messaging/${client.id}`)}><Text style={styles.secondaryActionButtonText}>Message</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => { setCheckInMessage(defaultCheckInMessage); setCheckInModalVisible(true); }}><Text style={styles.actionButtonText}>Schedule Check-in</Text></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* --- SCHEDULE CHECK-IN MODAL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isCheckInModalVisible}
                onRequestClose={() => setCheckInModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Schedule a Check-in</Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            value={checkInMessage}
                            onChangeText={setCheckInMessage}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.border }]} onPress={() => setCheckInModalVisible(false)}>
                                <Text style={[styles.modalButtonText, { color: theme.textPrimary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={handleSendCheckIn}>
                                <Text style={[styles.modalButtonText, { color: theme.white }]}>Send Check-in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

