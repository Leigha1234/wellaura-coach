import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const getDynamicStyles = (theme: any) => {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.background },
        container: { flex: 1, justifyContent: 'center', padding: 20 },
        title: { fontSize: 32, fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', marginBottom: 40, },
        input: { backgroundColor: theme.surface, color: theme.textPrimary, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 16, },
        button: { backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: 'center', },
        buttonText: { fontSize: 16, fontWeight: 'bold', color: theme.white, },
        secondaryText: { textAlign: 'center', color: theme.textSecondary, marginTop: 20 },
        linkText: { color: theme.primary, fontWeight: 'bold' },
    });
};

export default function LoginPage() {
    const { login } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const styles = getDynamicStyles(theme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }
        await login(email, password);
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text style={styles.secondaryText}>
                        Don't have an account?{' '}
                        <Text style={styles.linkText}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}