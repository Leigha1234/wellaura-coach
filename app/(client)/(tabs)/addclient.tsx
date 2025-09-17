import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const getDynamicStyles = (theme: any) => { /* ... Styles from your login/signup pages ... */ };

export default function AddClientPage() {
    const { createClientAccount } = useAuth(); // We will create this function next
    const { theme } = useTheme();
    const router = useRouter();
    const styles = getDynamicStyles(theme);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAddClient = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        // This function will create the client's account and link it to the coach
        await createClientAccount(email, password, name);
        Alert.alert("Success", `${name} has been added as a client.`, [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    if (!theme) return null;

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.title}>Add New Client</Text>
                <Text style={styles.subtitle}>Create an account for your new client. They can use these details to log in.</Text>

                <TextInput style={styles.input} placeholder="Client's Full Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Client's Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Temporary Password" value={password} onChangeText={setPassword} secureTextEntry />
                
                <TouchableOpacity style={styles.button} onPress={handleAddClient}>
                    <Text style={styles.buttonText}>Add Client</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}