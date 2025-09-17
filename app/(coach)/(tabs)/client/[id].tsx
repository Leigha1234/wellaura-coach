import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CheckInSchedulerModal from '../../../../components/CheckInSchedulerModal';
import ClientProgressChart from '../../../../components/ClientProgressChart';
import { dummyClients } from '../../../../lib/data'; // Using mock data for client profiles
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext';

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.background },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, justifyContent: 'space-between' },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
        container: { padding: 20, paddingBottom: 40 },
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
        actionButtonsContainer: { flexDirection: 'row', gap: 12, marginTop: 20 },
        actionButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flex: 1 },
        secondaryActionButton: { backgroundColor: theme.surface, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.primary, flex: 1 },
        actionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.white },
        secondaryActionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
        notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        placeholderContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
            gap: 8,
        },
        placeholderText: {
            fontSize: 16,
            color: theme.textSecondary,
            textAlign: 'center',
        },
    });
};

export default function ClientDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const styles = getDynamicStyles(theme);
    const { getClientPlan, fetchClientPlan } = useTrainingPlan();
    const [isSchedulerVisible, setSchedulerVisible] = useState(false);
    
    // Fetch the static client profile data
    const client = dummyClients.find(c => c.id === id);
    // Get the dynamic, assigned plan from the context cache
    const assignedPlan = typeof id === 'string' ? getClientPlan(id) : null;

    // useEffect to fetch the plan data from Supabase when the page loads
    useEffect(() => {
        if (typeof id === 'string' && !assignedPlan) {
            fetchClientPlan(id);
        }
    }, [id]);

    if (!client) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.notFoundContainer}>
                    <Text style={styles.headerTitle}>Client not found</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    const handleScheduleCheckIn = (scheduleDetails: any) => {
        console.log('Scheduled:', scheduleDetails);
        Alert.alert(
            'Check-in Scheduled!',
            `Frequency: ${scheduleDetails.frequency}\nDay: ${scheduleDetails.day}\nTime: ${scheduleDetails.time}`
        );
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
                <View style={{width: 24}} />
            </View>
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.profileHeader}>
                        <Image source={{ uri: client.avatarUrl }} style={styles.avatar} />
                        <Text style={styles.clientName}>{client.name}</Text>
                        <Text style={styles.clientEmail}>{client.email}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyles.backgroundColor }]}>
                            <View style={[styles.statusIndicator, { backgroundColor: statusStyles.indicator }]} />
                            <Text style={[styles.statusText, { color: statusStyles.text }]}>{client.status}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Assigned Training Plan</Text>
                        {assignedPlan ? (
                            <View style={styles.placeholderContainer}>
                                <Ionicons name="barbell" size={32} color={theme.primary} />
                                <Text style={[styles.placeholderText, { color: theme.textPrimary, fontWeight: '600' }]}>{assignedPlan.name}</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Ionicons name="barbell-outline" size={32} color={theme.textSecondary} />
                                <Text style={styles.placeholderText}>No training plan assigned yet.</Text>
                            </View>
                        )}
                        <View style={styles.actionButtonsContainer}>
                            {assignedPlan && (
                                <TouchableOpacity style={styles.secondaryActionButton} onPress={() => router.push(`/training-plan/view?clientId=${client.id}`)}>
                                    <Text style={styles.secondaryActionButtonText}>See Plan</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/training-plan/assign?clientId=${client.id}`)}>
                                <Text style={styles.actionButtonText}>{assignedPlan ? 'Change Plan' : 'Assign Plan'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ClientProgressChart />

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Current Goals</Text>
                        {client.goals.map((goal, index) => (
                            <View key={index} style={styles.goalItem}>
                                <Ionicons name="flag-outline" size={20} color={theme.primary} />
                                <Text style={styles.goalText}>{goal}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Session Notes</Text>
                        {client.notes.map((note, index) => (
                            <View key={index} style={[styles.noteItem, { borderBottomWidth: index === client.notes.length - 1 ? 0 : 1}]}>
                                <Text style={styles.noteDate}>{new Date(note.date).toLocaleDateString()}</Text>
                                <Text style={styles.noteText}>{note.text}</Text>
                            </View>
                        ))}
                    </View>
                    
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => router.push(`/messaging/${client.id}`)}>
                            <Text style={styles.secondaryActionButtonText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setSchedulerVisible(true)}>
                            <Text style={styles.actionButtonText}>Schedule Check-in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <CheckInSchedulerModal isVisible={isSchedulerVisible} onClose={() => setSchedulerVisible(false)} onSchedule={handleScheduleCheckIn} />
        </SafeAreaView>
    );
}