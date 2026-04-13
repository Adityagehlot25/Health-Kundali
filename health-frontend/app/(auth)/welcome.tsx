import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Hero Graphic */}
        <View style={styles.iconContainer}>
          <Ionicons name="planet" size={120} color="#3B82F6" />
        </View>

        {/* Copy */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Health Kundali</Text>
          <Text style={styles.subtitle}>Unlock your 9-Planet biological ecosystem. Sync hardware, log smart, and let AI build your perfect day.</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 48 },
  iconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  textContainer: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', marginBottom: 12, textAlign: 'center', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  buttonContainer: { width: '100%' },
  primaryButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});