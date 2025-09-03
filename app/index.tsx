import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

export default function RoleSelectionScreen() {
  const { theme } = useTheme();
  const { login } = useAuth(); // We only need the login function now

  // The useEffect for navigation has been removed from this file.
  // All redirection logic is now handled globally in app/_layout.tsx.

  if (!theme) {
    return null; // Return a fallback while the theme is loading
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Select Your Role</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Choose your experience to get started.
        </Text>
        
        {/* This button calls login, and the root layout handles the redirect */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => login('coach-123')}
        >
          <Text style={[styles.buttonText, { color: theme.white }]}>I am a Coach</Text>
        </TouchableOpacity>
        
        {/* This button calls login for a specific client */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
          onPress={() => login('1')}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>I am a Client (Jane Doe)</Text>
        </TouchableOpacity>

        {/* Example button for another client */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
          onPress={() => login('2')}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>I am a Client (John Smith)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});