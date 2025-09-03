import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  if (!theme) {
    // Return a fallback or null while the theme is loading
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides the default header for all tab screens
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarShowLabel: true, // Shows the title text below the icon
      }}
    >
      {/* --- These screens WILL appear in your tab bar --- */}
      <Tabs.Screen
        name="index" // Links to app/(tabs)/index.tsx
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout" // Links to app/(tabs)/workout.tsx
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
        }}
      />
       <Tabs.Screen
        name="clientdash" // Corrected: Links to app/(tabs)/clientdash.tsx
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Links to app/(tabs)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* --- These screens are part of the layout but are HIDDEN from the tab bar --- */}
      {/* By setting href to null, these pages can be navigated to but won't show up in the tab bar */}
      <Tabs.Screen name="client/[id]" options={{ href: null }} />
      <Tabs.Screen name="messaging/[id]" options={{ href: null }} />
      <Tabs.Screen name="training-plan" options={{ href: null }} />
    </Tabs>
  );
}