import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const getDynamicStyles = (theme: any) => {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.background },
        container: { flex: 1, justifyContent: 'center', padding: 20 },
        title: { fontSize: 32, fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', marginBottom: 16, },
        subtitle: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 40, },
        input: { backgroundColor: theme.surface, color: theme.textPrimary, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 16, },
        button: { backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, },
        buttonText: { fontSize: 16, fontWeight: 'bold', color: theme.white, },
        secondaryText: { textAlign: 'center', color: theme.textSecondary, marginTop: 20 },
        linkText: { color: theme.primary, fontWeight: 'bold' },
    });
};

export default function SignUpPage() {
    const { signUpCoach } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    
    if (!theme) return null;

    const styles = getDynamicStyles(theme);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        // This now calls the specific function for creating a coach account
        await signUpCoach(email, password, name);
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.title}>Coach Sign Up</Text>
                <Text style={styles.subtitle}>Create your account to start managing clients.</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
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
                
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Create Coach Account</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.secondaryText}>
                        Already have an account?{' '}
                        <Text style={styles.linkText}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}