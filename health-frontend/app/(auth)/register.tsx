import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch('http://192.168.236.232:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // 🚀 MAGIC STEP: Send them to onboarding WITH their new ID and Token!
        router.push({
          pathname: '/(auth)/onboarding',
          params: { userId: data.user.id, token: data.token }
        });

      } else {
        Alert.alert("Registration Failed", data.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="planet" size={60} color="#3B82F6" />
            <Text style={styles.title}>Secure Account</Text>
            <Text style={styles.subtitle}>Step 1: Set up your credentials.</Text>
          </View>

          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#64748B" autoCapitalize="words" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword} />
            
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Continue to Biometrics</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 24, zIndex: 10, padding: 8, backgroundColor: '#1E293B', borderRadius: 12 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 8 },
  form: { width: '100%' },
  input: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  registerButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});