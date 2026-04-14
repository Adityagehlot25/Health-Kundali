import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHealthStore } from '../../store/healthStore';

// Mini component for the hardware stat cards
const StatCard = ({ icon, title, value, color }: any) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={color} style={{ marginBottom: 8 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [smartLogText, setSmartLogText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  
  // 🧠 Connect to the Global Brain (Now pulling hardwareMetrics too!)
  const { manualData, setManualData, userData, hardwareMetrics } = useHealthStore();

  const parseSmartLog = async () => {
    if (!smartLogText) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsParsing(true);
    
    try {
      const response = await fetch('http://192.168.236.232:3000/api/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: smartLogText, userData }), 
      });

      const result = await response.json();

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newData = result.data;
        
        // 1. Calculate the New Combined Memory
        const updatedManualData = {
          nutrition: {
            waterLiters: manualData.nutrition.waterLiters + (newData?.nutrition?.waterLiters || 0),
            calories: manualData.nutrition.calories + (newData?.nutrition?.calories || 0),
            proteinGrams: manualData.nutrition.proteinGrams + (newData?.nutrition?.proteinGrams || 0),
            carbsGrams: manualData.nutrition.carbsGrams + (newData?.nutrition?.carbsGrams || 0),
            fiberGrams: manualData.nutrition.fiberGrams + (newData?.nutrition?.fiberGrams || 0),
            foodItems: newData?.nutrition?.foodItems?.length > 0 ? [...manualData.nutrition.foodItems, ...newData.nutrition.foodItems] : manualData.nutrition.foodItems
          },
          gym: {
            completedToday: manualData.gym.completedToday || (newData?.gym?.completedWorkout || false),
            split: (newData?.gym?.split && newData?.gym?.split !== "None") ? newData.gym.split : manualData.gym.split,
            workoutLogs: newData?.gym?.workoutLogs?.length > 0 ? [...manualData.gym.workoutLogs, ...newData.gym.workoutLogs] : manualData.gym.workoutLogs
          },
          cycle: {
            isMenstruating: manualData.cycle.isMenstruating || (newData?.cycle?.isMenstruating || false),
            symptoms: (newData?.cycle?.symptoms && newData?.cycle?.symptoms !== "None") ? newData.cycle.symptoms : manualData.cycle.symptoms,
          },
          injuries: {
            active: manualData.injuries.active || (newData?.injuries?.active || false),
            location: (newData?.injuries?.location && newData?.injuries?.location !== "None") ? newData.injuries.location : manualData.injuries.location,
            notes: (newData?.injuries?.notes && newData?.injuries?.notes !== "None") ? newData.injuries.notes : manualData.injuries.notes,
          }
        };

        // 2. Update the Phone's Brain
        setManualData(() => updatedManualData);
        
        // 3. 🚀 BACK UP TO MONGODB IMMEDIATELY
        await fetch('http://192.168.236.232:3000/api/save-journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData?.id, manualInputs: updatedManualData })
        });
        
        setSmartLogText(""); 
      } else {
        Alert.alert("AI Error", "Gemini couldn't understand that log.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not reach the server.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Data & Journal</Text>
            <Text style={styles.subtitle}>Your complete biological snapshot for today.</Text>
          </View>

          {/* ⌚ HARDWARE METRICS GRID */}
          <Text style={styles.sectionTitle}>DEVICE METRICS</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="footsteps" title="Steps" value={hardwareMetrics.steps} color="#10B981" />
            <StatCard icon="moon" title="Sleep" value={hardwareMetrics.sleep} color="#8B5CF6" />
            <StatCard icon="heart" title="Heart Rate" value={hardwareMetrics.hr} color="#EF4444" />
            <StatCard icon="water" title="SpO2" value={hardwareMetrics.spo2} color="#06B6D4" />
            <StatCard icon="thermometer" title="Temp" value={hardwareMetrics.temp} color="#F59E0B" />
            <StatCard icon="pulse" title="BP" value={hardwareMetrics.bp} color="#3B82F6" />
          </View>

          {/* 📝 SMART JOURNAL INPUT */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SMART JOURNAL</Text>
          <View style={styles.logContainer}>
            <TextInput
              style={styles.logInput}
              placeholder="e.g., 'Ate 3 slices of pizza. Knee hurts after running 5k...'"
              placeholderTextColor="#64748B"
              multiline={true}
              value={smartLogText}
              onChangeText={setSmartLogText}
            />
            <TouchableOpacity style={styles.parseButton} onPress={parseSmartLog} disabled={isParsing}>
              {isParsing ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.parseButtonText}>Extract to Memory</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 🧠 EXTRACTED MEMORY PREVIEW */}
          <View style={styles.memoryCard}>
            <Text style={styles.memoryTitle}>🧠 Extracted Daily Log:</Text>
            <Text style={styles.memoryText}>🔥 Calories: {manualData.nutrition.calories} kcal</Text>
            <Text style={styles.memoryText}>🥩 Protein: {manualData.nutrition.proteinGrams}g</Text>
            <Text style={styles.memoryText}>💧 Water: {manualData.nutrition.waterLiters} L</Text>
            <Text style={styles.memoryText}>🍎 Food Log: {manualData.nutrition.foodItems.join(", ") || "None"}</Text>
            <Text style={styles.memoryText}>💪 Gym Split: {manualData.gym.split !== "None" ? manualData.gym.split : "Rest"}</Text>
            <Text style={styles.memoryText}>🩹 Injuries: {manualData.injuries.location || "None"}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 8 },
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },

  // New Grid Styles
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: { width: '31%', backgroundColor: '#1E293B', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  statTitle: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  
  logContainer: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  logInput: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, fontSize: 16, color: '#FFFFFF', minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  parseButton: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  parseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  memoryCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  memoryTitle: { fontSize: 18, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 16 },
  memoryText: { fontSize: 16, color: '#E2E8F0', marginBottom: 8, fontWeight: '500' },
});