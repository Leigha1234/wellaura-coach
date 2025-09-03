import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// This mock data can be expanded or moved to a central library file later.
// It serves as the source for your training plan templates.
const trainingPlanTemplates = [
  {
    id: 'tpl_1',
    name: 'Full Body Strength',
    focus: 'Hypertrophy & Strength',
    duration: '3 days/week',
  },
  {
    id: 'tpl_2',
    name: 'Push Pull Legs (PPL)',
    focus: 'Classic Bodybuilding Split',
    duration: '6 days/week',
  },
  {
    id: 'tpl_4',
    name: 'Marathon Prep',
    focus: 'Running & Endurance',
    duration: '5 days/week',
  },
];

const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20, // Added padding top for better spacing
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    container: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 16,
      marginTop: 24,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    cardFocus: {
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: 4,
    },
    cardDetails: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 12,
    },
    actionButton: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.white,
    },
  });
};

export default function TrainingPlanPage() {
  const { theme } = useTheme();
  const router = useRouter();

  if (!theme) {
    return null; // Return a fallback while the theme is loading
  }

  const styles = getDynamicStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity 
          style={styles.actionButton} 
          // This button navigates to the builder page you've already created
          onPress={() => router.push('/(coach)/(tabs)/training-plan/builder')}
        >
          <Ionicons name="add-circle-outline" size={22} color={theme.white} />
          <Text style={styles.actionButtonText}>Create New Plan</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>My Templates</Text>

        {trainingPlanTemplates.map((template) => (
          // In the future, this could navigate to a template editor
          <TouchableOpacity key={template.id} activeOpacity={0.7}>
            <View style={styles.card}>
              <Text style={styles.cardName}>{template.name}</Text>
              <Text style={styles.cardFocus}>{template.focus}</Text>
              <Text style={styles.cardDetails}>{template.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}