import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHealthStore } from '../../store/healthStore';
import * as SecureStore from 'expo-secure-store';


export default function ProfileScreen() {
  const { goals, setGoals, logoutSession } = useHealthStore();

  // Local state for the input fields so they don't update global state until we hit "Save"
  const [stepsGoal, setStepsGoal] = useState(goals.steps);
  const [waterGoal, setWaterGoal] = useState(goals.waterLiters);
  const [calorieGoal, setCalorieGoal] = useState(goals.calories);
  
  // UI State for toggles
  const [healthConnectLinked, setHealthConnectLinked] = useState(true);
  const [aiNotifications, setAiNotifications] = useState(true);

  const handleSaveGoals = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGoals({
      steps: stepsGoal,
      waterLiters: waterGoal,
      calories: calorieGoal,
    });
    Alert.alert("Targets Updated", "Your daily 9-Planet goals have been saved.");
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // 1. Delete the token from hardware memory
    await SecureStore.deleteItemAsync('userToken');
    
    // 2. Wipe the Global Brain (Gatekeeper will auto-redirect!)
    logoutSession();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* USER HEADER */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.name}>Aditya Gehlot</Text>
              <Text style={styles.subtitle}>Kundali OS Active</Text>
            </View>
          </View>

          {/* HARDWARE CONNECTIONS */}
          <Text style={styles.sectionTitle}>INTEGRATIONS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="pulse" size={24} color="#22C55E" style={styles.icon} />
                <Text style={styles.rowText}>Health Connect</Text>
              </View>
              <Switch 
                value={healthConnectLinked} 
                onValueChange={setHealthConnectLinked}
                trackColor={{ false: '#334155', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications" size={24} color="#F59E0B" style={styles.icon} />
                <Text style={styles.rowText}>AI Readiness Alerts</Text>
              </View>
              <Switch 
                value={aiNotifications} 
                onValueChange={setAiNotifications}
                trackColor={{ false: '#334155', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* DAILY TARGETS FORM */}
          <Text style={styles.sectionTitle}>DAILY TARGETS</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Steps</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={stepsGoal} 
                onChangeText={setStepsGoal} 
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Water Goal (Liters)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={waterGoal} 
                onChangeText={setWaterGoal} 
              />
            </View>

            <View style={[styles.inputGroup, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.inputLabel}>Target Calories (kcal)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={calorieGoal} 
                onChangeText={setCalorieGoal} 
              />
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoals}>
            <Text style={styles.saveButtonText}>Save Targets</Text>
          </TouchableOpacity>

          {/* DANGER ZONE: LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: '#334155' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#3B82F6', fontWeight: '600', marginTop: 4 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  rowText: { fontSize: 16, color: '#E2E8F0', fontWeight: '500' },

  inputGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  inputLabel: { fontSize: 16, color: '#E2E8F0', fontWeight: '500' },
  input: { backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', minWidth: 100, textAlign: 'center' },

  saveButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});