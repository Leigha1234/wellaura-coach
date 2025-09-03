import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, SafeAreaView, ScrollView, Share, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { useTrainingPlan } from '../../../context/TrainingPlanContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: theme.border 
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: theme.textPrimary, 
        textAlign: 'center', 
        flex: 1, 
        marginHorizontal: 16 
    },
    container: { padding: 20 },
    planName: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 24, textAlign: 'center' },
    weekContainer: { marginBottom: 20 },
    weekTitle: { fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 8 },
    dayCard: { backgroundColor: theme.surface, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, },
    dayName: { fontSize: 18, fontWeight: '600', color: theme.textPrimary },
    exerciseContainer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: theme.border },
    exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    exerciseName: { fontSize: 16, color: theme.textPrimary, flex: 2 },
    exerciseSetsReps: { fontSize: 16, color: theme.textSecondary, flex: 1, textAlign: 'right' },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });
};

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

export default function ViewTrainingPlanPage() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { getClientPlan, setPlanToSend } = useTrainingPlan();

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!theme) return null;

  const styles = getDynamicStyles(theme);
  const assignedPlan = typeof clientId === 'string' ? getClientPlan(clientId) : null;

  const formatPlanToString = () => {
    if (!assignedPlan) return '';
    let planString = `Training Plan: ${assignedPlan.name}\n\n`;
    assignedPlan.weeks.forEach((week, weekIndex) => {
      planString += `--- Week ${weekIndex + 1} ---\n`;
      week.forEach(day => {
        planString += `\n${day.dayName}: ${day.focus || 'No focus set'}\n`;
        if (day.exercises.length > 0) {
          day.exercises.forEach(ex => {
            planString += `  • ${ex.name}: ${ex.sets} x ${ex.reps}\n`;
          });
        } else {
            planString += `  • Rest Day\n`;
        }
      });
      planString += '\n';
    });
    return planString;
  };

  const handleShare = async () => {
    const planString = formatPlanToString();
    if (!planString) return;
    try {
      await Share.share({
        message: planString,
        title: `Your Training Plan: ${assignedPlan.name}`,
      });
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  };
  
  const handleSendToClient = () => {
    const planString = formatPlanToString();
    if (!planString || typeof clientId !== 'string') return;
    setPlanToSend(planString);
    router.push(`/messaging/${clientId}`);
  };

  if (!assignedPlan) {
    return (
      <SafeAreaView style={styles.screen}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Not Found</Text>
            <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={{color: theme.textPrimary, fontSize: 18}}>No Plan Found for this Client</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Plan</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={handleSendToClient}>
                <Ionicons name="send-outline" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
        </View>
      </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}