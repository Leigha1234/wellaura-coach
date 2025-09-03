import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext'; // 1. Import the REAL useAuth hook
import { useTheme } from '../../context/ThemeContext';
import { useTrainingPlan } from '../../context/TrainingPlanContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary },
    container: { padding: 20 },
    planName: { fontSize: 24, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 24, textAlign: 'center' },
    weekContainer: { marginBottom: 20 },
    weekTitle: { fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 8 },
    dayCard: { backgroundColor: theme.surface, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    dayName: { fontSize: 18, fontWeight: '600', color: theme.textPrimary },
    exerciseContainer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: theme.border },
    exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    exerciseName: { fontSize: 16, color: theme.textPrimary, flex: 2 },
    exerciseSetsReps: { fontSize: 16, color: theme.textSecondary, flex: 1, textAlign: 'right' },
    buttonContainer: { marginTop: 20, gap: 12 },
    actionButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
    secondaryButton: { backgroundColor: theme.surface, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.primary },
    actionButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.white },
    secondaryButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
    emptyStateText: { fontSize: 18, color: theme.textSecondary, textAlign: 'center' },
  });
};

// --- Day Accordion Component ---
const DayAccordion = ({ day, weekIndex, dayIndex, styles, theme, expandedDay, setExpandedDay }) => {
    const uniqueId = `${weekIndex}-${dayIndex}`;
    const isExpanded = expandedDay === uniqueId;
    const rotation = useSharedValue(isExpanded ? 90 : 0);

    const toggleAccordion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newExpandedDay = isExpanded ? null : uniqueId;
        setExpandedDay(newExpandedDay);
        rotation.value = withTiming(newExpandedDay ? 90 : 0, { duration: 250 });
    };

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <View style={styles.dayCard}>
            <TouchableOpacity onPress={toggleAccordion} activeOpacity={0.8}>
                <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{day.dayName} - {day.focus}</Text>
                    <Animated.View style={animatedIconStyle}>
                        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                    </Animated.View>
                </View>
            </TouchableOpacity>
            
            {isExpanded && (
                <View style={styles.exerciseContainer}>
                    {day.exercises?.length > 0 ? (
                        day.exercises.map((exercise, exIndex) => (
                            <View key={`ex-${exIndex}`} style={styles.exerciseRow}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseSetsReps}>{exercise.sets} x {exercise.reps}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.exerciseSetsReps, { textAlign: 'left' }]}>Rest Day</Text>
                    )}
                </View>
            )}
        </View>
    );
};

// --- Main Page Component ---
export default function ClientWorkoutPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getClientPlan, setPlanToSend } = useTrainingPlan();
  const { user: currentUser } = useAuth(); // 2. Use the real logged-in user

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  // Wait for theme and user to be loaded
  if (!theme || !currentUser) {
    return null;
  }
  
  const styles = getDynamicStyles(theme);
  // 3. Get the plan for the specific logged-in user
  const assignedPlan = getClientPlan(currentUser.id);

  const handleSendProgressUpdate = () => {
    const progressMessage = `Progress Update for ${assignedPlan?.name || 'my plan'}:\n\n- How did you feel this week?\n- Any challenges?\n- Any wins?`;
    setPlanToSend(progressMessage);
    router.push('/chat');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Workout Plan</Text>
      </View>
      
      {assignedPlan ? (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.planName}>{assignedPlan.name}</Text>
          
          {assignedPlan.weeks?.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekContainer}>
              <Text style={styles.weekTitle}>Week {weekIndex + 1}</Text>
              {week.map((day, dayIndex) => (
                <DayAccordion
                  key={`day-${dayIndex}`}
                  day={day}
                  weekIndex={weekIndex}
                  dayIndex={dayIndex}
                  styles={styles}
                  theme={theme}
                  expandedDay={expandedDay}
                  setExpandedDay={setExpandedDay}
                />
              ))}
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSendProgressUpdate}>
              <Ionicons name="send-outline" size={20} color={theme.white} />
              <Text style={styles.actionButtonText}>Send Progress Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/chat')}>
              <Text style={styles.secondaryButtonText}>Chat with Coach</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyStateText}>
              Your coach has not assigned you a training plan yet.
            </Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/chat')}>
              <Text style={styles.actionButtonText}>Chat with Your Coach</Text>
            </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}