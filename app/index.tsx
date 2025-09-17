import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  if (!theme) return null;
  
  const styles = getDynamicStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* You can add a logo or branding image here */}
        <Text style={styles.title}>Wellaura Coach</Text>
        <Text style={styles.subtitle}>Your all-in-one coaching platform.</Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/signup')} // Navigate to sign up page
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/login')} // Navigate to login page
        >
          <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getDynamicStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 18, color: theme.textSecondary, marginBottom: 60, textAlign: 'center' },
  primaryButton: { width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: theme.primary, marginBottom: 16 },
  primaryButtonText: { fontSize: 18, fontWeight: '600', color: theme.white },
  secondaryButton: { width: '100%', padding: 18, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { fontSize: 18, fontWeight: '600', color: theme.primary },
});