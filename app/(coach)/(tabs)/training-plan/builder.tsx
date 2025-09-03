import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext';

// --- TYPE DEFINITIONS ---
interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface DayPlan {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', flex: 1, },
    container: { padding: 20, paddingBottom: 100 }, // Padding bottom to avoid overlap with assign button
    section: { marginBottom: 24 },
    label: { fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 12 },
    input: { backgroundColor: theme.surface, color: theme.textPrimary, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: theme.border },
    weekContainer: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
    weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    weekTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
    dayCard: { backgroundColor: theme.background, borderRadius: 12, padding: 16, marginVertical: 8 },
    dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dayName: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, flex: 1 },
    dayFocusInput: { flex: 2, fontSize: 16, color: theme.textSecondary, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 4 },
    exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
    exerciseInput: { flex: 3, backgroundColor: theme.surface, padding: 10, borderRadius: 8, color: theme.textPrimary, borderWidth: 1, borderColor: theme.border },
    setsRepsInput: { flex: 1, backgroundColor: theme.surface, padding: 10, borderRadius: 8, color: theme.textPrimary, textAlign: 'center', borderWidth: 1, borderColor: theme.border },
    deleteButton: { padding: 4 },
    addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, backgroundColor: theme.border, padding: 12, borderRadius: 10 },
    addExerciseText: { color: theme.textPrimary, fontWeight: '600', fontSize: 16 },
    weekActions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20 },
    weekActionButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    weekActionButtonText: { color: theme.white, fontWeight: 'bold' },
    assignButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: theme.primary, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', },
    assignButtonText: { fontSize: 18, fontWeight: 'bold', color: theme.white },
  });
};

// --- Helper to create an empty week ---
const createEmptyWeek = (): DayPlan[] => ([
    { dayName: 'Monday', focus: '', exercises: [] }, { dayName: 'Tuesday', focus: '', exercises: [] },
    { dayName: 'Wednesday', focus: '', exercises: [] }, { dayName: 'Thursday', focus: '', exercises: [] },
    { dayName: 'Friday', focus: '', exercises: [] }, { dayName: 'Saturday', focus: '', exercises: [] },
    { dayName: 'Sunday', focus: '', exercises: [] },
]);


// The main page component
export default function TrainingPlanBuilderPage() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);
  const { assignPlanToClient } = useTrainingPlan();

  const [planName, setPlanName] = useState('');
  const [weeks, setWeeks] = useState<DayPlan[][]>([createEmptyWeek()]);

  // --- HANDLER FUNCTIONS ---
  const updateExercise = (weekIndex: number, dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][dayIndex].exercises[exIndex][field] = value;
    setWeeks(newWeeks);
  };
  
  const updateDayFocus = (weekIndex: number, dayIndex: number, value: string) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][dayIndex].focus = value;
    setWeeks(newWeeks);
  };

  const addExercise = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][dayIndex].exercises.push({ id: Date.now().toString(), name: '', sets: '', reps: '' });
    setWeeks(newWeeks);
  };

  const removeExercise = (weekIndex: number, dayIndex: number, exId: string) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][dayIndex].exercises = newWeeks[weekIndex][dayIndex].exercises.filter(ex => ex.id !== exId);
    setWeeks(newWeeks);
  };

  const addWeek = () => {
    setWeeks([...weeks, createEmptyWeek()]);
  };

  const removeWeek = (weekIndex: number) => {
    if (weeks.length > 1) {
      const newWeeks = weeks.filter((_, index) => index !== weekIndex);
      setWeeks(newWeeks);
    } else {
      Alert.alert("Cannot Remove", "You must have at least one week in your plan.");
    }
  };

  const handleAssignPlan = () => {
    if (!planName.trim()) {
      Alert.alert('Missing Name', 'Please give your training plan a name.');
      return;
    }
    if (typeof clientId !== 'string') return;
    
    const newPlan = { id: `custom_${Date.now()}`, name: planName, weeks, };
    
    assignPlanToClient(clientId, newPlan);
    Alert.alert('Plan Assigned!', `"${planName}" has been successfully assigned.`, [
      { text: 'OK', onPress: () => router.push(`/client/${clientId}`) }
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Plan</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Plan Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Hypertrophy Phase 1"
            placeholderTextColor={theme.textSecondary}
            value={planName}
            onChangeText={setPlanName}
          />
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekContainer}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>Week {weekIndex + 1}</Text>
              {weeks.length > 1 && (
                <TouchableOpacity onPress={() => removeWeek(weekIndex)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color={'#EF4444'} />
                </TouchableOpacity>
              )}
            </View>
            
            {week.map((day, dayIndex) => (
              <View key={`day-${dayIndex}`} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day.dayName}</Text>
                  <TextInput 
                    style={styles.dayFocusInput} 
                    placeholder="e.g., Push Day" 
                    placeholderTextColor={theme.textSecondary}
                    value={day.focus}
                    onChangeText={(text) => updateDayFocus(weekIndex, dayIndex, text)}
                  />
                </View>
                {day.exercises.map((exercise, exIndex) => (
                  <View key={exercise.id} style={styles.exerciseRow}>
                    <TextInput style={styles.exerciseInput} placeholder="Exercise Name" value={exercise.name} onChangeText={(text) => updateExercise(weekIndex, dayIndex, exIndex, 'name', text)} />
                    <TextInput style={styles.setsRepsInput} placeholder="Sets" value={exercise.sets} onChangeText={(text) => updateExercise(weekIndex, dayIndex, exIndex, 'sets', text)} keyboardType="numeric" />
                    <TextInput style={styles.setsRepsInput} placeholder="Reps" value={exercise.reps} onChangeText={(text) => updateExercise(weekIndex, dayIndex, exIndex, 'reps', text)} />
                    <TouchableOpacity onPress={() => removeExercise(weekIndex, dayIndex, exercise.id)} style={styles.deleteButton}>
                      <Ionicons name="remove-circle-outline" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addExerciseButton} onPress={() => addExercise(weekIndex, dayIndex)}>
                    <Ionicons name="add" size={22} color={theme.textPrimary} />
                    <Text style={styles.addExerciseText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        
        <View style={styles.weekActions}>
            <TouchableOpacity style={styles.weekActionButton} onPress={addWeek}>
                <Text style={styles.weekActionButtonText}>Add Week</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.assignButton} onPress={handleAssignPlan}>
        <Text style={styles.assignButtonText}>Assign Plan to Client</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}