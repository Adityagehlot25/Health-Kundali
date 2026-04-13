import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useHealthStore } from '../../store/healthStore';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loginSession } = useHealthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch('http://192.168.236.232:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Save token securely to the phone's hardware
        await SecureStore.setItemAsync('userToken', data.token);
        // Update the Global Brain!
        loginSession(data.token, data.user);
      } else {
        Alert.alert("Login Failed", data.error);
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
          
          <View style={styles.header}>
            <Ionicons name="person-circle" size={80} color="#3B82F6" />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your details to access your Kundali.</Text>
          </View>

          <View style={styles.form}>
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
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 8 },
  form: { width: '100%' },
  input: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  loginButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#94A3B8', fontSize: 16 },
  footerLink: { color: '#3B82F6', fontSize: 16, fontWeight: 'bold' }
});