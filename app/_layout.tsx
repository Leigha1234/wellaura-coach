import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { ThemeProvider } from './context/ThemeContext';
import { TrainingPlanProvider } from './context/TrainingPlanContext';
import { WellauraProvider } from './WellauraContext';

// This component bundles all your data providers together for cleanliness.
const AppProviders = ({ children }) => {
  return (
    <CycleProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <WellauraProvider>
            <MealPlanProvider>
              <TrainingPlanProvider>
                <StatusBar style="auto" />
                {children}
              </TrainingPlanProvider>
            </MealPlanProvider>
          </WellauraProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </CycleProvider>
  );
};

// This component contains the core navigation logic for your app.
const RootLayoutNav = () => {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAppGroup = segments[0] === '(coach)' || segments[0] === '(client)';

        if (!user && inAppGroup) {
            // If the user is not signed in and tries to access a protected route,
            // redirect them to the main role selection screen.
            router.replace('/');
        } else if (user && !inAppGroup) {
            // If the user IS signed in but is currently on the role selection
            // screen, automatically redirect them to their correct dashboard.
            if (user.role === 'coach') {
                router.replace('/(coach)/(tabs)');
            } else if (user.role === 'client') {
                router.replace('/(client)');
            }
        }
    }, [user, isLoading, segments]);

    // The <Slot /> component renders the currently active child route.
    return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
            <AppProviders>
                <RootLayoutNav />
            </AppProviders>
        </AuthProvider>
    </GestureHandlerRootView>
  );
}