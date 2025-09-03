import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const getDynamicStyles = (theme: any) => {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.background,
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        profileText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.textPrimary,
            marginBottom: 40,
        },
    });
};

export default function ClientProfileScreen() {
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  
  if (!theme || !user) {
    // Wait for the theme and user to be loaded
    return null;
  }

  const styles = getDynamicStyles(theme);

  // The logout handler now only needs to call the logout function.
  // The redirection is handled globally by your app/_layout.tsx file.
  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.profileText}>Profile: {user.name}</Text>
        <Button title="Logout" onPress={handleLogout} color={theme.primary} />
      </View>
    </SafeAreaView>
  );
}