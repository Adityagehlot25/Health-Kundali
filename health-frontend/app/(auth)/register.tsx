import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useHealthStore } from '../../store/healthStore';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loginSession } = useHealthStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
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
        // Save token securely to the phone's hardware
        await SecureStore.setItemAsync('userToken', data.token);
        // Update the Global Brain!
        loginSession(data.token, data.user);
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
            <Text style={styles.title}>Join Kundali</Text>
            <Text style={styles.subtitle}>Create your 9-Planet biological profile.</Text>
          </View>

          <View style={styles.form}>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor="#64748B"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Email Address" 
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  registerButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#94A3B8', fontSize: 16 },
  footerLink: { color: '#3B82F6', fontSize: 16, fontWeight: 'bold' }
});