import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMealPlan } from '../../context/MealPlanContext';
import { useTheme } from '../../context/ThemeContext';

const getDynamicStyles = (theme: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: 16,
    },
    dayCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dayTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 12,
    },
    mealRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 10,
    },
    mealIcon: {
      marginRight: 16,
      marginTop: 2,
    },
    mealInfo: {
      flex: 1,
    },
    mealType: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    mealName: {
      fontSize: 18,
      color: theme.textPrimary,
      fontWeight: '500',
    },
    calories: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    placeholderText: {
        fontSize: 16,
        color: theme.textSecondary,
        fontStyle: 'italic',
    }
  });
};

// --- Sub-components for clarity ---

const MealItem = ({ type, data, styles, theme }) => {
    const icons = {
        Breakfast: 'cafe-outline',
        Lunch: 'restaurant-outline',
        Dinner: 'pizza-outline',
        Snack: 'ice-cream-outline'
    };
    
    return (
        <View style={styles.mealRow}>
            <Ionicons name={icons[type]} size={24} color={theme.primary} style={styles.mealIcon} />
            <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{type}</Text>
                {data?.name ? (
                    <Text style={styles.mealName}>{data.name}</Text>
                ) : (
                    <Text style={styles.placeholderText}>Not planned</Text>
                )}
            </View>
            {data?.calories && <Text style={styles.calories}>{data.calories} kcal</Text>}
        </View>
    );
};

const DayCard = ({ dayName, data, styles, theme }) => {
    return (
        <View style={styles.dayCard}>
            <Text style={styles.dayTitle}>{dayName}</Text>
            <MealItem type="Breakfast" data={data?.breakfast} styles={styles} theme={theme} />
            <MealItem type="Lunch" data={data?.lunch} styles={styles} theme={theme} />
            <MealItem type="Dinner" data={data?.dinner} styles={styles} theme={theme} />
            {data?.snacks?.map((snack, index) => (
                <MealItem key={`snack-${index}`} type="Snack" data={snack} styles={styles} theme={theme} />
            ))}
        </View>
    );
};

// --- Main Page Component ---

export default function WeeklyMealView() {
  const { theme } = useTheme();
  const { localMealPlan } = useMealPlan();

  if (!theme) {
    return null;
  }

  const styles = getDynamicStyles(theme);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Weekly Meal Plan',
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: { color: theme.textPrimary, fontWeight: 'bold' },
          headerBackTitleVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {daysOfWeek.map((day) => {
          const dayData = localMealPlan ? localMealPlan[day] : null;
          return <DayCard key={day} dayName={day} data={dayData} styles={styles} theme={theme} />;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}