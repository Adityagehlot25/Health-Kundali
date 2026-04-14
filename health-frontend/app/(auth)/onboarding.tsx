import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router'; // Extracts params passed from register!
import { useHealthStore } from '../../store/healthStore';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { loginSession } = useHealthStore();
  
  // Grab the hidden data passed from register.tsx
  const { userId, token } = useLocalSearchParams();

  // Biometric State
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Maintain');
  const [activity, setActivity] = useState('Moderate');
  const [diet, setDiet] = useState('Any');
  const [medicalInfo, setMedicalInfo] = useState('');

  const SelectionPills = ({ options, selected, onSelect }: any) => (
    <View style={styles.pillContainer}>
      {options.map((opt: string) => (
        <TouchableOpacity 
          key={opt} 
          style={[styles.pill, selected === opt && styles.pillActive]}
          onPress={() => { Haptics.selectionAsync(); onSelect(opt); }}
        >
          <Text style={[styles.pillText, selected === opt && styles.pillTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleFinishOnboarding = async () => {
    if (!height || !weight) {
      Alert.alert("Missing Vitals", "Please provide at least your height and weight.");
      return;
    }

    try {
      const response = await fetch('http://192.168.236.232:3000/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, gender, dob, height, weight, goal, activityLevel: activity, diet, medicalInfo 
        })
      });

      const data = await response.json();

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // 🚀 UNLOCK THE APP! 
        // We save the token and call loginSession, which triggers the Gatekeeper to send us to Dashboard.
        await SecureStore.setItemAsync('userToken', token as string);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
        loginSession(token as string, data.user);

      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Build Your Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.sectionTitle}>BIOMETRICS</Text>
          <SelectionPills options={['Male', 'Female', 'Other']} selected={gender} onSelect={setGender} />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="DOB (YYYY-MM-DD)" placeholderTextColor="#64748B" value={dob} onChangeText={setDob} />
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Height (cm)" placeholderTextColor="#64748B" keyboardType="numeric" value={height} onChangeText={setHeight} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Weight (kg)" placeholderTextColor="#64748B" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          </View>

          <Text style={styles.sectionTitle}>BODY GOAL</Text>
          <SelectionPills options={['Cut (Lose Fat)', 'Maintain', 'Bulk (Gain Muscle)']} selected={goal} onSelect={setGoal} />

          <Text style={styles.sectionTitle}>ACTIVITY LEVEL</Text>
          <SelectionPills options={['Sedentary', 'Moderate', 'Highly Active']} selected={activity} onSelect={setActivity} />

          <Text style={styles.sectionTitle}>DIET PREFERENCE</Text>
          <SelectionPills options={['Any', 'Vegetarian', 'Vegan', 'Keto']} selected={diet} onSelect={setDiet} />

          <Text style={styles.sectionTitle}>MEDICAL INFO (Optional)</Text>
          <TextInput 
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} 
            placeholder="Any allergies, injuries, or chronic conditions?" 
            placeholderTextColor="#64748B" 
            multiline 
            value={medicalInfo} 
            onChangeText={setMedicalInfo} 
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleFinishOnboarding}>
            <Text style={styles.registerButtonText}>Complete Onboarding</Text>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  headerBar: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContainer: { padding: 20, paddingBottom: 60 },
  
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  input: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  pill: { backgroundColor: '#1E293B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  pillActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  pillText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },

  registerButton: { backgroundColor: '#22C55E', paddingVertical: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});