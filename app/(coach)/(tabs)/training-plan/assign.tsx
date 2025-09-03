import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext';

// --- MOCK DATA FOR TRAINING PLAN TEMPLATES ---
const trainingPlanTemplates = [
  {
    id: 'tpl_1',
    name: 'Full Body Strength',
    focus: 'Hypertrophy & Strength',
    daysPerWeek: 3,
    weeks: [
      [ // Week 1
        { dayName: 'Monday', focus: 'Full Body A', exercises: [{ name: 'Squats', sets: '3', reps: '8-12' }] },
        { dayName: 'Wednesday', focus: 'Full Body B', exercises: [{ name: 'Bench Press', sets: '3', reps: '8-12' }] },
        { dayName: 'Friday', focus: 'Full Body C', exercises: [{ name: 'Deadlifts', sets: '3', reps: '5' }] },
      ]
    ]
  },
  {
    id: 'tpl_2',
    name: 'Push Pull Legs (PPL)',
    focus: 'Classic Bodybuilding Split',
    daysPerWeek: 6,
    weeks: [
      [ // Week 1
        { dayName: 'Monday', focus: 'Push Day', exercises: [{ name: 'Bench Press', sets: '4', reps: '8-10' }, { name: 'Overhead Press', sets: '3', reps: '10-12' }] },
        { dayName: 'Tuesday', focus: 'Pull Day', exercises: [{ name: 'Pull Ups', sets: '4', reps: 'AMRAP' }, { name: 'Barbell Rows', sets: '4', reps: '8-10' }] },
        { dayName: 'Wednesday', focus: 'Leg Day', exercises: [{ name: 'Squats', sets: '4', reps: '8-10' }, { name: 'Leg Press', sets: '3', reps: '12-15' }] },
        { dayName: 'Thursday', focus: 'Rest', exercises: [] },
        { dayName: 'Friday', focus: 'Push Day', exercises: [{ name: 'Incline Dumbbell Press', sets: '4', reps: '10-12' }] },
        { dayName: 'Saturday', focus: 'Pull Day', exercises: [{ name: 'T-Bar Rows', sets: '4', reps: '10-12' }] },
        { dayName: 'Sunday', focus: 'Leg Day', exercises: [{ name: 'Romanian Deadlifts', sets: '4', reps: '10-12' }] },
      ]
    ]
  },
  {
    id: 'tpl_4',
    name: 'Marathon Prep',
    focus: 'Running & Endurance',
    daysPerWeek: 5,
    weeks: [
      [ // Week 1
        { dayName: 'Monday', focus: 'Easy Run', exercises: [{ name: 'Run', sets: '1', reps: '3 miles' }] },
        { dayName: 'Tuesday', focus: 'Tempo Run', exercises: [{ name: 'Run', sets: '1', reps: '4 miles' }] },
        { dayName: 'Wednesday', focus: 'Rest', exercises: [] },
        { dayName: 'Thursday', focus: 'Intervals', exercises: [{ name: 'Track Repeats', sets: '8', reps: '400m' }] },
        { dayName: 'Saturday', focus: 'Long Run', exercises: [{ name: 'Run', sets: '1', reps: '6 miles' }] },
      ]
    ]
  },
];

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', flex: 1, },
    container: { padding: 20, },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 16, },
    templateCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border, },
    templateName: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, },
    templateFocus: { fontSize: 15, color: theme.textSecondary, marginTop: 4, },
    templateDetails: { fontSize: 14, color: theme.textSecondary, marginTop: 12, },
    buttonContainer: { marginTop: 24, },
    actionButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', },
    actionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.white, },
    orText: { textAlign: 'center', fontSize: 16, color: theme.textSecondary, marginVertical: 16, },
  });
};

export default function AssignTrainingPlanPage() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { assignPlanToClient } = useTrainingPlan();
  
  if(!theme) return null;

  const styles = getDynamicStyles(theme);

  const handleAssignPlan = (template: typeof trainingPlanTemplates[0]) => {
    if (typeof clientId !== 'string') {
      Alert.alert("Error", "Client ID is missing.");
      return;
    }

    const planToAssign = {
      id: template.id,
      name: template.name,
      weeks: template.weeks,
    };

    assignPlanToClient(clientId, planToAssign);
    
    // This is the correct navigation action. It takes you back to the previous screen (Client Details).
    router.back(); 
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Training Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Use a Template</Text>

        {trainingPlanTemplates.map((template) => (
          <TouchableOpacity key={template.id} onPress={() => handleAssignPlan(template)} activeOpacity={0.7}>
            <View style={styles.templateCard}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateFocus}>{template.focus}</Text>
              <Text style={styles.templateDetails}>{template.daysPerWeek} days per week</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.orText}>OR</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push(`/training-plan/builder?clientId=${clientId}`)}
          >
            <Text style={styles.actionButtonText}>Create Plan From Scratch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}