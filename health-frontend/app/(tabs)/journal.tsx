import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../../store/healthStore';

export default function JournalScreen() {
  const [smartLogText, setSmartLogText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  
  // Connect to our Global Brain
  const { manualData, setManualData } = useHealthStore();

  const parseSmartLog = async () => {
    if (!smartLogText) return;
    try {
      setIsParsing(true);
      const response = await fetch('http://192.168.236.232:3000/api/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: smartLogText }),
      });

      const result = await response.json();

      if (result.success) {
        const newData = result.data;
        
        // Update the GLOBAL store instead of local state!
        setManualData((prevData: any) => ({
          nutrition: {
            waterLiters: prevData.nutrition.waterLiters + (newData?.nutrition?.waterLiters || 0),
            calories: prevData.nutrition.calories + (newData?.nutrition?.calories || 0),
            proteinGrams: prevData.nutrition.proteinGrams + (newData?.nutrition?.proteinGrams || 0),
            carbsGrams: prevData.nutrition.carbsGrams + (newData?.nutrition?.carbsGrams || 0),
            fiberGrams: prevData.nutrition.fiberGrams + (newData?.nutrition?.fiberGrams || 0),
            foodItems: newData?.nutrition?.foodItems?.length > 0 ? [...prevData.nutrition.foodItems, ...newData.nutrition.foodItems] : prevData.nutrition.foodItems
          },
          gym: {
            completedToday: prevData.gym.completedToday || (newData?.gym?.completedWorkout || false),
            split: (newData?.gym?.split && newData?.gym?.split !== "None") ? newData.gym.split : prevData.gym.split,
            workoutLogs: newData?.gym?.workoutLogs?.length > 0 ? [...prevData.gym.workoutLogs, ...newData.gym.workoutLogs] : prevData.gym.workoutLogs
          },
          cycle: {
            isMenstruating: prevData.cycle.isMenstruating || (newData?.cycle?.isMenstruating || false),
            symptoms: (newData?.cycle?.symptoms && newData?.cycle?.symptoms !== "None") ? newData.cycle.symptoms : prevData.cycle.symptoms,
          },
          injuries: {
            active: prevData.injuries.active || (newData?.injuries?.active || false),
            location: (newData?.injuries?.location && newData?.injuries?.location !== "None") ? newData.injuries.location : prevData.injuries.location,
            notes: (newData?.injuries?.notes && newData?.injuries?.notes !== "None") ? newData.injuries.notes : prevData.injuries.notes,
          }
        }));
        Alert.alert("Success", "Log saved! Macros and stats updated.");
        setSmartLogText(""); 
      } else {
        Alert.alert("Error", "AI couldn't understand that log.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Is the backend running?");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.title}>Smart Journal</Text>
            <Text style={styles.subtitle}>Log your meals, workouts, and body feels naturally.</Text>
          </View>

          <View style={styles.logContainer}>
            <TextInput
              style={styles.logInput}
              placeholder="e.g., 'Ate 2 eggs and a toast. Knee hurts a bit after my 5k run...'"
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

          {/* Live Global Memory Preview */}
          <View style={styles.memoryCard}>
            <Text style={styles.memoryTitle}>🧠 Live AI Memory:</Text>
            <Text style={styles.memoryText}>🔥 Calories: {manualData.nutrition.calories} kcal</Text>
            <Text style={styles.memoryText}>💧 Water: {manualData.nutrition.waterLiters} L</Text>
            <Text style={styles.memoryText}>🍎 Food Log: {manualData.nutrition.foodItems.join(", ") || "None"}</Text>
            <Text style={styles.memoryText}>💪 Gym: {manualData.gym.split !== "None" ? manualData.gym.split : "Rest"}</Text>
            <Text style={styles.memoryText}>🩹 Injuries: {manualData.injuries.location || "None"}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 8 },
  
  logContainer: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  logInput: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, fontSize: 16, color: '#FFFFFF', minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  parseButton: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  parseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  memoryCard: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  memoryTitle: { fontSize: 16, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 12 },
  memoryText: { fontSize: 14, color: '#94A3B8', marginBottom: 6 },
});